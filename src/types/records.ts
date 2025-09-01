export interface EnsRecords {
  addresses: EnsAddressRecord[];
  texts: EnsTextRecord[];
  contenthash?: EnsContenthashRecord;
}

export interface EnsTextRecord {
  key: string;
  value: string;
}

export interface EnsAddressRecord {
  coinType: number;
  value: string;
}

export interface EnsContenthashRecord {
  protocol: ContenthashProtocol;
  value: string;
}

export enum ContenthashProtocol {
  Ipfs = "ipfs",
  Onion = "onion3",
  Arweave = "arweave",
  Skynet = "skynet",
  Swarm = "swarm"
}