import { MintClient, createMintClient } from "@namespacesdk/mint-manager";
import { AppEnv } from "@/environment";
import { base, baseSepolia, optimism, mainnet, sepolia } from "viem/chains";

const mintClient = createMintClient({
    environment: AppEnv.isTestnet ? "staging" : "production",
    isTestnet: AppEnv.isTestnet,
    mintSource: `${AppEnv.isTestnet ? "staging.namespace-dapp-v2" : "namespace-dapp-v2"}`,
    cursomRpcUrls: {
        [base.id]: "/rpc/base",
        [optimism.id]: "/rpc/optimism",
        [baseSepolia.id]: "/rpc/baseSepolia",
        [mainnet.id]: "/rpc/mainnet",
        [sepolia.id]: "/rpc/sepolia"
    }
})

export const useMintClient = (): MintClient => {
    return mintClient
}