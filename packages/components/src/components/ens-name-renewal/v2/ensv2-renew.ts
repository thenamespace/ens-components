import {
  type Address,
  encodeFunctionData,
  keccak256,
  parseAbi,
  type PublicClient,
  toBytes,
  zeroAddress,
  zeroHash,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { getEnsV2Contracts } from "@thenamespace/addresses";
import { estimateEffectiveGasPrice } from "@/utils";
import {
  type EnsV2Call,
  type EnsV2RegistrationToken,
} from "../../ens-name-registration/v2/ensv2-register";

export interface EnsV2RenewalDeployment {
  chainId: number;
  /** Renews names registered on ENSv2. */
  registrar: Address;
  /** Renews premigrated ENSv1 names still reserved on ENSv2, and syncs their v1 expiry. */
  renewerV1: Address;
  ethRegistry: Address;
  paymentTokens: EnsV2RegistrationToken[];
}

export const getEnsV2RenewalDeployment = (
  isTestnet: boolean,
): EnsV2RenewalDeployment => {
  const ens = getEnsV2Contracts(isTestnet);
  return {
    chainId: isTestnet ? sepolia.id : mainnet.id,
    registrar: ens.ethRegistrar,
    renewerV1: ens.ethRenewerV1,
    ethRegistry: ens.ethRegistry,
    paymentTokens: ens.paymentTokens,
  };
};

const renewerAbi = parseAbi([
  "struct RenewData { string label; uint64 duration; bytes32 referrer; }",
  "function isRenewable(string label) view returns (bool)",
  "function getRenewPrice(string label, uint64 duration, address paymentToken) view returns (uint256)",
  "function getRemainingGracePeriod(string label) view returns (uint64)",
  "function renew(RenewData rd, address paymentToken)",
]);
const registryAbi = parseAbi([
  "function getExpiry(uint256 anyId) view returns (uint64)",
  "function getOwner(uint256 anyId) view returns (address)",
]);
const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
]);

const PRICE_BUFFER_BPS = 300n;

export interface EnsV2RenewalTarget {
  /** Null when neither contract renews the name: never registered, or past its grace period. */
  renewer: Address | null;
  expiry: bigint;
  /** Zero for names still reserved from ENSv1. */
  owner: Address;
  inGrace: boolean;
}

export const getEnsV2RenewalTarget = async (
  client: PublicClient,
  deployment: EnsV2RenewalDeployment,
  label: string
): Promise<EnsV2RenewalTarget> => {
  const id = BigInt(keccak256(toBytes(label)));
  const [viaRegistrar, viaRenewerV1, expiry, owner] = await Promise.all([
    client.readContract({
      address: deployment.registrar,
      abi: renewerAbi,
      functionName: "isRenewable",
      args: [label],
    }),
    client.readContract({
      address: deployment.renewerV1,
      abi: renewerAbi,
      functionName: "isRenewable",
      args: [label],
    }),
    client.readContract({
      address: deployment.ethRegistry,
      abi: registryAbi,
      functionName: "getExpiry",
      args: [id],
    }),
    client.readContract({
      address: deployment.ethRegistry,
      abi: registryAbi,
      functionName: "getOwner",
      args: [id],
    }),
  ]);
  const renewer = viaRegistrar
    ? deployment.registrar
    : viaRenewerV1
      ? deployment.renewerV1
      : null;
  const now = BigInt(Math.floor(Date.now() / 1000));
  return { renewer, expiry, owner, inGrace: renewer !== null && expiry <= now };
};

export const getEnsV2RenewPrice = (
  client: PublicClient,
  renewer: Address,
  label: string,
  duration: bigint,
  token: EnsV2RegistrationToken
) =>
  client.readContract({
    address: renewer,
    abi: renewerAbi,
    functionName: "getRenewPrice",
    args: [label, duration, token.address],
  });

export const buildEnsV2RenewCalls = async (
  client: PublicClient,
  params: {
    renewer: Address;
    label: string;
    duration: bigint;
    token: EnsV2RegistrationToken;
    price: bigint;
    payer: Address;
    referrer?: `0x${string}`;
  }
): Promise<EnsV2Call[]> => {
  const calls: EnsV2Call[] = [];
  const allowance = await client.readContract({
    address: params.token.address,
    abi: erc20Abi,
    functionName: "allowance",
    args: [params.payer, params.renewer],
  });
  if (allowance < params.price)
    calls.push({
      to: params.token.address,
      data: encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [
          params.renewer,
          params.price + (params.price * PRICE_BUFFER_BPS) / 10_000n,
        ],
      }),
      value: 0n,
      title: `Approving ${params.token.symbol}`,
    });

  calls.push({
    to: params.renewer,
    data: encodeFunctionData({
      abi: renewerAbi,
      functionName: "renew",
      args: [
        {
          label: params.label,
          duration: params.duration,
          referrer: params.referrer ?? zeroHash,
        },
        params.token.address,
      ],
    }),
    value: 0n,
    title: `Renewing ${params.label}.eth`,
  });
  return calls;
};

export interface EnsV2RenewalFees {
  feeWei: bigint | null;
  shortfallEthWei: bigint;
  shortfallToken: bigint;
}

export const estimateEnsV2RenewalFees = async (
  client: PublicClient,
  params: {
    payer: Address;
    calls: EnsV2Call[];
    token: EnsV2RegistrationToken;
    price: bigint;
  }
): Promise<EnsV2RenewalFees> => {
  const [simulation, gasPrice, ethBalance, tokenBalance] = await Promise.all([
    client
      .simulateCalls({ account: params.payer, calls: params.calls })
      .catch(() => null),
    estimateEffectiveGasPrice(client),
    client.getBalance({ address: params.payer }),
    client.readContract({
      address: params.token.address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [params.payer],
    }),
  ]);
  const results = simulation?.results;
  const feeWei =
    results && results.every(r => r.status === "success")
      ? results.reduce((sum, r) => sum + r.gasUsed, 0n) * gasPrice
      : null;
  return {
    feeWei,
    shortfallEthWei:
      feeWei === null || ethBalance >= feeWei ? 0n : feeWei - ethBalance,
    shortfallToken:
      tokenBalance >= params.price ? 0n : params.price - tokenBalance,
  };
};

export const isZeroAddress = (address: Address) =>
  address.toLowerCase() === zeroAddress;
