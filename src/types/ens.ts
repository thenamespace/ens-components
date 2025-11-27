import { Address } from "viem"
import { Layer2Network } from "./networks"
import { INameListing } from "./listing"

export interface EnsTextRecord {
    key: string
    value: string
}

export interface EnsAddressRecord {
    coinType: number
    value: string
}

export interface EnsContenthashRecord {
    decoded: string
    protocolType: string
}

export interface EnsRecords {
    texts: EnsTextRecord[]
    addresses: EnsAddressRecord[]
    contenthash?: EnsContenthashRecord
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
    records: EnsRecords
    resolver: Address
    expiry: number
    l2Metadata?: L2NameMetadata
    subnames: GenericMintedName[]
}