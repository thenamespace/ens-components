import { ListingNetwork, NameListing } from "@/types";
import { createMintClient } from "@thenamespace/mint-manager";
import { useCallback, useMemo } from "react";
import { usePublicClient } from "wagmi";
import { mainnet, sepolia, base, baseSepolia, optimism } from "viem/chains";

const LIST_MANAGER_API = "https://list-manager.namespace.ninja";
const LIST_MANAGER_TESTNET_API = "https://staging.list-manager.namespace.ninja";

interface UseMintManagerParams {
  isTestnet?: boolean;
}

// Extract the RPC URL from a wagmi public client's HTTP transport, if present.
function getTransportUrl(
  client: ReturnType<typeof usePublicClient>
): string | undefined {
  const transport = client?.transport as
    | { type?: string; url?: string }
    | undefined;
  return transport?.type === "http" ? transport.url : undefined;
}

export const useMintManager = ({ isTestnet }: UseMintManagerParams) => {
  const mainnetClient = usePublicClient({ chainId: mainnet.id });
  const sepoliaClient = usePublicClient({ chainId: sepolia.id });
  const baseClient = usePublicClient({ chainId: base.id });
  const baseSepoliaClient = usePublicClient({ chainId: baseSepolia.id });
  const optimismClient = usePublicClient({ chainId: optimism.id });

  const mintClient = useMemo(() => {
    const cursomRpcUrls: Record<string, string> = {};

    const clients = [
      mainnetClient,
      sepoliaClient,
      baseClient,
      baseSepoliaClient,
      optimismClient,
    ];
    for (const client of clients) {
      const url = getTransportUrl(client);
      if (client && url) {
        cursomRpcUrls[String(client.chain.id)] = url;
      }
    }

    return createMintClient({
      cursomRpcUrls,
      isTestnet: isTestnet || false,
    });
  }, [
    isTestnet,
    mainnetClient,
    sepoliaClient,
    baseClient,
    baseSepoliaClient,
    optimismClient,
  ]);

  const getListingDetails = useCallback(
    async (name: string): Promise<NameListing> => {
      const listManagerApi = isTestnet
        ? LIST_MANAGER_TESTNET_API
        : LIST_MANAGER_API;
      const listingNetwork = isTestnet
        ? ListingNetwork.Sepolia
        : ListingNetwork.Mainnet;
      return fetch(
        `${listManagerApi}/api/v1/listing/network/${listingNetwork}/name/${name}`
      ).then(async res => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Unknown error");
        }
        return data;
      });
    },
    [isTestnet]
  );

  return {
    mintClient,
    getListingDetails,
  };
};
