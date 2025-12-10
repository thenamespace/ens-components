import { AppEnv } from "@/environment";
import { createIndexerClient, IndexerClient } from "@namespacesdk/indexer";
import axios from "axios";
import { useMainChain } from "../web3/use-main-chain";
import { EnsNameMintStats } from "@/types";

interface ExtendedIndexerClient extends IndexerClient {
    getNameStats(ensName: string, isTestnet?: boolean): Promise<EnsNameMintStats>
}

export const useNamespaceIndexer = (): ExtendedIndexerClient => {

    const { isTestnet } = useMainChain()
    const baseIndexer = createIndexerClient() as ExtendedIndexerClient;
    baseIndexer.getNameStats = async (ensName: string) => {
        return axios.get<EnsNameMintStats>(`
            ${AppEnv.indexerUrl}/api/v1/stats/name?name=${ensName}&isTestnet=${isTestnet}`).then(res => res.data)
    }

    return baseIndexer;
}