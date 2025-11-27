import { addEnsContracts, ensPublicActions, ensSubgraphActions } from "@ensdomains/ensjs";
import { createPublicClient } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useMainChain } from "../web3/use-main-chain";
import { getProvider } from "@/web3";


export const ensMainnetClient = createPublicClient({
    chain: {
        ...addEnsContracts(mainnet),
        subgraphs: {
            ens: {
                url: "/ens-subgraph"
            }
        }
    },
    transport: getProvider("mainnet")
}).extend(ensSubgraphActions).extend(ensPublicActions)

export const ensSepoliaClient = createPublicClient({
    chain: {
        ...addEnsContracts(sepolia),
        subgraphs: {
            ens: {
                url: "https://api.sepolia.ensnode.io/subgraph"
            }
        }
    },
    transport: getProvider("sepolia")
}).extend(ensSubgraphActions).extend(ensPublicActions)


export const useEnsClient = () => {
    const { networkName } = useMainChain()
    if (networkName === "sepolia") {
        return ensSepoliaClient;
    }
    return ensMainnetClient;
}