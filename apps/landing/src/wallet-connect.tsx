import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
  baseSepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const ALCHEMY_KEY = "hFMEk-pg2hvLDZM9UOHQH";

const config = getDefaultConfig({
  appName: "Namespace",
  projectId: "c2b41d3552450616c3083c320075729e",
  chains: [mainnet, sepolia, base, baseSepolia, optimism],
  transports: {
    [mainnet.id]: http(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
    [base.id]: http(`https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
    [baseSepolia.id]: http(
      `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`
    ),
    [optimism.id]: http(`https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`),
  },
  ssr: false,
});

const queryClient = new QueryClient();

export const WalletConnectProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
