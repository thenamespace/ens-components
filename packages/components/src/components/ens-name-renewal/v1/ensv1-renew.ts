import {
  type Address,
  encodeFunctionData,
  isAddress,
  keccak256,
  parseAbi,
  type PublicClient,
  toBytes,
} from "viem";
import { getEnsContracts } from "@thenamespace/addresses";
import { createEnsReferer, estimateEffectiveGasPrice } from "@/utils";
import { NAMESPACE_REFERRER_ADDRESS } from "@/hooks/useRegisterENS";

const controllerAbi = parseAbi([
  "struct Price { uint256 base; uint256 premium; }",
  "function rentPrice(string label, uint256 duration) view returns (Price price)",
  "function renew(string label, uint256 duration, bytes32 referrer) payable",
]);
const baseRegistrarAbi = parseAbi([
  "function nameExpires(uint256 id) view returns (uint256)",
  "function GRACE_PERIOD() view returns (uint256)",
  "function controllers(address controller) view returns (bool)",
]);

// The controller refunds anything above the price, so the buffer only absorbs oracle moves.
const PRICE_BUFFER_BPS = 200n;

export const getEnsV1RenewalContracts = (isTestnet: boolean) => {
  const contracts = getEnsContracts(isTestnet);
  return {
    controller: contracts.ethRegistrarController as Address,
    baseRegistrar: contracts.baseRegistrar as Address,
  };
};

export interface EnsV1RenewalTarget {
  expiry: bigint;
  /** False when the name was never registered or is past its grace period. */
  renewable: boolean;
  inGrace: boolean;
  /** False once ENSv2 retires the v1 controller, as on Sepolia; those names renew through version 2. */
  controllerActive: boolean;
}

export const getEnsV1RenewalTarget = async (
  client: PublicClient,
  isTestnet: boolean,
  label: string
): Promise<EnsV1RenewalTarget> => {
  const { baseRegistrar, controller } = getEnsV1RenewalContracts(isTestnet);
  const [expiry, grace, controllerActive] = await Promise.all([
    client.readContract({
      address: baseRegistrar,
      abi: baseRegistrarAbi,
      functionName: "nameExpires",
      args: [BigInt(keccak256(toBytes(label)))],
    }),
    client.readContract({
      address: baseRegistrar,
      abi: baseRegistrarAbi,
      functionName: "GRACE_PERIOD",
    }),
    client.readContract({
      address: baseRegistrar,
      abi: baseRegistrarAbi,
      functionName: "controllers",
      args: [controller],
    }),
  ]);
  const now = BigInt(Math.floor(Date.now() / 1000));
  return {
    expiry,
    renewable: controllerActive && expiry > 0n && expiry + grace > now,
    controllerActive,
    inGrace: expiry > 0n && expiry <= now && expiry + grace > now,
  };
};

export const getEnsV1RenewPrice = async (
  client: PublicClient,
  isTestnet: boolean,
  label: string,
  duration: bigint
) => {
  const price = await client.readContract({
    address: getEnsV1RenewalContracts(isTestnet).controller,
    abi: controllerAbi,
    functionName: "rentPrice",
    args: [label, duration],
  });
  return price.base;
};

export const buildEnsV1RenewCall = (
  isTestnet: boolean,
  params: { label: string; duration: bigint; price: bigint; referrer?: Address }
) => ({
  to: getEnsV1RenewalContracts(isTestnet).controller,
  data: encodeFunctionData({
    abi: controllerAbi,
    functionName: "renew",
    args: [
      params.label,
      params.duration,
      createEnsReferer(
        params.referrer && isAddress(params.referrer)
          ? params.referrer
          : NAMESPACE_REFERRER_ADDRESS
      ),
    ],
  }),
  value: params.price + (params.price * PRICE_BUFFER_BPS) / 10_000n,
});

export interface EnsV1RenewalFees {
  feeWei: bigint | null;
  shortfallEthWei: bigint;
}

export const estimateEnsV1RenewalFees = async (
  client: PublicClient,
  payer: Address,
  call: ReturnType<typeof buildEnsV1RenewCall>
): Promise<EnsV1RenewalFees> => {
  const [gas, gasPrice, balance] = await Promise.all([
    client
      .estimateGas({
        account: payer,
        to: call.to,
        data: call.data,
        value: call.value,
        stateOverride: [
          { address: payer, balance: call.value * 2n + 10n ** 21n },
        ],
      })
      .catch(() => null),
    estimateEffectiveGasPrice(client),
    client.getBalance({ address: payer }),
  ]);
  const feeWei = gas === null ? null : gas * gasPrice;
  const needed = call.value + (feeWei ?? 0n);
  return { feeWei, shortfallEthWei: balance >= needed ? 0n : needed - balance };
};
