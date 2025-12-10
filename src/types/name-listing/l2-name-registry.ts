import {SupportedNetwork} from  "../networks";

export interface L2NameRegistryDTO {
    isBurnable: boolean
    isExpirable: boolean
    registryNetwork: SupportedNetwork
    registryName: string
    registrySymbol: string
    isDeployed: boolean
    registryAddress?: string
    name: string
    nameNetwork: SupportedNetwork
    registryOwner: string
}