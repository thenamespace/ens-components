import { MintClient, createMintClient } from "@namespacesdk/mint-manager";
import { AppEnv } from "@/environment";
import { base, baseSepolia, optimism, mainnet, sepolia } from "viem/chains";

// Build Sepolia RPC URL - use custom RPC if provided, otherwise use public endpoint
const getSepoliaRpcUrl = (): string => {
    if (AppEnv.testnetRpcUrl) {
        return AppEnv.testnetRpcUrl;
    }
    // Use public Sepolia RPC endpoint as fallback
    return "https://rpc.sepolia.org";
};

const mintClient = createMintClient({
    environment: AppEnv.isTestnet ? "staging" : "production",
    isTestnet: AppEnv.isTestnet,
    mintSource: `${AppEnv.isTestnet ? "staging.namespace-dapp-v2" : "namespace-dapp-v2"}`,
    cursomRpcUrls: {
        [base.id]: "/rpc/base",
        [optimism.id]: "/rpc/optimism",
        [baseSepolia.id]: "/rpc/baseSepolia",
        [mainnet.id]: "/rpc/mainnet",
        [sepolia.id]: getSepoliaRpcUrl()
    }
})

export const useMintClient = (): MintClient => {
    return mintClient
}