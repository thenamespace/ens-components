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
import { mainnet, sepolia } from "viem/chains";
import {
  getEnsV2Contracts,
  getNamespaceV2Contracts,
} from "@thenamespace/addresses";
import type { EnsRecords } from "@/types";
import {
  encodeRecordsUpdate,
  estimateEffectiveGasPrice,
  getEnsRecordsDiff,
  type ResolverStyle,
} from "@/utils";

export interface EnsV2PaymentToken {
  symbol: string;
  address: Address;
  decimals: number;
}

export interface EnsV2Deployment {
  chainId: number;
  manager: Address;
  issuer: Address;
  sharedResolver: Address;
  ethRegistry: Address;
  whitelistFeature: Address;
  reservationFeature: Address;
  managerApiUrl: string;
  paymentTokens: EnsV2PaymentToken[];
}

/** Null until Namespace's ENSv2 contracts are deployed on the network. */
export const getEnsV2Deployment = (
  isTestnet: boolean
): EnsV2Deployment | null => {
  const namespace = getNamespaceV2Contracts(isTestnet);
  if (!namespace) return null;
  return {
    chainId: isTestnet ? sepolia.id : mainnet.id,
    manager: namespace.activationManager,
    issuer: namespace.subnameIssuer,
    sharedResolver: namespace.sharedResolver,
    ethRegistry: getEnsV2Contracts(isTestnet).ethRegistry,
    whitelistFeature: namespace.features.whitelist,
    reservationFeature: namespace.features.reservation,
    managerApiUrl: isTestnet
      ? "https://staging.manager.namespace.ninja/api/v1"
      : "https://manager.namespace.ninja/api/v1",
    paymentTokens: namespace.paymentTokens,
  };
};

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
  minter: Address
): Promise<{
  extraData: Hex;
  proofsUnavailable: EnsV2MintQuote["proofsUnavailable"];
}> => {
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
      `${deployment.managerApiUrl}/whitelist/${whitelistRoot}/proof?address=${minter}`
    );
    if (!proof) proofsUnavailable.push("whitelist");
    else if (proof.whitelisted)
      claims.push({ feature: deployment.whitelistFeature, data: proof.claim });
  }
  // While a reservation root is set every mint needs a claim, reserved or not.
  if (reservationRoot !== zeroHash) {
    const proof = await fetchJson<{ claim: Hex }>(
      `${deployment.managerApiUrl}/reservation/${reservationRoot}/proof?label=${encodeURIComponent(label)}`
    );
    if (!proof) proofsUnavailable.push("reservation");
    else
      claims.push({
        feature: deployment.reservationFeature,
        data: proof.claim,
      });
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
    [claims]
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
  }
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
          params.minter
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
  token: EnsV2PaymentToken
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
  parentName: string
): Promise<Address | null> => {
  const history = await fetchJson<{ resolver: Address | null }[]>(
    `${deployment.managerApiUrl}/activations/label/${encodeURIComponent(splitName(parentName))}`
  );
  const resolver = history?.[0]?.resolver;
  return resolver && resolver !== zeroAddress ? resolver : null;
};

export interface EnsV2MintResolver {
  address: Address;
  style: ResolverStyle;
  requested: Address;
}

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
    resolver: EnsV2MintResolver;
  }
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
          resolver: params.resolver.requested,
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
  if (diff.isDifferent)
    calls.push({
      ...encodeRecordsUpdate(
        params.resolver.style,
        params.resolver.address,
        `${params.label}.${params.parentName}`,
        diff
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
  /** Null when the calls can't be simulated because the wallet lacks the payment token. */
  feeWei: bigint | null;
  shortfallEthWei: bigint;
  shortfallToken: bigint;
}

export const estimateEnsV2MintFees = async (
  client: PublicClient,
  account: Address,
  calls: EnsV2Call[],
  payment: { token: EnsV2PaymentToken; amount: bigint }
): Promise<EnsV2MintFees> => {
  const isNative = payment.token.address === zeroAddress;
  const [simulation, gasPrice, ethBalance, tokenBalance] = await Promise.all([
    client
      .simulateCalls({
        account,
        calls,
        stateOverrides: [{ address: account, balance: 10n ** 30n }],
      })
      .catch(() => null),
    estimateEffectiveGasPrice(client),
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

  const shortfallToken =
    isNative || tokenBalance >= payment.amount
      ? 0n
      : payment.amount - tokenBalance;
  const results = simulation?.results;
  if (!results || results.some(r => r.status !== "success")) {
    // Without enough of the token the transfer reverts in simulation; report the
    // shortfall so the form can say so instead of offering a failing transaction.
    if (shortfallToken > 0n)
      return { feeWei: null, shortfallEthWei: 0n, shortfallToken };
    throw new Error("The mint would fail.");
  }

  const gas = results.reduce((sum, r) => sum + r.gasUsed, 0n);
  const feeWei = gas * gasPrice;
  const ethNeeded = feeWei + calls.reduce((sum, call) => sum + call.value, 0n);
  return {
    feeWei,
    shortfallEthWei: ethBalance >= ethNeeded ? 0n : ethNeeded - ethBalance,
    shortfallToken,
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
    resolver: EnsV2MintResolver;
  }
): Promise<boolean> => {
  try {
    const eth = deployment.paymentTokens.find(t => t.address === zeroAddress);
    if (!eth) return false;
    const amount = await quoteEnsV2Payment(
      client,
      deployment,
      params.priceUsdRaw,
      eth
    );
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
    return results.every(r => r.status === "success");
  } catch {
    return false;
  }
};
