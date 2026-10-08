import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  type Hex,
  keccak256,
  parseAbi,
  type PublicClient,
  toBytes,
  toHex,
  zeroAddress,
  zeroHash,
} from "viem";
import type { EnsRecords } from "@/types";
import { encodeRecordsUpdate, getEnsRecordsDiff, type ResolverStyle } from "@/utils";

export interface EnsV2PaymentToken {
  symbol: string;
  address: Address;
  decimals: number;
}

export interface EnsV2Deployment {
  chainId: number;
  manager: Address;
  issuer: Address;
  resolver: Address;
  ethRegistry: Address;
  whitelistFeature: Address;
  reservationFeature: Address;
  managerApiUrl: string;
  paymentTokens: EnsV2PaymentToken[];
}

export const ENSV2_SEPOLIA: EnsV2Deployment = {
  chainId: 11155111,
  manager: "0xB9DF8b94a2C39790d8Cf716A67260515436e58c5",
  issuer: "0x67a196439075a670fc17b34bC908F6CAaA6b1904",
  resolver: "0x99908150E5d1023B8a69A0870B6983acF6f8Cf7C",
  ethRegistry: "0xD4eBcbBdF463C9c45784603Db0dDD499BC44A8B4",
  whitelistFeature: "0x1f4Da48832F23860Ce465f83bEdEbC13e7D5012d",
  reservationFeature: "0xeb4dF26099aF1bD834Bc1B9BBF25E065232871f6",
  managerApiUrl: "https://manager.namespace.ninja/api/v1",
  paymentTokens: [
    { symbol: "ETH", address: zeroAddress, decimals: 18 },
    {
      symbol: "USDC",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      decimals: 6,
    },
  ],
};

export const getEnsV2Deployment = (isTestnet: boolean) =>
  isTestnet ? ENSV2_SEPOLIA : null;

const managerAbi = parseAbi([
  "struct MintQuote { bool canMint; uint256 price; uint8 denied; uint8 expiration; bytes32 activationId; address subregistry; }",
  "function quoteMint(string parentLabel, string label, address minter, uint64 duration, bytes extraData) view returns (MintQuote result)",
  "function activationIdOf(bytes32 parent) view returns (bytes32)",
]);
const whitelistAbi = parseAbi([
  "function configs(bytes32 activationId) view returns (uint8 mode, bytes32 root)",
]);
const reservationAbi = parseAbi([
  "function roots(bytes32 activationId) view returns (bytes32)",
]);
const registryAbi = parseAbi([
  "function getStatus(uint256 anyId) view returns (uint8)",
]);
const issuerAbi = parseAbi([
  "struct RegisterRequest { string parentLabel; string label; address owner; address resolver; uint64 duration; bytes extraData; }",
  "function register(RegisterRequest request, address paymentToken) payable returns (uint256 tokenId)",
  "function quotePayment(uint256 usdAmount, address token) view returns (uint256)",
]);
const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

const STATUS_REGISTERED = 2;
// Headroom for oracle moves: extra ETH is refunded, ERC-20 pulls only the price.
const PAYMENT_BUFFER_BPS = 200n;

export const withPaymentBuffer = (amount: bigint) =>
  amount + (amount * PAYMENT_BUFFER_BPS) / 10_000n;
export const ONE_YEAR = 31_536_000n;

// Order matches Types.DeniedReason in the ActivationManager.
const DENIED_MESSAGES: Record<number, string> = {
  1: "Minting is paused for this name.",
  3: "This name isn't set up to issue subnames yet.",
  5: "Minting hasn't opened yet.",
  6: "Minting has closed.",
  7: "Your wallet isn't allowed to mint under this name.",
  8: "Minting isn't allowed for this subname.",
  9: "This subname is reserved.",
  10: "Pick a longer duration, the minimum is 28 days.",
  11: "This subname can't be renewed.",
};

export interface EnsV2MintQuote {
  available: boolean;
  canMint: boolean;
  deniedMessage: string | null;
  reserved: boolean;
  expirable: boolean;
  priceUsdRaw: bigint;
  extraData: Hex;
  proofsUnavailable: ("whitelist" | "reservation")[];
}

const splitName = (fullParent: string) => fullParent.replace(/\.eth$/, "");

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

const buildExtraData = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  activationId: Hex,
  label: string,
  minter: Address,
): Promise<{ extraData: Hex; proofsUnavailable: EnsV2MintQuote["proofsUnavailable"] }> => {
  const [[, whitelistRoot], reservationRoot] = await Promise.all([
    client.readContract({
      address: deployment.whitelistFeature,
      abi: whitelistAbi,
      functionName: "configs",
      args: [activationId],
    }),
    client.readContract({
      address: deployment.reservationFeature,
      abi: reservationAbi,
      functionName: "roots",
      args: [activationId],
    }),
  ]);

  const claims: { feature: Address; data: Hex }[] = [];
  const proofsUnavailable: EnsV2MintQuote["proofsUnavailable"] = [];
  if (whitelistRoot !== zeroHash) {
    const proof = await fetchJson<{ whitelisted: boolean; claim: Hex }>(
      `${deployment.managerApiUrl}/whitelist/${whitelistRoot}/proof?address=${minter}`,
    );
    if (!proof) proofsUnavailable.push("whitelist");
    else if (proof.whitelisted)
      claims.push({ feature: deployment.whitelistFeature, data: proof.claim });
  }
  // While a reservation root is set every mint needs a claim, reserved or not.
  if (reservationRoot !== zeroHash) {
    const proof = await fetchJson<{ claim: Hex }>(
      `${deployment.managerApiUrl}/reservation/${reservationRoot}/proof?label=${encodeURIComponent(label)}`,
    );
    if (!proof) proofsUnavailable.push("reservation");
    else claims.push({ feature: deployment.reservationFeature, data: proof.claim });
  }

  if (claims.length === 0) return { extraData: "0x", proofsUnavailable };
  const extraData = encodeAbiParameters(
    [
      {
        type: "tuple[]",
        components: [
          { name: "feature", type: "address" },
          { name: "data", type: "bytes" },
        ],
      },
    ],
    [claims],
  );
  return { extraData, proofsUnavailable };
};

export const quoteEnsV2Mint = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    minter: Address;
    duration?: bigint;
  },
): Promise<EnsV2MintQuote> => {
  const parentLabel = splitName(params.parentName);
  const duration = params.duration ?? ONE_YEAR;
  const activationId = await client.readContract({
    address: deployment.manager,
    abi: managerAbi,
    functionName: "activationIdOf",
    args: [keccak256(toBytes(parentLabel))],
  });
  const { extraData, proofsUnavailable } =
    activationId === zeroHash
      ? { extraData: "0x" as Hex, proofsUnavailable: [] }
      : await buildExtraData(
          client,
          deployment,
          activationId,
          params.label,
          params.minter,
        );

  const quote = await client.readContract({
    address: deployment.manager,
    abi: managerAbi,
    functionName: "quoteMint",
    args: [parentLabel, params.label, params.minter, duration, extraData],
  });

  // quoteMint doesn't check whether the subname already exists.
  let available = true;
  if (quote.subregistry !== zeroAddress) {
    const status = await client.readContract({
      address: quote.subregistry,
      abi: registryAbi,
      functionName: "getStatus",
      args: [BigInt(keccak256(toBytes(params.label)))],
    });
    available = Number(status) !== STATUS_REGISTERED;
  }

  return {
    available,
    canMint: quote.canMint,
    deniedMessage: quote.canMint
      ? null
      : (DENIED_MESSAGES[quote.denied] ?? "You can't mint this subname."),
    reserved: quote.denied === 9,
    expirable: quote.expiration === 0,
    priceUsdRaw: quote.price,
    extraData,
    proofsUnavailable,
  };
};

export const quoteEnsV2Payment = (
  client: PublicClient,
  deployment: EnsV2Deployment,
  priceUsdRaw: bigint,
  token: EnsV2PaymentToken,
) =>
  priceUsdRaw === 0n
    ? Promise.resolve(0n)
    : client.readContract({
        address: deployment.issuer,
        abi: issuerAbi,
        functionName: "quotePayment",
        args: [priceUsdRaw, token.address],
      });

export const getEnsV2ActivationResolver = async (
  deployment: EnsV2Deployment,
  parentName: string,
): Promise<Address | null> => {
  const history = await fetchJson<{ resolver: Address | null }[]>(
    `${deployment.managerApiUrl}/activations/label/${encodeURIComponent(splitName(parentName))}`,
  );
  const resolver = history?.[0]?.resolver;
  if (!history?.length) return null;
  return !resolver || resolver === zeroAddress ? deployment.resolver : resolver;
};

export interface EnsV2Call {
  to: Address;
  data: Hex;
  value: bigint;
  title?: string;
}

export const prepareEnsV2MintCalls = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    owner: Address;
    duration: bigint;
    token: EnsV2PaymentToken;
    amount: bigint;
    extraData: Hex;
    records: EnsRecords;
    resolver: Address | null;
    resolverStyle: ResolverStyle;
  },
): Promise<EnsV2Call[]> => {
  const parentLabel = splitName(params.parentName);
  const isNative = params.token.address === zeroAddress;
  const calls: EnsV2Call[] = [];

  if (!isNative && params.amount > 0n) {
    const allowance = await client.readContract({
      address: params.token.address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [params.owner, deployment.issuer],
    });
    if (allowance < params.amount)
      calls.push({
        to: params.token.address,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [deployment.issuer, withPaymentBuffer(params.amount)],
        }),
        value: 0n,
        title: `Approving ${params.token.symbol}`,
      });
  }

  calls.push({
    to: deployment.issuer,
    data: encodeFunctionData({
      abi: issuerAbi,
      functionName: "register",
      args: [
        {
          parentLabel,
          label: params.label,
          owner: params.owner,
          resolver: zeroAddress,
          duration: params.duration,
          extraData: params.extraData,
        },
        params.token.address,
      ],
    }),
    value: isNative ? withPaymentBuffer(params.amount) : 0n,
    title: `Minting ${params.label}.${params.parentName}`,
  });

  const diff = getEnsRecordsDiff({ addresses: [], texts: [] }, params.records);
  if (diff.isDifferent && params.resolver)
    calls.push({
      ...encodeRecordsUpdate(
        params.resolverStyle,
        params.resolver,
        `${params.label}.${params.parentName}`,
        diff,
      ),
      value: 0n,
      title: "Setting records",
    });

  return calls;
};

const erc20BalanceAbi = parseAbi([
  "function balanceOf(address owner) view returns (uint256)",
]);

export interface EnsV2MintFees {
  feeWei: bigint;
  shortfallEthWei: bigint;
  shortfallToken: bigint;
}

export const estimateEnsV2MintFees = async (
  client: PublicClient,
  account: Address,
  calls: EnsV2Call[],
  payment: { token: EnsV2PaymentToken; amount: bigint },
): Promise<EnsV2MintFees> => {
  const isNative = payment.token.address === zeroAddress;
  const [{ results }, fees, ethBalance, tokenBalance] = await Promise.all([
    client.simulateCalls({
      account,
      calls,
      stateOverrides: [{ address: account, balance: 10n ** 30n }],
    }),
    client.estimateFeesPerGas(),
    client.getBalance({ address: account }),
    isNative || payment.amount === 0n
      ? Promise.resolve(0n)
      : client.readContract({
          address: payment.token.address,
          abi: erc20BalanceAbi,
          functionName: "balanceOf",
          args: [account],
        }),
  ]);

  const failed = results.find((r) => r.status !== "success");
  if (failed) throw new Error("The mint would fail.");

  const gas = results.reduce((sum, r) => sum + r.gasUsed, 0n);
  const feeWei = gas * (fees.maxFeePerGas ?? fees.gasPrice ?? 0n);
  const ethNeeded =
    feeWei + calls.reduce((sum, call) => sum + call.value, 0n);
  return {
    feeWei,
    shortfallEthWei: ethBalance >= ethNeeded ? 0n : ethNeeded - ethBalance,
    shortfallToken:
      isNative || tokenBalance >= payment.amount
        ? 0n
        : payment.amount - tokenBalance,
  };
};

export const canWriteEnsV2RecordsAtMint = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    owner: Address;
    duration: bigint;
    priceUsdRaw: bigint;
    extraData: Hex;
    resolver: Address;
    resolverStyle: ResolverStyle;
  },
): Promise<boolean> => {
  try {
    const eth = deployment.paymentTokens.find((t) => t.address === zeroAddress);
    if (!eth) return false;
    const amount = await quoteEnsV2Payment(client, deployment, params.priceUsdRaw, eth);
    const calls = await prepareEnsV2MintCalls(client, deployment, {
      ...params,
      token: eth,
      amount,
      records: { addresses: [], texts: [{ key: "description", value: "-" }] },
    });
    const { results } = await client.simulateCalls({
      account: params.owner,
      calls,
      stateOverrides: [{ address: params.owner, balance: 10n ** 30n }],
    });
    return results.every((r) => r.status === "success");
  } catch {
    return false;
  }
};
