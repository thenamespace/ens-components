import { Address } from "viem";
import { base, baseSepolia, mainnet, optimism, sepolia } from "viem/chains";

export interface NameListing {
  type: ListingType;
  name: string;
  isVerified: boolean;
  l2Metadata?: {
    isBurnable: boolean;
    isExpirable: boolean;
    registryAddress: Address;
    registryNetwork: ListingNetwork;
  };
  nameNetwork: ListingNetwork;
}

export enum ListingType {
  L1 = "L1",
  L2 = "L2",
}

export enum ListingNetwork {
  Base = "BASE",
  Optimism = "OPTIMISM",
  Mainnet = "MAINNET",
  Sepolia = "SEPOLIA",
  BaseSepolia = "BASE_SEPOLIA",
}

const networksMap: Record<ListingNetwork, number> = {
  [ListingNetwork.Base]: base.id,
  [ListingNetwork.Optimism]: optimism.id,
  [ListingNetwork.Mainnet]: mainnet.id,
  [ListingNetwork.Sepolia]: sepolia.id,
  [ListingNetwork.BaseSepolia]: baseSepolia.id,
};

export const getChainIdForListingNetwork = (
  network: ListingNetwork
): number => {
  return networksMap[network];
};
