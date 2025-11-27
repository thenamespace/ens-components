import { AppEnv } from "@/environment";
import { Alchemy, Network } from "alchemy-sdk";
import { base, baseSepolia, mainnet, optimism, sepolia } from "viem/chains";

// todo, move this to backend, do not expose token
const ALCHEMY_KEY = AppEnv.alchemyToken

const alchemySDKs: Record<number, Alchemy> = {
    [mainnet.id]: new Alchemy({
        apiKey: ALCHEMY_KEY,
        network: Network.ETH_MAINNET
    }),
    [sepolia.id]: new Alchemy({
        apiKey: ALCHEMY_KEY,
        network: Network.ETH_SEPOLIA
    }),
    [base.id]: new Alchemy({
        apiKey: ALCHEMY_KEY,
        network: Network.BASE_MAINNET
    }),
    [optimism.id]: new Alchemy({
        apiKey: ALCHEMY_KEY,
        network: Network.OPT_MAINNET
    }),
    [baseSepolia.id]: new Alchemy({
        apiKey: ALCHEMY_KEY,
        network: Network.BASE_SEPOLIA
    })
}

export const useAlchemySDK = () => {

    const getAlchemyClient = (chainId: number): Alchemy => {
        return alchemySDKs[chainId];
    }

    return {
        getAlchemyClient
    }
}