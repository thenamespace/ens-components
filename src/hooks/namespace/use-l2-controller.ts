import { useAuthContext } from "@/context";
import { useWeb3Clients } from "../web3/use-web3-clients";
import { useListingManager } from "./use-listing-manager";
import { useAccount } from "wagmi";
import { Address, Hash } from "viem";
import {
  GetRegistryParametersResponse,
} from "@/types/list-manager";
import { useMainChain } from "../web3/use-main-chain";
import { Abis, getListingNetwork } from "@/web3";
import { getL2NamespaceContracts } from "@namespacesdk/addresses";

export const useL2Controller = ({ chainId }: { chainId: number }) => {
  const { publicClient, walletClient } = useWeb3Clients({ chainId });
  const { address } = useAccount();
  const listManager = useListingManager();
  const { getSiweToken } = useAuthContext();
  const { isTestnet } = useMainChain();

  const getRegistryDeployParameters = async (
    ensName: string
  ): Promise<GetRegistryParametersResponse> => {
    const currentAddress = address as Address;
    const siweToken = getSiweToken?.(currentAddress);

 
    const listingNetwork = getListingNetwork(chainId)
    return await listManager.getRegistryDeploymentParameters(
      {
        ensName: ensName,
        isTestnet: isTestnet,
        registryNetwork: listingNetwork,
      },
      siweToken!
    );
  };

  const deployL2Registry = async (parameters: GetRegistryParametersResponse): Promise<Hash> => {
    const currentAddress = address as Address;
    const { controller} = getL2NamespaceContracts(chainId);
    const { request } = await publicClient!.simulateContract({
        abi: Abis.L2_MINT_CONTOLLER,
        address: controller,
        functionName: "deploy",
        args: [parameters.parameters, parameters.signature, []],
        account: currentAddress
    })

    return walletClient!.writeContract(request);
  };

  return {
    deployL2Registry,
    getRegistryDeployParameters
  };
};
