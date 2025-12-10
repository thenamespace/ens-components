import { useAccount, usePublicClient } from "wagmi"
import { mainnet, sepolia } from "viem/chains";

// By default, we read all data from mainnet
// We also support a sepolia testnet
export const useMainPublicClient = () => {
    const { chain } = useAccount();
    let networkId: number = mainnet.id;
    if (chain && chain.id === sepolia.id) {
        networkId = sepolia.id;
    }

    return usePublicClient({chainId: networkId});
}
