import { INameListing, ListingType } from "@/types";
import {
  ListingNetwork,
  NamespaceListing,
  ListingType as L2ListingType,
} from "@/types/list-manager";
import { SupportedChainName } from "@/types/networks";
import { Chain } from "viem";
import { base, mainnet, sepolia, baseSepolia, optimism } from "viem/chains";

const chains: Record<SupportedChainName, Chain> = {
  base,
  mainnet,
  sepolia,
  baseSepolia,
  optimism,
};

export const getChain = (name: SupportedChainName) => {
  return chains[name];
};

export const getChainById = (id: number) => {
  const chainName = getChainName(id);
  if (chainName) {
    return getChain(chainName as SupportedChainName);
  }
};

export const getChainName = (id: number): SupportedChainName | null => {
  for (const chain of Object.keys(chains)) {
    //@ts-ignore
    if (chains[chain].id === id) {
      return chain as SupportedChainName;
    }
  }
  return null;
};

export const isL2Chain = (id: number) => {
  return [base.id, baseSepolia.id].includes(id as any);
};

export const getChainForListing = (listing: INameListing): Chain => {
  if (!listing) {
    return mainnet;
  }

  if (listing.listingType === ListingType.L2 && listing.registryNetwork) {
    return getChain(listing.registryNetwork);
  }
  return getChain(listing.network);
};

export const getChainForListingV2 = (listing: NamespaceListing): Chain => {
  const isL2Listing =
    listing.type === L2ListingType.L2 &&
    listing.l2Metadata &&
    listing.l2Metadata.registryNetwork;
  const listingNetwork = isL2Listing
    ? listing.l2Metadata?.registryNetwork
    : (listing.nameNetwork as any);
  return getListingNetworkId(listingNetwork);
};

// Listing network is used by listing/minting manager
// so we perform different mappings
// This should be changed to use the same network notation
const networkMappings: Record<ListingNetwork, SupportedChainName> = {
  BASE: "base",
  BASE_SEPOLIA: "baseSepolia",
  MAINNET: "mainnet",
  OPTIMISM: "optimism",
  SEPOLIA: "sepolia",
};

export const getListingNetworkId = (listingNetwork: ListingNetwork) => {
  const chainName = networkMappings[listingNetwork];
  if (!chainName) {
    throw new Error(`No chain mapping found for listing network: ${listingNetwork}`);
  }
  return getChain(chainName);
};

export const getListingNetwork = (chainId: number): ListingNetwork => {
  const networkName = getChainName(chainId);
  for (const network of Object.keys(networkMappings)) {
    //@ts-ignore
    const name = networkMappings[network];
    if (name === networkName) {
      return network as ListingNetwork;
    }
  }
  throw Error(`Could not find listing network for chainId: ${chainId}`);
};
