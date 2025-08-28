export interface EnsRecords {
    addresses: EnsAddressRecord[]
    texts: EnsTextRecord[]
    contenthash?: ContenthashRecord
}

export interface EnsTextRecord {
    key: string
    value: string
}

export interface EnsAddressRecord {
    coinType: number
    value: string
}


export interface ContenthashRecord {
    protocol: string
    value: string
}