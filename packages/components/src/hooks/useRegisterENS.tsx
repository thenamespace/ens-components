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
import { createEnsReferer, equalsIgnoreCase, formatFloat } from "@/utils";
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
}

const COMMITMENTS_SLOT = 1n;
const FIVE_MINUTES_SECONDS = 5 * 60;
const MIN_PRIORITY_FEE_WEI = 1_500_000_000n;

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
      eth: formatFloat(formatEther(totalPrice, "wei"), 4),
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

  const getEffectiveGasPrice = async (): Promise<bigint> => {
    try {
      const [block, priorityFee] = await Promise.all([
        publicClient!.getBlock({ blockTag: "latest" }),
        publicClient!.estimateMaxPriorityFeePerGas().catch(() => 0n),
      ]);
      const baseFee = block.baseFeePerGas ?? (await publicClient!.getGasPrice());
      const effectivePriorityFee =
        priorityFee > MIN_PRIORITY_FEE_WEI ? priorityFee : MIN_PRIORITY_FEE_WEI;
      return baseFee * 2n + effectivePriorityFee;
    } catch {
      return publicClient!.getGasPrice();
    }
  };

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

    const [commitGas, registerGas, gasPrice] = await Promise.all([
      publicClient!.estimateContractGas({
        address: controller,
        abi: ABIS.ETH_REGISTRAR_CONTOLLER,
        functionName: "commit",
        args: [commitment],
        account: request.owner,
      }),
      publicClient!.estimateContractGas({
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
          {
            address: request.owner,
            balance: balanceOverride,
          },
        ],
      }),
      getEffectiveGasPrice(),
    ]);

    const totalGas = commitGas + registerGas;
    const totalWei = totalGas * gasPrice;

    return {
      wei: totalWei,
      eth: parseFloat(formatEther(totalWei)),
      gasEstimate: totalGas,
      gasPrice,
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
