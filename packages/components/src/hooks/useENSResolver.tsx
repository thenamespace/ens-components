import { Address, namehash } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ABIS } from "./abis";
import { getEnsContracts } from "@thenamespace/addresses";
import { convertToMulticallResolverData, EnsRecordsDiff, equalsIgnoreCase } from "@/utils";

const supportedResolversKey = "ns-supported-resolvers";

interface UpdateRecordsRequest {
    name: string
    resolver: Address
    diff: EnsRecordsDiff
}

export const useENSResolver = ({
    resolverChainId,
    isTestnet,
}: {
    resolverChainId: number;
    isTestnet?: boolean;
}) => {
    const mainnetClient = usePublicClient({
        chainId: isTestnet ? sepolia.id : mainnet.id,
    });
    const resolverClient = usePublicClient({ chainId: resolverChainId });
    const { data: walletClient } = useWalletClient({ chainId: resolverChainId });
    const { address } = useAccount()

    const setUpdateRecordsTx = async (update: UpdateRecordsRequest) => {

        const { name, diff, resolver } = update;
        const resolverData = convertToMulticallResolverData(name, diff);

        const { request } = await resolverClient!.simulateContract({
            address: resolver,
            abi: ABIS.RESOLVER,
            functionName: "multicall",
            args: [resolverData],
            account: address
        })

        return walletClient!.writeContract(request)

    }

    const isResolverSupported = async (
        resolverAddress: Address
    ): Promise<boolean> => {
        const cache = isCachedSupportedResolver(resolverAddress);
        if (cache.cached) {
            return cache.supported;
        }

        const isSupported = await resolverSupportsInterfaces(resolverAddress);
        saveResolverCache(resolverAddress, isSupported);
        return isSupported;
    };

    const resolverSupportsInterfaces = async (
        resolver: Address
    ): Promise<boolean> => {
        // TODO: We should check wether a resolver contract supports
        // required interfaces (setAddr/setText/setContenthash/multicall)
        return true;
    };

    const getResolverAddress = (name: string): Promise<Address> => {
        return mainnetClient!.readContract({
            address: getEnsRegistry(),
            abi: ABIS.ENS_REGISTRY,
            functionName: "resolver",
            args: [namehash(name)],
        }) as Promise<Address>;
    };

    const getCachedSupportedResolvers = (): Record<string, boolean> => {
        const resolversCacheRaw = localStorage.getItem(supportedResolversKey);
        if (!resolversCacheRaw) {
            return {} as Record<string, boolean>;
        }

        try {
            const resolversCache = JSON.parse(resolversCacheRaw);
            return resolversCache as Record<string, boolean>;
        } catch (err) {
            console.error("Failed to parse resolver cache", err);
            return {};
        }
    };

    const saveResolverCache = (resolver: Address, supported: boolean) => {
        try {
            const cache = getCachedSupportedResolvers();
            cache[resolver] = supported;
            localStorage.setItem(supportedResolversKey, JSON.stringify(cache));
        } catch (err) {
            console.error("Failed to save resolver cache in local storage", err);
        }
    };

    const isCachedSupportedResolver = (
        resolver: Address
    ): { cached: boolean; supported: boolean } => {
        if (equalsIgnoreCase(resolver, getEnsPublicResolver())) {
            return { cached: true, supported: true };
        }

        try {
            const cache = getCachedSupportedResolvers();
            const _lowercase = resolver.toLocaleLowerCase();
            if (cache[_lowercase] === undefined) {
                return { cached: false, supported: false };
            }

            return { cached: true, supported: cache[_lowercase] };
        } catch (err) {
            return { cached: false, supported: false };
        }
    };

    const getEnsRegistry = (): Address => {
        return getEnsContracts(isTestnet).ensRegistry;
    };

    const getEnsPublicResolver = (): Address => {
        return getEnsContracts(isTestnet).publicResolver;
    };

    return {
        getResolverAddress,
        isResolverSupported,
        setUpdateRecordsTx
    };
};
