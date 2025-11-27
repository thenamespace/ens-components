import { useMainChain } from "../web3/use-main-chain";
import { useWeb3Clients } from "../web3/use-web3-clients";
import { Address, encodeFunctionData, Hash, namehash, parseAbi } from "viem";
import { getL1NamespaceContracts } from "@namespacesdk/addresses";
import { Abis, getEnsContracts } from "@/web3";
import { useAccount } from "wagmi";
import { equalsIgnoreCase } from "@/utils";

const ABI = parseAbi([
  "struct ResolutionConfig {bool resolveOffchain;uint resolutionType;}",
  "function configs(bytes32 node) public returns(ResolutionConfig)",
]);

export const useHybridResolver = () => {
  const { networkId, isTestnet, networkName } = useMainChain();
  const { publicClient, walletClient } = useWeb3Clients({ chainId: networkId });
  const { hybridResolver, oldHybridResolver } = getL1NamespaceContracts(isTestnet);
  const { address } = useAccount();

  const getResolutionChainId = (
    ensName: string,
    isOldResolver = false
  ): Promise<{ resolveOffchain: boolean; resolutionType: bigint }> => {
    return publicClient!.readContract({
      abi: ABI,
      functionName: "configs",
      address: isOldResolver ? oldHybridResolver : hybridResolver,
      args: [namehash(ensName)],
    });
  };

  const setHybridResolver = async (name: string): Promise<Hash> => {
    const { ensRegistry, nameWrapper } = getEnsContracts(networkName);

    const nameNode = namehash(name);
    // Try to set resolver first via name wrapper
    // if this does not success, try with ens registry
    // this is implemented instead of check whether name is wrapped or not
    try {
      const { request } = await publicClient!.simulateContract({
        abi: Abis.NAME_WRAPPER,
        address: nameWrapper,
        functionName: "setResolver",
        args: [nameNode, hybridResolver],
        account: address!,
      });
      return await walletClient!.writeContract(request);
    } catch (err) {
      // do nothing, try ens registry setResolver func
    }

    const { request } = await publicClient!.simulateContract({
      abi: Abis.ENS_REGISTRY,
      address: ensRegistry,
      functionName: "setResolver",
      args: [namehash(name), hybridResolver],
      account: address!,
    });

    return await walletClient!.writeContract(request);
  };

  const updateResolverConfig = async (
    name: string,
    chainId: number,
    currentResolver: Address
  ) => {
    const multicallData: Hash[] = [];
    const nameNode = namehash(name);
    multicallData.push(
      encodeFunctionData({
        abi: Abis.HYBRID_RESOLVER,
        args: [nameNode, BigInt(chainId)],
        functionName: "setResolutionType",
      })
    );

    const { publicResolver } = getEnsContracts(networkName);

    if (!equalsIgnoreCase(currentResolver, publicResolver)) {
      multicallData.push(
        encodeFunctionData({
          abi: Abis.HYBRID_RESOLVER,
          args: [nameNode, currentResolver],
          functionName: "setFallbackResolver",
        })
      );
    }

    const { request } = await publicClient!.simulateContract({
      abi: Abis.HYBRID_RESOLVER,
      address: hybridResolver,
      functionName: "multicall",
      args: [multicallData],
      account: address!,
    });

    return await walletClient!.writeContract(request);
  };

  return {
    getResolutionChainId,
    setHybridResolver,
    updateResolverConfig,
    hybridResolverAddress: hybridResolver,
  };
};
