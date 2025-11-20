import { ContenthashProtocol } from "@/types";
import { encode } from "@ensdomains/content-hash";

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

export const isContenthashValid = (
  protocol: ContenthashProtocol,
  value: string
) => {
  try {
    encode(protocol, value);
    return true;
  } catch (err) {
    console.log(err, "ERR HERE");
    return false;
  }
};
