import {
  mainnet,
  sepolia,
  base,
  baseSepolia,
  optimism,
  optimismSepolia,
  arbitrum,
  arbitrumSepolia,
  polygon,
  polygonMumbai,
  celo,
  celoAlfajores,
  zora,
  zoraSepolia,
} from "viem/chains";

interface BlockExplorerConfig {
  name: string;
  url: string;
}

// Map of chain IDs to their block explorer configurations
const BLOCK_EXPLORER_MAP: Record<number, BlockExplorerConfig> = {
  // Ethereum
  [mainnet.id]: {
    name: "Etherscan",
    url: "https://etherscan.io",
  },
  [sepolia.id]: {
    name: "Etherscan",
    url: "https://sepolia.etherscan.io",
  },
  // Base
  [base.id]: {
    name: "Basescan",
    url: "https://basescan.org",
  },
  [baseSepolia.id]: {
    name: "Basescan",
    url: "https://sepolia.basescan.org",
  },
  // Optimism
  [optimism.id]: {
    name: "Optimistic Etherscan",
    url: "https://optimistic.etherscan.io",
  },
  [optimismSepolia.id]: {
    name: "Optimistic Etherscan",
    url: "https://sepolia-optimism.etherscan.io",
  },
  // Arbitrum
  [arbitrum.id]: {
    name: "Arbiscan",
    url: "https://arbiscan.io",
  },
  [arbitrumSepolia.id]: {
    name: "Arbiscan",
    url: "https://sepolia.arbiscan.io",
  },
  // Polygon
  [polygon.id]: {
    name: "PolygonScan",
    url: "https://polygonscan.com",
  },
  [polygonMumbai.id]: {
    name: "PolygonScan",
    url: "https://mumbai.polygonscan.com",
  },
  // Celo
  [celo.id]: {
    name: "Celo Explorer",
    url: "https://celoscan.io",
  },
  [celoAlfajores.id]: {
    name: "Celo Explorer",
    url: "https://alfajores.celoscan.io",
  },
  // Zora
  [zora.id]: {
    name: "Zora Explorer",
    url: "https://explorer.zora.energy",
  },
  [zoraSepolia.id]: {
    name: "Zora Explorer",
    url: "https://sepolia.explorer.zora.energy",
  },
};

export const getBlockExplorer = (chainId: number) => {
  const config = BLOCK_EXPLORER_MAP[chainId];
  
  if (!config) {
    // Fallback to Etherscan for unknown chains
    return {
      name: "Etherscan",
      url: "https://etherscan.io",
    };
  }
  
  return config;
};

export const getBlockExplorerTransactionUrl = (chainId: number, hash: string): string => {
  const explorer = getBlockExplorer(chainId);
  return `${explorer.url}/tx/${hash}`;
};

export const getBlockExplorerAddressUrl = (chainId: number, address: string): string => {
  const explorer = getBlockExplorer(chainId);
  return `${explorer.url}/address/${address}`;
};

export const getBlockExplorerName = (chainId: number): string => {
  const explorer = getBlockExplorer(chainId);
  return explorer.name;
};

export const getEnsAppUrl = (ensName: string, isTestnet: boolean = false): string => {
  const baseUrl = isTestnet
    ? "https://sepolia.app.ens.domains"
    : "https://app.ens.domains";
  return `${baseUrl}/${ensName}`;
};

