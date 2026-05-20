import {
  Address,
  concatHex,
  formatEther,
  Hash,
  Hex,
  isAddress,
  keccak256,
  namehash,
  padHex,
  parseAbi,
  parseEther,
  toBytes,
  toHex,
  zeroAddress,
} from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { getEnsContracts } from "@thenamespace/addresses";
import { createEnsReferer, equalsIgnoreCase } from "@/utils";
import { ONE_YEAR } from "@/utils/date";
import { ABIS } from "./abis";
import { EnsRecords } from "@/types";
import { convertToResolverData } from "@/utils/resolver";

interface RentPriceResponse {
  wei: bigint;
  eth: number;
}

export interface RegistrationFeeEstimate {
  wei: bigint;
  eth: number;
  gasEstimate: bigint;
  gasPrice: bigint;
  /** True when the precise eth_estimateGas+stateOverride path failed and we
   *  fell back to a heuristic. UI can mark the value as approximate. */
  isHeuristic: boolean;
}

const COMMITMENTS_SLOT = 1n;
const FIVE_MINUTES_SECONDS = 5 * 60;

// Heuristic gas costs for RPCs that reject eth_estimateGas state overrides
// (e.g. cloudflare-eth, some public Sepolia endpoints). Numbers picked to
// match observed gas usage of the v3 ETHRegistrarController on mainnet.
const HEURISTIC_COMMIT_GAS = 50_000n;
const HEURISTIC_REGISTER_BASE_GAS = 240_000n;
const HEURISTIC_GAS_PER_RECORD = 50_000n;

const isStateOverrideRejection = (err: unknown): boolean => {
  const e = err as { code?: number; cause?: { code?: number }; message?: string; shortMessage?: string };
  const code = e?.code ?? e?.cause?.code;
  if (code === -32602 || code === -32601 || code === -32000) return true;
  const msg = `${e?.shortMessage ?? ""} ${e?.message ?? ""}`.toLowerCase();
  return (
    msg.includes("state override") ||
    msg.includes("stateoverride") ||
    msg.includes("too many arguments") ||
    msg.includes("invalid argument 2") ||
    msg.includes("3rd parameter") ||
    msg.includes("does not support")
  );
};

const NAMESPACE_REFERRER_ADDRESS = "0xb7B18611b8C51B4B3F400BaF09DB49E61e0aF044";

const ENS_REGISTRY_ABI = parseAbi([
  "function owner(bytes32) view returns (address)",
]);

export interface RegistrationRequest {
  label: string;
  owner: Address;
  durationInSeconds: number;
  secret: string;
  records: EnsRecords;
  referrer?: Address;
}

interface EnsRegistration {
  label: string;
  owner: Address;
  duration: bigint;
  secret: Hash;
  resolver: Address;
  data: Hash[];
  reverseRecord: number;
  referrer: Hash;
}

export const useRegisterENS = ({ isTestnet }: { isTestnet?: boolean }) => {
  const publicClient = usePublicClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });

  const getRegistrationPrice = async (
    label: string,
    durationInSeconds: number = ONE_YEAR
  ): Promise<RentPriceResponse> => {
    const ethController = getEthController();
    const price = (await publicClient!.readContract({
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "rentPrice",
      args: [label, BigInt(durationInSeconds)],
      address: ethController,
      account: address!,
    })) as { base: bigint; premium: bigint };

    const totalPrice = price.base + price.premium;
    return {
      wei: totalPrice,
      eth: parseFloat(formatEther(totalPrice)),
    };
  };

  const isEnsAvailable = async (label: string): Promise<boolean> => {
    const ownerAddress = await publicClient!.readContract({
      functionName: "owner",
      abi: ENS_REGISTRY_ABI,
      args: [namehash(`${label}.eth`)],
      address: getEnsRegistry(),
    });
    return equalsIgnoreCase(ownerAddress, zeroAddress);
  };

  const makeCommitment = async (request: RegistrationRequest): Promise<Hash> => {
    const fullName = `${request.label}.eth`;
    const resolverData = convertToResolverData(fullName, request.records);

    const c: EnsRegistration = {
      label: request.label,
      owner: request.owner,
      duration: BigInt(request.durationInSeconds),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: resolverData,
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };

    return (await publicClient!.readContract({
      functionName: "makeCommitment",
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      address: getEthController(),
      args: [c],
    })) as Hash;
  };

  const sendCommitmentTx = async (request: RegistrationRequest): Promise<Hash> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    const commitment = await makeCommitment(request);
    const { request: contractRequest } = await publicClient!.simulateContract({
      address: getEthController(),
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "commit",
      args: [commitment],
      account: walletClient.account,
    });
    return walletClient.writeContract(contractRequest);
  };

  const sendRegisterTx = async (
    request: RegistrationRequest
  ): Promise<{ txHash: Hash; price: RentPriceResponse }> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    const fullName = `${request.label}.eth`;
    const resolverData = convertToResolverData(fullName, request.records);

    const registration: EnsRegistration = {
      label: request.label,
      owner: request.owner,
      duration: BigInt(request.durationInSeconds),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: resolverData,
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };

    const price = await getRegistrationPrice(request.label, request.durationInSeconds);

    const { request: contractRequest } = await publicClient!.simulateContract({
      address: getEthController(),
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "register",
      args: [registration],
      account: walletClient.account,
      value: price.wei,
    });

    const tx = await walletClient.writeContract(contractRequest);
    return { txHash: tx, price };
  };

  // Use eth_gasPrice (matches wagmi's useGasPrice and what ens-app-v3 displays).
  // The wallet may use a higher gas price at submission, but for the displayed
  // estimate we want parity with ENS app so users can compare like-for-like.
  const getEffectiveGasPrice = (): Promise<bigint> => publicClient!.getGasPrice();

  // Storage slot for ETHRegistrarController.commitments[commitment].
  // Solidity layout for `mapping(bytes32 => uint256) commitments` at slot 1
  // is keccak256(commitment_padded || slot_padded). Matches ens-app-v3.
  const commitmentStorageSlot = (commitment: Hash): Hex =>
    keccak256(
      concatHex([padHex(commitment, { size: 32 }), padHex(toHex(COMMITMENTS_SLOT), { size: 32 })])
    );

  const estimateRegistrationFees = async (
    request: RegistrationRequest
  ): Promise<RegistrationFeeEstimate> => {
    const fullName = `${request.label}.eth`;
    const resolverData = convertToResolverData(fullName, request.records);
    const controller = getEthController();

    const commitmentParams: EnsRegistration = {
      label: request.label,
      owner: request.owner,
      duration: BigInt(request.durationInSeconds),
      secret: keccak256(toBytes(request.secret)),
      resolver: getPublicResolver(),
      data: resolverData,
      reverseRecord: 0,
      referrer: getRegReferrer(request),
    };

    const commitment = (await publicClient!.readContract({
      functionName: "makeCommitment",
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      address: controller,
      args: [commitmentParams],
    })) as Hash;

    const price = await getRegistrationPrice(request.label, request.durationInSeconds);

    const fiveMinAgo = BigInt(Math.floor(Date.now() / 1000) - FIVE_MINUTES_SECONDS);
    const balanceOverride = price.wei * 2n + parseEther("1000000");

    const gasPricePromise = getEffectiveGasPrice();

    const commitGasPromise = publicClient!
      .estimateContractGas({
        address: controller,
        abi: ABIS.ETH_REGISTRAR_CONTOLLER,
        functionName: "commit",
        args: [commitment],
        account: request.owner,
      })
      .catch(() => HEURISTIC_COMMIT_GAS);

    const registerGasPromise = publicClient!
      .estimateContractGas({
        address: controller,
        abi: ABIS.ETH_REGISTRAR_CONTOLLER,
        functionName: "register",
        args: [commitmentParams],
        account: request.owner,
        value: price.wei,
        stateOverride: [
          {
            address: controller,
            stateDiff: [
              {
                slot: commitmentStorageSlot(commitment),
                value: padHex(toHex(fiveMinAgo), { size: 32 }),
              },
            ],
          },
          { address: request.owner, balance: balanceOverride },
        ],
      })
      .then((g) => ({ gas: g, isHeuristic: false }))
      .catch((err) => {
        // Fall back to a heuristic on any failure — not just state-override
        // rejection. Common failures we want to absorb: RPC doesn't honor
        // state overrides (Cloudflare, some public Sepolia), wrong-chain RPC
        // misconfig (controller not deployed at that address), execution
        // reverted for any reason. Logging the cause helps debugging.
        if (typeof console !== "undefined") {
          // eslint-disable-next-line no-console
          console.warn(
            "[useRegisterENS] register-gas estimation failed; using heuristic.",
            isStateOverrideRejection(err) ? "(state override unsupported)" : "",
            err
          );
        }
        const recordCount =
          (request.records.addresses?.length ?? 0) + (request.records.texts?.length ?? 0);
        const heuristic =
          HEURISTIC_REGISTER_BASE_GAS + BigInt(recordCount) * HEURISTIC_GAS_PER_RECORD;
        return { gas: heuristic, isHeuristic: true };
      });

    const [commitGas, registerResult, gasPrice] = await Promise.all([
      commitGasPromise,
      registerGasPromise,
      gasPricePromise,
    ]);

    const totalGas = commitGas + registerResult.gas;
    const totalWei = totalGas * gasPrice;

    return {
      wei: totalWei,
      eth: parseFloat(formatEther(totalWei)),
      gasEstimate: totalGas,
      gasPrice,
      isHeuristic: registerResult.isHeuristic,
    };
  };

  const getEthController = () => getEnsContracts(isTestnet).ethRegistrarController;
  const getEnsRegistry = () => getEnsContracts(isTestnet).ensRegistry;
  const getPublicResolver = () => getEnsContracts(isTestnet).publicResolver;

  const getRegReferrer = (request: RegistrationRequest) => {
    const referrerAddress =
      request.referrer && isAddress(request.referrer)
        ? request.referrer
        : NAMESPACE_REFERRER_ADDRESS;
    return createEnsReferer(referrerAddress);
  };

  return {
    isEnsAvailable,
    getRegistrationPrice,
    estimateRegistrationFees,
    sendCommitmentTx,
    sendRegisterTx,
  };
};
