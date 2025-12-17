import { Hash, namehash, parseAbi, zeroAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { usePublicClient, useWalletClient } from "wagmi";
import { getEnsContracts } from "@thenamespace/addresses"
import { equalsIgnoreCase } from "@/utils";
import { ABIS } from "./abis";

const ENS_REGISTRY_ABI = parseAbi([
  'function owner(bytes32) view returns (address)'
])

export const useRegisterENS = ({ isTestnet }: { isTestnet: boolean }) => {
  const publicClient = usePublicClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });
  const { data: walletClient } = useWalletClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });

  const getRegistrationPrice = async (label: string): Promise<bigint> => {
    
    const price = await publicClient!.readContract({
      abi: ABIS.ETH_REGISTRAR_CONTOLLER,
      functionName: "rentPrice",
      args: [label],
      address: getEthController()
    }) as { base: bigint, premium: bigint }

    return 0n;
  };

  const isEnsAvailable = async (label: string): Promise<boolean> => {
    const ownerAddress = await publicClient!.readContract({
      functionName: "owner",
      abi: ENS_REGISTRY_ABI,
      args: [namehash(`${label}.eth`)],
      address: getEnsRegistry()
    })
    return equalsIgnoreCase(ownerAddress, zeroAddress);
  };

  const sendCommitmentTx = async (): Promise<Hash> => {
    return "0x";
  };

  const getRegistrationCommitment = async (): Promise<Hash> => {
    return "0x";
  };

  const sendRegisterTx = async () => {

  }

  const getEthController = () => {
    return getEnsContracts(isTestnet).ethRegistrarController;
  }

  const getEnsRegistry = () => {
    return getEnsContracts(isTestnet).ensRegistry;
  }

  return {
    isEnsAvailable,
    getRegistrationPrice
  }
};
