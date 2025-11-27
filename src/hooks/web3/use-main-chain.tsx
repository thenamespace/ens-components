import { AppEnv } from "@/environment";
import { isTestnet, SupportedNetwork, Web3Network } from "@/types";
import {  mainnet, sepolia } from "viem/chains";
import { useAccount } from "wagmi";

interface Web3NetworkState {
  networkName: Web3Network;
  networkId: number;
  supported: boolean;
  network: SupportedNetwork
  isTestnet: boolean
}


export const useMainChain = (): Web3NetworkState => {
  if (AppEnv.isTestnet) {
    return {
      networkId: sepolia.id,
      networkName: "sepolia",
      supported: true,
      network: SupportedNetwork.Sepolia,
      isTestnet: true
    }
  }

  return {
    networkId: mainnet.id,
    networkName: "mainnet",
    supported: true,
    network: SupportedNetwork.Mainnet,
    isTestnet: false
  }
};

