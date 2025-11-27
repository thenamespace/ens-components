import { Address, namehash, parseAbi, zeroAddress } from "viem";
import { useMainChain } from "./use-main-chain";
import { useMainPublicClient } from "./use-main-public-client";
import { getEnsContracts } from "@/web3";

export const useNameWrapper = () => {
  const { networkName } = useMainChain();
  const publicClient = useMainPublicClient();

  const isNameAvailable = async (fullName: string): Promise<boolean> => {
    if (!publicClient) {
      return false;
    }

    const { nameWrapper } = getEnsContracts(networkName);

    const ownerAddr = (await publicClient.readContract({
      abi: parseAbi(["function ownerOf(uint256) external returns (address)"]),
      address: nameWrapper,
      functionName: "ownerOf",
      args: [namehash(fullName)],
    })) as Address;

    return ownerAddr === zeroAddress;
  };

  return {
    isNameAvailable,
  };
};
