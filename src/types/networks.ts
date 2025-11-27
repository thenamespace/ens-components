import { baseSepolia, sepolia } from "viem/chains";
import { ListingNetwork } from "./list-manager";
import { List } from "antd";

export type Web3Network = "mainnet" | "sepolia";
export type Layer2Network = "base" | "baseSepolia" | "optimism"

export type SupportedChainName = Web3Network | Layer2Network;

export const isTestnet = (chainId: number) => {
    return [sepolia.id, baseSepolia.id].includes(chainId as any);
}

export const allSupportedChains: SupportedChainName[] = ["base", "baseSepolia", "mainnet", "sepolia", "optimism"];

export const isL2Chain = (network: SupportedChainName) => {
    return ["base", "baseSepolia", "optimism"].includes(network);
}

export enum SupportedNetwork {
    Mainnet = "mainnet",
    Sepolia = "sepolia",
    Optimism = "optimism",
    BaseSepolia = "baseSepolia",
    Base = "base"
}

const listingNetworkMap: Record<SupportedNetwork, ListingNetwork> = {
    base: ListingNetwork.Base,
    baseSepolia: ListingNetwork.BaseSepolia,
    mainnet: ListingNetwork.Mainnet,
    optimism: ListingNetwork.Optimism,
    sepolia: ListingNetwork.Sepolia
}

export const toListingNetwork = (network: SupportedNetwork): ListingNetwork => {
    return listingNetworkMap[network];
}

export type SupportedNetworkType = "mainnet" |  "sepolia" | "optimism" | "baseSepolia" | "base"