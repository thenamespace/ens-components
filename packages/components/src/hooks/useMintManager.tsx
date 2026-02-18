import { ListingNetwork, NameListing } from "@/types";
import { createMintClient } from "@thenamespace/mint-manager";
import { useMemo } from "react";

const LIST_MANAGER_API = "https://list-manager.namespace.ninja";
const LIST_MANAGER_TESTNET_API = "https://staging.list-manager.namespace.ninja";

interface UseMintManagerParams {
  isTestnet?: boolean;
}

export const useMintManager = ({ isTestnet }: UseMintManagerParams) => {
  const mintClient = useMemo(() => {
     console.info(`Creating a mint clinet, testnet: ${isTestnet}`,)
    return createMintClient({
      cursomRpcUrls: {},
      isTestnet: isTestnet || false,
    });
  }, [isTestnet]);

  const getListingDetails = async (name: string): Promise<NameListing> => {
    const listManagerApi = isTestnet
      ? LIST_MANAGER_TESTNET_API
      : LIST_MANAGER_API;
    const listingNetwork = isTestnet
      ? ListingNetwork.Sepolia
      : ListingNetwork.Mainnet;
    return fetch(
      `${listManagerApi}/api/v1/listing/network/${listingNetwork}/name/${name}`
    ).then(res => res.json());
  };

  return {
    mintClient,
    getListingDetails,
  };
};
