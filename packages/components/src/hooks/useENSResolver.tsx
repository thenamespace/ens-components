import { Address, namehash, parseAbi, PublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { ABIS } from "./abis";
import { getEnsContracts } from "@thenamespace/addresses";
import {
    convertToMulticallResolverData,
    detectResolverStyle,
    dnsEncodeName,
    encodeRecordsUpdate,
    EnsRecordsDiff,
    equalsIgnoreCase,
} from "@/utils";

const ENSV2_UNIVERSAL_RESOLVER: Address = "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe";
const universalResolverAbi = parseAbi([
    "function findResolver(bytes name) view returns (address resolver, bytes32 node, uint256 offset)",
]);

const supportedResolversKey = "ns-supported-resolvers";

interface UpdateRecordsRequest {
    name: string
    resolver: Address
    diff: EnsRecordsDiff
}

export const useENSResolver = ({
    resolverChainId,
    isTestnet,
    version = 1,
}: {
    resolverChainId: number;
    isTestnet?: boolean;
    version?: 1 | 2;
}) => {
    const mainnetClient = usePublicClient({
        chainId: isTestnet ? sepolia.id : mainnet.id,
    });
    const resolverClient = usePublicClient({ chainId: resolverChainId });
    const { data: walletClient } = useWalletClient({ chainId: resolverChainId });
    const { address } = useAccount()

    const setUpdateRecordsTx = async (update: UpdateRecordsRequest) => {

        const { name, diff, resolver } = update;

        const style = await detectResolverStyle(resolverClient as PublicClient, resolver);
        if (style !== "node") {
            const tx = encodeRecordsUpdate(style, resolver, name, diff);
            await resolverClient!.call({ account: address, ...tx });
            return walletClient!.sendTransaction({
                ...tx,
                account: walletClient!.account,
                chain: walletClient!.chain,
            });
        }

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

    const getResolverAddress = async (name: string): Promise<Address> => {
        if (version === 2) {
            const [resolver] = await mainnetClient!.readContract({
                address: ENSV2_UNIVERSAL_RESOLVER,
                abi: universalResolverAbi,
                functionName: "findResolver",
                args: [dnsEncodeName(name)],
            });
            return resolver;
        }
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
