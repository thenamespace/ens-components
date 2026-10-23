import {
  type Address,
  encodeAbiParameters,
  encodeFunctionData,
  type Hex,
  keccak256,
  parseAbi,
  type PublicClient,
  toBytes,
  zeroAddress,
  zeroHash,
} from "viem";
import {
  type EnsV2Call,
  type EnsV2Deployment,
  type EnsV2PaymentToken,
  withPaymentBuffer,
} from "../subname-mint-form/v2/ensv2-mint";

const managerAbi = parseAbi([
  "struct RenewalQuote { bool canRenew; uint256 price; uint8 denied; bytes32 activationId; address subregistry; }",
  "function quoteRenewal(string parentLabel, string label, address renewer, uint64 duration, bytes extraData) view returns (RenewalQuote result)",
  "function activationIdOf(bytes32 parent) view returns (bytes32)",
]);
const issuerAbi = parseAbi([
  "struct RenewRequest { string parentLabel; string label; uint64 duration; bytes extraData; }",
  "function renew(RenewRequest request, address paymentToken) payable returns (uint64 newExpiry)",
]);
const registryAbi = parseAbi([
  "function getSubregistry(string label) view returns (address)",
  "function getOwner(uint256 anyId) view returns (address)",
  "function getExpiry(uint256 anyId) view returns (uint64)",
  "function hasRootRoles(uint256 roleBitmap, address account) view returns (bool)",
]);
const whitelistAbi = parseAbi([
  "function configs(bytes32 activationId) view returns (uint8 mode, bytes32 root)",
]);
const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
]);

const ROLE_RENEW = 1n << 16n;
const PERMANENT_EXPIRY = 18446744073709551615n;
const DENIED_NOT_RENEWABLE = 11;

const DENIED_MESSAGES: Record<number, string> = {
  1: "Renewals are paused for this name.",
  2: "Enter a subname to renew.",
  10: "Pick a longer duration, the minimum is 28 days.",
};

export interface EnsV2RenewalQuote {
  renewable: boolean;
  /** Why the subname can't be renewed, worded for the renewer. */
  blockedMessage: string | null;
  priceUsdRaw: bigint;
  extraData: Hex;
  owner: Address;
  expiry: bigint | null;
  /** The subname stops resolving once the parent expires, whatever its own expiry. */
  parentExpiry: bigint;
}

const fetchJson = async <T>(url: string): Promise<T | null> => {
  try {
    const res = await fetch(url);
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
};

// Only the whitelist claim is attached: it can make a renewal free, while a reservation claim would add its premium.
const buildRenewalExtraData = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  parentLabel: string,
  renewer: Address
): Promise<Hex> => {
  const activationId = await client.readContract({
    address: deployment.manager,
    abi: managerAbi,
    functionName: "activationIdOf",
    args: [keccak256(toBytes(parentLabel))],
  });
  if (activationId === zeroHash || renewer === zeroAddress) return "0x";
  const [, root] = await client.readContract({
    address: deployment.whitelistFeature,
    abi: whitelistAbi,
    functionName: "configs",
    args: [activationId],
  });
  if (root === zeroHash) return "0x";
  const proof = await fetchJson<{ whitelisted: boolean; claim: Hex }>(
    `${deployment.managerApiUrl}/whitelist/${root}/proof?address=${renewer}`
  );
  if (!proof?.whitelisted) return "0x";
  return encodeAbiParameters(
    [
      {
        type: "tuple[]",
        components: [
          { name: "feature", type: "address" },
          { name: "data", type: "bytes" },
        ],
      },
    ],
    [[{ feature: deployment.whitelistFeature, data: proof.claim }]]
  );
};

export const quoteEnsV2Renewal = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    renewer: Address;
    duration: bigint;
  }
): Promise<EnsV2RenewalQuote> => {
  const parentLabel = params.parentName.replace(/\.eth$/, "");
  const fullName = `${params.label}.${params.parentName}`;
  const labelId = BigInt(keccak256(toBytes(params.label)));
  const extraData = await buildRenewalExtraData(
    client,
    deployment,
    parentLabel,
    params.renewer
  );

  const [quote, liveSubregistry, parentExpiry] = await Promise.all([
    client.readContract({
      address: deployment.manager,
      abi: managerAbi,
      functionName: "quoteRenewal",
      args: [
        parentLabel,
        params.label,
        params.renewer,
        params.duration,
        extraData,
      ],
    }),
    client.readContract({
      address: deployment.ethRegistry,
      abi: registryAbi,
      functionName: "getSubregistry",
      args: [parentLabel],
    }),
    client.readContract({
      address: deployment.ethRegistry,
      abi: registryAbi,
      functionName: "getExpiry",
      args: [BigInt(keccak256(toBytes(parentLabel)))],
    }),
  ]);

  const result: EnsV2RenewalQuote = {
    renewable: false,
    blockedMessage: null,
    priceUsdRaw: quote.price,
    extraData,
    owner: zeroAddress,
    expiry: null,
    parentExpiry,
  };
  const blocked = (blockedMessage: string) => ({ ...result, blockedMessage });

  if (!quote.canRenew) {
    if (quote.denied === DENIED_NOT_RENEWABLE)
      return blocked(
        `Subnames under ${params.parentName} are permanent and never need renewing.`
      );
    return blocked(
      DENIED_MESSAGES[quote.denied] ?? "This subname can't be renewed."
    );
  }
  if (liveSubregistry === zeroAddress)
    return blocked(
      `${params.parentName} has expired, so its subnames can't be renewed.`
    );
  if (liveSubregistry.toLowerCase() !== quote.subregistry.toLowerCase())
    return blocked(
      `Renewals under ${params.parentName} are paused until its owner activates it again.`
    );

  const [owner, expiry, canRenewOnRegistry] = await Promise.all([
    client.readContract({
      address: quote.subregistry,
      abi: registryAbi,
      functionName: "getOwner",
      args: [labelId],
    }),
    client.readContract({
      address: quote.subregistry,
      abi: registryAbi,
      functionName: "getExpiry",
      args: [labelId],
    }),
    client.readContract({
      address: quote.subregistry,
      abi: registryAbi,
      functionName: "hasRootRoles",
      args: [ROLE_RENEW, deployment.issuer],
    }),
  ]);

  if (owner === zeroAddress)
    return blocked(
      `${fullName} isn't registered or has expired. Mint it instead.`
    );
  if (expiry === PERMANENT_EXPIRY)
    return {
      ...blocked(`${fullName} is permanent and never needs renewing.`),
      owner,
      expiry,
    };
  if (!canRenewOnRegistry)
    return {
      ...blocked(
        `The owner of ${params.parentName} hasn't enabled subname renewals yet.`
      ),
      owner,
      expiry,
    };

  return { ...result, renewable: true, owner, expiry };
};

export const prepareEnsV2RenewCalls = async (
  client: PublicClient,
  deployment: EnsV2Deployment,
  params: {
    parentName: string;
    label: string;
    payer: Address;
    duration: bigint;
    token: EnsV2PaymentToken;
    amount: bigint;
    extraData: Hex;
  }
): Promise<EnsV2Call[]> => {
  const isNative = params.token.address === zeroAddress;
  const calls: EnsV2Call[] = [];

  if (!isNative && params.amount > 0n) {
    const allowance = await client.readContract({
      address: params.token.address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [params.payer, deployment.issuer],
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
      functionName: "renew",
      args: [
        {
          parentLabel: params.parentName.replace(/\.eth$/, ""),
          label: params.label,
          duration: params.duration,
          extraData: params.extraData,
        },
        params.token.address,
      ],
    }),
    value:
      isNative && params.amount > 0n ? withPaymentBuffer(params.amount) : 0n,
    title: `Renewing ${params.label}.${params.parentName}`,
  });
  return calls;
};
