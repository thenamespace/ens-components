import { SupportedChainName } from "@/types";

const blockExplorerURLS: Record<SupportedChainName, string> = {
    base: "https://basescan.org",
    baseSepolia: "https://sepolia.basescan.org",
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    optimism: "https://optimistic.etherscan.io"
}

export const useBlockExplorer = (network: SupportedChainName) => {

    return blockExplorerURLS[network] || ""
}