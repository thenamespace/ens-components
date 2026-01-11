import { ListingNetwork, NameListing } from "@/types";
import { createMintClient } from "@thenamespace/mint-manager";
import { useCallback, useMemo } from "react";

const LIST_MANAGER_API = "https://list-manager.namespace.ninja";
const LIST_MANAGER_TESTNET_API = "https://staging.list-manager.namespace.ninja";

interface UseMintManagerParams {
  isTestnet?: boolean;
}

export const useMintManager = ({ isTestnet }: UseMintManagerParams) => {
  const mintClient = useMemo(() => {
    return createMintClient({
      cursomRpcUrls: {},
      isTestnet: isTestnet || false,
    });
  }, [isTestnet]);

  const getListManagerApi = useCallback(() => {
    return isTestnet ? LIST_MANAGER_TESTNET_API : LIST_MANAGER_API;
  }, [isTestnet]);

  const getListingNetwork = useCallback(() => {
    return isTestnet ? ListingNetwork.Sepolia : ListingNetwork.Mainnet;
  }, [isTestnet]);

  const getListingDetails = useCallback(
    async (name: string): Promise<NameListing> => {
      return fetch(
        `${getListManagerApi()}/api/v1/listing/network/${getListingNetwork()}/name/${name}`
      ).then((res) => res.json());
    },
    [getListManagerApi, getListingNetwork]
  );

  return {
    mintClient,
    getListingDetails,
  };
};
