import { formatEther, Hash, namehash, parseAbi, zeroAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { usePublicClient, useWalletClient } from "wagmi";
import { getEnsContracts } from "@thenamespace/addresses";
import { equalsIgnoreCase, formatFloat } from "@/utils";
import { ABIS } from "./abis";

const SECONDS_IN_YEAR = 31_536_000;
interface RentPriceResponse {
  wei: bigint
  eth: number
}

const ENS_REGISTRY_ABI = parseAbi([
  "function owner(bytes32) view returns (address)",
]);

export const useRegisterENS = ({ isTestnet }: { isTestnet: boolean }) => {
  const publicClient = usePublicClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });
  const { data: walletClient } = useWalletClient({
    chainId: isTestnet ? sepolia.id : mainnet.id,
  });

  const getRegistrationPrice = async (
    label: string,
    expiryInYears: number = 1
  ): Promise<RentPriceResponse> => {

    const price = (await publicClient!.readContract({
        abi: ABIS.ETH_REGISTRAR_CONTOLLER,
        functionName: "rentPrice",
        args: [label, expiryInYears * SECONDS_IN_YEAR],
        address: getEthController(),
      })) as { base: bigint; premium: bigint };
      console.log(price, "PRICE!!");

      const totalPrice = price.base + price.premium;


    return {
      wei: totalPrice,
      eth: formatFloat(formatEther(totalPrice, "wei"),4)
    }
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

  const sendCommitmentTx = async (): Promise<Hash> => {
    return "0x";
  };

  const getRegistrationCommitment = async (): Promise<Hash> => {
    return "0x";
  };

  const sendRegisterTx = async () => {};

  const getEthController = () => {
    return getEnsContracts(isTestnet).ethRegistrarController;
  };

  const getEnsRegistry = () => {
    return getEnsContracts(isTestnet).ensRegistry;
  };

  return {
    isEnsAvailable,
    getRegistrationPrice,
  };
};
