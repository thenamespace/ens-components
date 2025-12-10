import { SupportedNetwork } from "@/types";

const blockExplorers: Record<SupportedNetwork, string> = {
    mainnet: "https://etherscan.io",
    base: "https://basescan.org",
    baseSepolia: "https://sepolia.basescan.org",
    sepolia: "https://sepolia.etherscan.io",
    optimism: "https://optimistic.etherscan.io"
}

export const useBlockExplorerUrl = (network: SupportedNetwork): string => {

    return blockExplorers[network];
}