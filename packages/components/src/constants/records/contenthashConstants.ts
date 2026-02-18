import { ContenthashProtocol } from "@/types";

export interface SupportedContenthashRecord {
  protocol: ContenthashProtocol;
  label: string;
  protocolPrefix: string;
}

export const supportedContenthashRecords: SupportedContenthashRecord[] = [
  {
    protocol: ContenthashProtocol.Ipfs,
    label: "IPFS",
    protocolPrefix: "ipfs://",
  },
  {
    protocol: ContenthashProtocol.Onion,
    label: "ONION",
    protocolPrefix: "onion3://",
  },
  {
    protocol: ContenthashProtocol.Arweave,
    label: "ARWEAVE",
    protocolPrefix: "ar://",
  },
  {
    protocol: ContenthashProtocol.Skynet,
    label: "SKYNET",
    protocolPrefix: "sia://",
  },
  {
    protocol: ContenthashProtocol.Swarm,
    label: "SWARM",
    protocolPrefix: "bzz://",
  },
];

export const getSupportedChashByProtocol = (
  protocol: ContenthashProtocol
): SupportedContenthashRecord | undefined => {
  return supportedContenthashRecords.find(chash => chash.protocol === protocol);
};

// Simple contenthash validation based on protocol format
export const isContenthashValid = (
  protocol: ContenthashProtocol,
  value: string
): boolean => {
  if (!value || value.trim().length === 0) return false;
  
  switch (protocol) {
    case ContenthashProtocol.Ipfs:
      // IPFS CIDv0 (Qm...) or CIDv1 (bafy...)
      return /^(Qm[1-9A-HJ-NP-Za-km-z]{44}|b[a-z2-7]{58,})$/i.test(value);
    case ContenthashProtocol.Onion:
      // Onion v3 addresses are 56 characters
      return /^[a-z2-7]{56}$/i.test(value);
    case ContenthashProtocol.Arweave:
      // Arweave transaction IDs are 43 characters base64url
      return /^[a-zA-Z0-9_-]{43}$/.test(value);
    case ContenthashProtocol.Skynet:
      // Skynet skylinks are 46 characters
      return /^[a-zA-Z0-9_-]{46}$/.test(value);
    case ContenthashProtocol.Swarm:
      // Swarm hashes are 64 hex characters
      return /^[a-fA-F0-9]{64}$/.test(value);
    default:
      return value.length > 0;
  }
};
