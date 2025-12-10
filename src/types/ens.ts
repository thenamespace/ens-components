import { Address } from "viem"
import { Layer2Network } from "./networks"
import { INameListing } from "./listing"
import { EnsTextRecord, EnsAddressRecord } from "./records"

// Note: EnsContenthashRecord and EnsRecords are exported from ./records
// These are different types with decoded contenthash format
export interface EnsContenthashRecordDecoded {
    decoded: string
    protocolType: string
}

export interface EnsRecordsDecoded {
    texts: EnsTextRecord[]
    addresses: EnsAddressRecord[]
    contenthash?: EnsContenthashRecordDecoded
}

export interface EnsNameOwner {
    address: Address
    ensName?: string
    avatar?: string
    isWrapped: boolean
}

type EnsNameLevel = 2 | 3;

export interface EnsName {
    name: string
    label: string
    createdAt: number
    expiry: number
    isWrapped: boolean
    namehash: string
    parentName: string
    level: EnsNameLevel
    owner: string
}

export interface GenericMintedName {
    name: string
    label: string
    expiry?: number
    namehash: string
    parentName: string
    owner: string,
    addresses: Record<string,string>
    texts: Record<string,string>
    isL2: boolean
    chainId: number
    hightlighted?: boolean
    mintTransaction?: {
        price: number
    }
}

export interface L2NameMetadata {
    resolver: Address
    network: Layer2Network
    owner: Address
}

export interface IEnsNameFullProfile {
    ensName: string
    ownership: EnsNameOwner
    records: EnsRecordsDecoded
    resolver: Address
    expiry: number
    l2Metadata?: L2NameMetadata
    subnames: GenericMintedName[]
}