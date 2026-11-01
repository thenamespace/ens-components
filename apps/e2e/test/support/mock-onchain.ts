import { expect, type Page } from "@playwright/test";
import { injectTestWallet } from "../wallet/inject";
import {
  decodeFunctionData,
  encodeFunctionResult,
  keccak256,
  multicall3Abi,
  parseAbi,
  toBytes,
  zeroAddress,
  type Hex,
} from "viem";

const registry = "0x3333333333333333333333333333333333333333";
export const owner = "0x2222222222222222222222222222222222222222";
const resolver = "0x1Ad304327d1477114Abe88820Fa7ddDC9A72f612";
const reservation = "0x7f13C79FB772BA42177f4be6Dc9e692C1f3acD11";
const id = keccak256(toBytes("activation"));
export const abi = parseAbi([
  "function activationIdOf(bytes32 parent) view returns (bytes32)",
  "function activations(bytes32 id) view returns (bool,uint64,uint8,uint8,address,bytes32,address,bytes,address)",
  "function featuresOf(bytes32 id) view returns (address[])",
  "function getSubnameResolver(bytes32 id,address requested) view returns (address)",
  "function getSubregistry(string label) view returns (address)",
  "function getExpiry(uint256 id) view returns (uint64)",
  "function getOwner(uint256 id) view returns (address)",
  "function getStatus(uint256 id) view returns (uint8)",
  "function hasRootRoles(uint256 roles,address account) view returns (bool)",
  "function hasRoles(uint256 id,uint256 roles,address account) view returns (bool)",
  "function supportsInterface(bytes4 id) view returns (bool)",
  "function roots(bytes32 id) view returns (bytes32)",
  "struct MintQuote { bool canMint; uint256 price; uint8 denied; uint8 expiration; bytes32 activationId; address subregistry; }",
  "function quoteMint(string parent,string label,address minter,uint64 duration,bytes claims) view returns (MintQuote)",
  "struct RenewalQuote { bool canRenew; uint256 price; uint8 denied; bytes32 activationId; address subregistry; }",
  "function quoteRenewal(string parent,string label,address renewer,uint64 duration,bytes claims) view returns (RenewalQuote)",
  "function quotePayment(uint256 usd,address token) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function getEthBalance(address owner) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)",
  "struct RegisterRequest { string parentLabel; string label; address owner; address resolver; uint64 duration; bytes extraData; }",
  "function register(RegisterRequest request,address paymentToken) payable returns (uint256)",
  "struct RenewRequest { string parentLabel; string label; uint64 duration; bytes extraData; }",
  "function renew(RenewRequest request,address paymentToken) payable returns (uint64)",
]);

export async function mockChain(
  page: Page,
  state: {
    active?: boolean;
    status?: number;
    reservation?: boolean;
    permanent?: boolean;
    paymentError?: boolean;
    priceUsdRaw?: bigint;
    paymentIncreaseAfterApproval?: boolean;
    accountDependent?: boolean;
    authorized?: boolean;
    ownerMissing?: boolean;
    rejectTransaction?: boolean;
    transactionReverted?: boolean;
    simulationFailed?: boolean;
  } = {}
) {
  let allowance = 0n;
  const calls: string[] = [];
  const rpcMethods: string[] = [];
  const sent: { to: string; data: Hex; value?: Hex }[] = [];
  const hash = keccak256(toBytes("mock transaction"));
  const call = (data: Hex): Hex => {
    if (data.startsWith("0x82ad56cb")) {
      const decoded = decodeFunctionData({ abi: multicall3Abi, data });
      if (decoded.functionName !== "aggregate3")
        throw new Error("Unexpected multicall");
      return encodeFunctionResult({
        abi: multicall3Abi,
        functionName: "aggregate3",
        result: decoded.args[0].map(entry => {
          try {
            return { success: true, returnData: call(entry.callData) };
          } catch {
            return { success: false, returnData: "0x" as const };
          }
        }),
      });
    }
    const { functionName } = decodeFunctionData({ abi, data });
    calls.push(functionName);
    let result: unknown;
    switch (functionName) {
      case "activationIdOf":
        result = id;
        break;
      case "activations":
        result = [
          state.active ?? true,
          0n,
          0,
          0,
          zeroAddress,
          keccak256(toBytes("arthy0")),
          zeroAddress,
          "0x",
          registry,
        ];
        break;
      case "featuresOf":
        result = state.reservation
          ? [reservation]
          : state.accountDependent
            ? [owner]
            : [];
        break;
      case "getSubnameResolver":
        result = resolver;
        break;
      case "getSubregistry":
        result = registry;
        break;
      case "getExpiry":
        result = state.permanent ? (1n << 64n) - 1n : 2_100_000_000n;
        break;
      case "getOwner":
        result = state.ownerMissing ? zeroAddress : owner;
        break;
      case "getStatus":
        result = state.status ?? 0;
        break;
      case "hasRootRoles":
      case "hasRoles":
        result = state.authorized ?? true;
        break;
      case "supportsInterface":
        result = true;
        break;
      case "roots":
        result = keccak256(toBytes("reservation"));
        break;
      case "quoteMint":
        result = {
          canMint: true,
          price: state.priceUsdRaw ?? 1_000_000_000_000n,
          denied: 0,
          expiration: 0,
          activationId: id,
          subregistry: registry,
        };
        break;
      case "quoteRenewal":
        result = {
          canRenew: true,
          price: state.priceUsdRaw ?? 1_000_000_000_000n,
          denied: 0,
          activationId: id,
          subregistry: registry,
        };
        break;
      case "getEthBalance":
      case "balanceOf":
        result = 10n ** 24n;
        break;
      case "allowance":
        result = allowance;
        break;
      case "quotePayment":
        if (state.paymentError) throw new Error("Payment RPC unavailable");
        result =
          state.paymentIncreaseAfterApproval && allowance > 0n
            ? 2_000_000n
            : 1_000_000n;
        break;
      default:
        throw new Error(`Unexpected contract call ${functionName}`);
    }
    return encodeFunctionResult({ abi, functionName, result: result as never });
  };
  const receipt = {
    transactionHash: hash,
    transactionIndex: "0x0",
    blockHash: id,
    blockNumber: "0x123",
    from: owner,
    to: registry,
    cumulativeGasUsed: "0x186a0",
    gasUsed: "0x186a0",
    effectiveGasPrice: "0x3b9aca00",
    contractAddress: null,
    logs: [],
    logsBloom: `0x${"0".repeat(512)}`,
    type: "0x2",
  };
  const answer = (rpc: { id?: number; method: string; params?: unknown[] }) => {
    rpcMethods.push(rpc.method);
    let result: unknown;
    try {
      switch (rpc.method) {
        case "eth_chainId":
          result = "0x1";
          break;
        case "eth_blockNumber":
          result = "0x123";
          break;
        case "eth_getCode":
          result = "0x6000";
          break;
        case "eth_getBalance":
          result = "0x3635c9adc5dea00000";
          break;
        case "eth_gasPrice":
        case "eth_maxPriorityFeePerGas":
          result = "0x3b9aca00";
          break;
        case "eth_getBlockByNumber":
          result = {
            number: "0x123",
            hash: id,
            timestamp: "0x70000000",
            baseFeePerGas: "0x3b9aca00",
            transactions: [],
            gasLimit: "0x1c9c380",
            gasUsed: "0x186a0",
          };
          break;
        case "eth_feeHistory":
          result = {
            oldestBlock: "0x120",
            baseFeePerGas: ["0x3b9aca00", "0x3b9aca00"],
            gasUsedRatio: [0.5],
            reward: [["0x3b9aca00"]],
          };
          break;
        case "eth_getTransactionReceipt":
          result = {
            ...receipt,
            status: state.transactionReverted ? "0x0" : "0x1",
          };
          break;
        case "eth_simulateV1": {
          const input = rpc.params?.[0] as {
            blockStateCalls: { calls: unknown[] }[];
          };
          result = input.blockStateCalls.map(block => ({
            number: "0x124",
            hash: id,
            timestamp: "0x70000000",
            gasLimit: "0x1c9c380",
            gasUsed: "0x186a0",
            baseFeePerGas: "0x3b9aca00",
            transactions: [],
            calls: block.calls.map(() => ({
              status: state.simulationFailed ? "0x0" : "0x1",
              gasUsed: "0x186a0",
              returnData: "0x",
              logs: [],
            })),
          }));
          break;
        }
        case "eth_call":
          result = call((rpc.params?.[0] as { data: Hex }).data);
          break;
        default:
          throw new Error(`Mock method not supported: ${rpc.method}`);
      }
      return { jsonrpc: "2.0", id: rpc.id, result };
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: rpc.id,
        error: {
          code: -32000,
          message:
            error instanceof Error
              ? error.message
              : "Mock contract read failed",
        },
      };
    }
  };
  await page.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost")
      return route.continue();
    if (url.hostname.includes("manager.namespace.ninja")) {
      return route.fulfill({
        status: url.pathname.includes("/proof") ? 503 : 200,
        headers: { "access-control-allow-origin": "*" },
        contentType: "application/json",
        body: url.pathname.includes("/proof")
          ? '{"message":"Unavailable"}'
          : "[]",
      });
    }
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(
          Array.isArray(body) ? body.map(answer) : answer(body)
        ),
      });
    }
    return route.fulfill({ contentType: "application/json", body: "{}" });
  });
  let connected = false;
  await page.exposeBinding(
    "__e2eWalletRequest",
    (_source, request: { method: string; params: unknown[] }) => {
      switch (request.method) {
        case "eth_requestAccounts":
          connected = true;
          return { result: [owner] };
        case "eth_accounts":
          return { result: connected ? [owner] : [] };
        case "eth_chainId":
          return { result: "0x1" };
        case "wallet_requestPermissions":
          connected = true;
          return { result: [{ parentCapability: "eth_accounts" }] };
        case "wallet_getPermissions":
          return {
            result: connected ? [{ parentCapability: "eth_accounts" }] : [],
          };
        case "wallet_getCapabilities":
          return { error: { code: 4200, message: "Batching not supported" } };
        case "eth_sendTransaction":
          if (state.rejectTransaction)
            return {
              error: { code: 4001, message: "User rejected the request." },
            };
          const transaction = request.params[0] as (typeof sent)[number];
          sent.push(transaction);
          const decoded = decodeFunctionData({ abi, data: transaction.data });
          if (decoded.functionName === "approve" && !state.transactionReverted)
            allowance = decoded.args[1];
          return { result: hash };
        default:
          return answer(request);
      }
    }
  );
  await page.addInitScript(injectTestWallet, {
    uuid: "6b0e2f8c-4a1f-4c63-9a55-0e2e0e2e0e2e",
    name: "Mock Onchain Wallet",
    rdns: "dev.namespace.mock",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'/%3E",
  });
  return { calls, rpcMethods, sent };
}

export async function connectMockWallet(page: Page) {
  await page.addStyleTag({
    content: "nav.nav { position: static !important; }",
  });
  await page.getByTestId("nav-connect-wallet").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Mock Onchain Wallet/ })
    .click();
  await expect(page.getByTestId("nav-wallet-address")).toBeVisible();
}
