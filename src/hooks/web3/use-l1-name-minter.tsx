import { MintParameters } from "@/types";
import { useMainChain } from "./use-main-chain";
import { Hash, zeroHash } from "viem";
import MINTER_ABI from "./abi/l1-name-minter.json";
import { useWeb3Clients } from "./use-web3-clients";
import { getL1NamespaceContracts } from "@/web3";

export const useL1NameMinter = () => {
  const { networkId, networkName } = useMainChain();
  const { publicClient, walletClient } = useWeb3Clients({ chainId: networkId });

  const mint = async (
    parameters: MintParameters,
    signature: Hash,
    resolverData: Hash[] = []
  ): Promise<Hash> => {
    if (!publicClient || !walletClient) {
      return zeroHash;
    }

    const { mintController } = getL1NamespaceContracts();
    let writeRequest: any;

    const totalValue =
      BigInt(parameters.mintPrice) + BigInt(parameters.mintFee);
    if (resolverData.length === 0) {
      const { request } = await publicClient.simulateContract({
        abi: MINTER_ABI,
        address: mintController,
        functionName: "mint",
        args: [parameters, signature],
        value: totalValue,
      });
      writeRequest = request;
    } else {
      const { request } = await publicClient.simulateContract({
        abi: MINTER_ABI,
        address: mintController,
        functionName: "mintWithData",
        args: [parameters, signature, resolverData],
        value: totalValue,
      });
      writeRequest = request;
    }
    return await walletClient.writeContract(writeRequest);
  };

  return {
    mint,
  };
};
