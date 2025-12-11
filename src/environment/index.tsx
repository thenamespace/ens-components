
'use client'

interface AppEnvironment {
    listManagerApi: string
    isTestnet: boolean
    testnetRpcUrl: string
    alchemyToken: string
    indexerUrl: string
}

export const AppEnv: AppEnvironment = {
    listManagerApi: import.meta.env.VITE_LIST_MANAGER_API || import.meta.env.NEXT_PUBLIC_LIST_MANAGER_API || "",
    isTestnet: import.meta.env.VITE_IS_TESTNET === "true" || import.meta.env.NEXT_PUBLIC_IS_TESTNET === "true",
    testnetRpcUrl: import.meta.env.VITE_IS_TESTNET_RPC_URL || import.meta.env.NEXT_PUBLIC_IS_TESTNET_RPC_URL || "",
    alchemyToken: import.meta.env.VITE_ALCHEMY_TOKEN || import.meta.env.NEXT_PUBLIC_ALCHEMY_TOKEN || "",
    indexerUrl: import.meta.env.VITE_INDEXER_API || import.meta.env.NEXT_PUBLIC_INDEXER_API || ""
}

