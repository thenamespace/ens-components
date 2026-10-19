import type { Page } from "@playwright/test";
import {
  type Address,
  type Hash,
  type Hex,
  type PublicClient,
  type WalletClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  hexToBigInt,
  http,
  numberToHex,
  parseAbi,
  concatHex,
} from "viem";
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { injectTestWallet } from "./inject";

/**
 * How the wallet answers EIP-5792 batching:
 * - "sequential": reports no batching support, so the components send one transaction per call.
 * - "atomic": reports atomic support and executes `wallet_sendCalls` as one EIP-7702
 *   transaction through eth-infinitism's Simple7702Account (EntryPoint v0.8).
 */
export type BatchMode = "sequential" | "atomic";

const SIMPLE_7702_ACCOUNT: Address = "0x4Cd241E8d1510e30b2076397afc7508Ae59C66c9";
const DELEGATION_PREFIX: Hex = "0xef0100";
const simple7702Abi = parseAbi([
  "struct Call { address target; uint256 value; bytes data; }",
  "function executeBatch(Call[] calls)",
]);

const USER_REJECTED = { code: 4001, message: "User rejected the request." };
const UNSUPPORTED = (method: string) => ({ code: 4200, message: `${method} is not supported.` });

type RpcError = { code: number; message: string; data?: unknown };
type RpcResponse = { result?: unknown; error?: RpcError };
type CallParam = { to?: Address; data?: Hex; value?: Hex };

/** Methods that would show the user a confirmation prompt in a real wallet. */
const PROMPTED = new Set([
  "eth_sendTransaction",
  "wallet_sendCalls",
  "personal_sign",
  "eth_signTypedData_v4",
]);

/**
 * An EIP-1193 wallet backed by a private key, driven from the Playwright process.
 * Every prompt is approved automatically unless a test calls `rejectNext()`.
 */
export class TestWallet {
  readonly account: PrivateKeyAccount;
  readonly publicClient: PublicClient;
  readonly walletClient: WalletClient;
  /** Every request the app made, in order, for asserting on what was sent. */
  readonly requests: { method: string; params: unknown[]; result?: unknown; error?: RpcError }[] = [];

  private connected = false;
  private rejections = 0;
  private pages = new Set<Page>();
  private sent: Hash[] = [];

  constructor(
    privateKey: Hex,
    rpcUrl: string,
    readonly batchMode: BatchMode = "sequential",
  ) {
    this.account = privateKeyToAccount(privateKey);
    const transport = http(rpcUrl);
    this.publicClient = createPublicClient({ chain: sepolia, transport });
    this.walletClient = createWalletClient({ account: this.account, chain: sepolia, transport });
  }

  get address(): Address {
    return this.account.address;
  }

  /** The next prompted request (transaction, batch or signature) is rejected like a user would. */
  rejectNext() {
    this.rejections += 1;
  }

  /** Requests that put a transaction on chain: one per `eth_sendTransaction` or `wallet_sendCalls`. */
  sentTransactions() {
    return this.requests.filter((r) => r.method === "eth_sendTransaction" || r.method === "wallet_sendCalls");
  }

  async install(page: Page) {
    this.pages.add(page);
    await page.exposeBinding("__e2eWalletRequest", (_source, payload: { method: string; params: unknown[] }) =>
      this.handle(payload.method, payload.params),
    );
    await page.addInitScript(injectTestWallet, {
      uuid: "6b0e2f8c-4a1f-4c63-9a55-0e2e0e2e0e2e",
      name: "E2E Wallet",
      rdns: "dev.namespace.e2e",
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E",
    });
  }

  private async emit(event: string, data: unknown) {
    await Promise.all(
      [...this.pages].map((page) =>
        page.evaluate(([e, d]) => (window as any).__e2eWalletEmit?.(e, d), [event, data] as const).catch(() => {}),
      ),
    );
  }

  private async handle(method: string, params: unknown[]): Promise<RpcResponse> {
    const entry: (typeof this.requests)[number] = { method, params };
    this.requests.push(entry);
    const response = await this.respond(method, params);
    Object.assign(entry, response);
    return response;
  }

  private async respond(method: string, params: unknown[]): Promise<RpcResponse> {
    if (PROMPTED.has(method) && this.rejections > 0) {
      this.rejections -= 1;
      return { error: USER_REJECTED };
    }
    try {
      return { result: await this.dispatch(method, params) };
    } catch (e: any) {
      const cause = e?.cause ?? e;
      return {
        error: {
          // -32000 (invalid input) is what nodes and wallets return for failing or
          // underfunded transactions; -32603 would make viem retry the request.
          code: typeof cause?.code === "number" ? cause.code : -32000,
          message: e?.shortMessage ?? e?.message ?? "Internal error",
          data: cause?.data,
        },
      };
    }
  }

  private async dispatch(method: string, params: any[]): Promise<unknown> {
    switch (method) {
      case "eth_requestAccounts":
        if (!this.connected) {
          this.connected = true;
          await this.emit("connect", { chainId: numberToHex(sepolia.id) });
        }
        return [this.address];
      case "eth_accounts":
        return this.connected ? [this.address] : [];
      case "eth_chainId":
        return numberToHex(sepolia.id);
      case "net_version":
        return String(sepolia.id);
      case "wallet_requestPermissions":
        this.connected = true;
        return [{ parentCapability: "eth_accounts" }];
      case "wallet_getPermissions":
        return this.connected ? [{ parentCapability: "eth_accounts" }] : [];
      case "wallet_revokePermissions":
        this.connected = false;
        await this.emit("accountsChanged", []);
        return null;
      case "wallet_switchEthereumChain":
        if (Number(params[0]?.chainId) !== sepolia.id)
          throw Object.assign(new Error("This test wallet only supports Sepolia."), { code: 4902 });
        return null;
      case "wallet_addEthereumChain":
        return null;

      case "personal_sign":
        return this.account.signMessage({ message: { raw: params[0] as Hex } });
      case "eth_signTypedData_v4": {
        const { domain, types, primaryType, message } = JSON.parse(params[1]);
        const { EIP712Domain: _, ...rest } = types;
        return this.account.signTypedData({ domain, types: rest, primaryType, message });
      }

      case "eth_sendTransaction":
        return this.sendTransaction(params[0]);
      case "wallet_getCapabilities":
        if (this.batchMode !== "atomic") throw Object.assign(new Error(UNSUPPORTED(method).message), UNSUPPORTED(method));
        return { [numberToHex(sepolia.id)]: { atomic: { status: "supported" } } };
      case "wallet_sendCalls":
        if (this.batchMode !== "atomic") throw Object.assign(new Error(UNSUPPORTED(method).message), UNSUPPORTED(method));
        return { id: await this.sendAtomicBatch(params[0].calls) };
      case "wallet_getCallsStatus":
        return this.getCallsStatus(params[0]);
      case "wallet_showCallsStatus":
        return null;

      default:
        // Reads (eth_call, eth_estimateGas, eth_getBalance, receipts, …) go straight to the node.
        return this.publicClient.request({ method: method as any, params: params as any });
    }
  }

  /**
   * Waits until this wallet's own RPC has mined everything it sent before. The app
   * waits for receipts on its own RPC, which can be a block ahead; estimating the next
   * call against a node that hasn't seen e.g. an approval yet would make it revert.
   */
  private async settlePrevious() {
    await Promise.all(this.sent.map((hash) => this.publicClient.waitForTransactionReceipt({ hash })));
    this.sent = [];
  }

  private async sendTransaction(tx: { to?: Address; data?: Hex; value?: Hex; gas?: Hex }): Promise<Hash> {
    await this.settlePrevious();
    const hash = await this.walletClient.sendTransaction({
      account: this.account,
      chain: sepolia,
      to: tx.to,
      data: tx.data,
      value: tx.value ? hexToBigInt(tx.value) : undefined,
      gas: tx.gas ? hexToBigInt(tx.gas) : undefined,
    });
    this.sent.push(hash);
    return hash;
  }

  /**
   * Runs all calls in one transaction from the EOA to itself. On the first batch the
   * EOA is delegated to Simple7702Account with an EIP-7702 authorization; after that
   * the delegation persists and later batches reuse it.
   */
  private async sendAtomicBatch(calls: CallParam[]): Promise<Hash> {
    await this.settlePrevious();
    const code = await this.publicClient.getCode({ address: this.address });
    const delegated = code?.toLowerCase() === concatHex([DELEGATION_PREFIX, SIMPLE_7702_ACCOUNT]).toLowerCase();
    const authorizationList = delegated
      ? undefined
      : [await this.walletClient.signAuthorization({ account: this.account, contractAddress: SIMPLE_7702_ACCOUNT, executor: "self" })];

    const hash = await this.walletClient.sendTransaction({
      account: this.account,
      chain: sepolia,
      to: this.address,
      data: encodeFunctionData({
        abi: simple7702Abi,
        functionName: "executeBatch",
        args: [
          calls.map((c) => ({
            target: c.to!,
            value: c.value ? hexToBigInt(c.value) : 0n,
            data: c.data ?? "0x",
          })),
        ],
      }),
      authorizationList,
    });
    this.sent.push(hash);
    return hash;
  }

  /** The batch id is the transaction hash, so its status is that transaction's receipt. */
  private async getCallsStatus(id: Hash) {
    const receipt = (await this.publicClient.request({
      method: "eth_getTransactionReceipt",
      params: [id],
    })) as { status: Hex } | null;
    return {
      version: "2.0.0",
      id,
      chainId: numberToHex(sepolia.id),
      atomic: true,
      status: receipt === null ? 100 : receipt.status === "0x1" ? 200 : 500,
      receipts: receipt ? [receipt] : [],
    };
  }
}
