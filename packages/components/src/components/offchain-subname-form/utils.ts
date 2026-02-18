import { ContenthashProtocol, EnsContenthashRecord, EnsRecords } from "@/types";
import { SubnameDTO, ChainName, getCoinType } from "@thenamespace/offchain-manager";
import { supportedContenthashRecords } from "@/constants/records/contenthashConstants";
import { supportedAddresses } from "@/constants/records/addressConstants";
import { convertEVMChainIdToCoinType } from "@/utils";

/**
 * Map coinType to ChainName
 * This reverses the getCoinType() function
 */
export const coinTypeToChainName = (_coinType: number): ChainName | null => {
  // Iterate through all ChainName values to find the matching coin type
  const chainNames = Object.values(ChainName);
  
  for (const chainName of chainNames) {
    try {
        const coinType = getCoinType(chainName);
      if (_coinType === coinType || convertEVMChainIdToCoinType(coinType) === _coinType) {
        return chainName;
      }
    } catch (e) {
      // Skip if getCoinType throws for this chain
      continue;
    }
  }
  
  return null;
};

/**
 * Parse contenthash string and extract protocol and value
 * Examples: "ipfs://Qm...", "ar://abc123", "bzz://..."
 */
const parseContenthash = (contenthash: string): EnsContenthashRecord | undefined => {
  if (!contenthash) return undefined;

  // Try to match against known protocol prefixes
  for (const record of supportedContenthashRecords) {
    if (contenthash.startsWith(record.protocolPrefix)) {
      const value = contenthash.substring(record.protocolPrefix.length);
      return {
        protocol: record.protocol,
        value: value,
      };
    }
  }

  // If no prefix matched, assume it's IPFS (common default)
  // and the whole string is the value
  if (contenthash.startsWith('Qm') || contenthash.startsWith('bafy')) {
    return {
      protocol: ContenthashProtocol.Ipfs,
      value: contenthash,
    };
  }

  return undefined;
};

/**
 * Convert offchain manager SubnameDTO to EnsRecords format
 */
export const offchainRecordsToEnsRecords = (subname: SubnameDTO): EnsRecords => {
  const ensRecords: EnsRecords = {
    addresses: [],
    texts: [],
  };

  // Convert text records
  if (subname.texts) {
    Object.keys(subname.texts).forEach((key) => {
      ensRecords.texts.push({ key: key, value: subname.texts[key] });
    });
  }

  // Convert address records
  // The addresses object can have either coin types or chainIds as keys
  if (subname.addresses) {
    Object.keys(subname.addresses).forEach((keyStr) => {
      const keyNum = parseInt(keyStr, 10);
      const value = subname.addresses[keyStr];

      if (isNaN(keyNum) || !value) return;

      let coinType: number;

      // If it's already a converted EVM coin type (>= 0x80000000), use as-is
      if (keyNum >= 0x80000000) {
        coinType = keyNum;
      } else {
        // Check if this key is an EVM chainId in supportedAddresses
        const evmChain = supportedAddresses.find(
          (addr) => addr.chainId === keyNum && addr.isEMV
        );

        if (evmChain) {
          // It's an EVM chainId - convert it
          coinType = convertEVMChainIdToCoinType(keyNum);
        } else {
          // Not an EVM chain - use as coin type directly
          // This handles Bitcoin (0), Solana (501), Ethereum (60), etc.
          coinType = keyNum;
        }
      }

      ensRecords.addresses.push({ coinType, value });
    });
  }

  // Convert contenthash
  if (subname.contenthash) {
    const parsedContenthash = parseContenthash(subname.contenthash);
    if (parsedContenthash) {
      ensRecords.contenthash = parsedContenthash;
    }
  }

  return ensRecords;
};