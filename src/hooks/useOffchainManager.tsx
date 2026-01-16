import { useMemo } from "react"
import { createOffchainClient} from "@thenamespace/offchain-manager";

export const useOffchainManager = (name: string, apiKeyOrToken: string) => {

    const client = useMemo(() => {
        const key = { [name]: apiKeyOrToken }
        return createOffchainClient({
            domainApiKeys: key,
        })
    },[name, apiKeyOrToken])

    return client;
}