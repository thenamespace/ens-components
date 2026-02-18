import { useMemo } from "react"
import { createOffchainClient} from "@thenamespace/offchain-manager";

export const useOffchainManager = (name: string, apiKeyOrToken: string, isTestnet: boolean = false) => {

    const client = useMemo(() => {
        const key = { [name]: apiKeyOrToken }
        return createOffchainClient({
            domainApiKeys: key,
            mode: isTestnet ? "sepolia" : "mainnet"

        })
    },[name, apiKeyOrToken])

    return client;
}