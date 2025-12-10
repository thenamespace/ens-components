import { Layer2Network, SupportedChainName, Web3Network } from "@/types";
import { fallback, FallbackTransport, http, Transport } from "viem";
import { AppEnv } from "@/environment";

// Build Sepolia RPC URLs - use custom RPC if provided, otherwise fallback to defaults
const getSepoliaRpcUrls = (): string[] => {
    const urls: string[] = [];
    
    // Add custom RPC URL if provided
    if (AppEnv.testnetRpcUrl) {
        urls.push(AppEnv.testnetRpcUrl);
    }
    
    // Add default proxy endpoint
    urls.push("/rpc/sepolia");
    
    // Add public fallback endpoints
    urls.push(
        "https://rpc.sepolia.org",
        "https://ethereum-sepolia-rpc.publicnode.com",
        "https://sepolia.gateway.tenderly.co"
    );
    
    return urls;
};

const Providers: Record<SupportedChainName, FallbackTransport | Transport> = {
    mainnet: http("/rpc/mainnet"),
    sepolia: fallback(getSepoliaRpcUrls().map(url => http(url))),
    base: http(),
    baseSepolia: http(),
    optimism: http("/rpc/optimism")

}

export const getProvider = (network :Web3Network | Layer2Network) => {
    return Providers[network];
}