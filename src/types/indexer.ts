export interface L2IndexedSubname {
    name: string;
    namehash: string;
    owner: string;
    avatar?: string;
    chainId: number
    expiry: number
    parentHash: string
    records: {
      addresses: Record<string, string>;
      texts: Record<string, string>;
      contenthash: string;
    };
    metadata: {
      blockNumber: number;
      price: number;
      fee: number;
      tx: string;
    };
}

export interface EnsNameMintStats {
    totalL1Subnames: number
    totalL2Subnames: number
    totalPrice: number //
    totalFee: number 
    totalVolume: number
}