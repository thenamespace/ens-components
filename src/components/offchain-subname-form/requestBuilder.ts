import { EnsRecords } from "@/types";
import { ChainName } from "@thenamespace/offchain-manager";
import { coinTypeToChainName } from "./utils";

export interface SubnameRequest {
  addresses: Array<{ chain: ChainName; value: string }>;
  texts: Array<{ key: string; value: string }>;
  owner?: string;
}

/**
 * Convert EnsRecords to the format required by offchain-manager API
 */
export const buildSubnameRequest = (
  ensRecords: EnsRecords,
  ownerAddress?: string
): SubnameRequest => {
  // Convert addresses
  const addresses = ensRecords.addresses
    .map((addr) => {
      const chainName = coinTypeToChainName(addr.coinType);
      if (!chainName) {
        console.warn(`Unsupported coin type: ${addr.coinType}, skipping...`);
        return null;
      }
      return {
        chain: chainName,
        value: addr.value,
      };
    })
    .filter((addr) => addr !== null) as Array<{ chain: ChainName; value: string }>;

  // Convert texts
  const texts = ensRecords.texts.map((text) => ({
    key: text.key,
    value: text.value,
  }));

  // Build request
  const request: SubnameRequest = {
    addresses,
    texts,
  };

  // Add owner if provided
  if (ownerAddress && ownerAddress.trim() !== "") {
    request.owner = ownerAddress;
  }

  return request;
};
