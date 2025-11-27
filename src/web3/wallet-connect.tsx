"use client";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { http, WagmiProvider, createStorage } from "wagmi";
import { mainnet, sepolia, base, baseSepolia, optimism } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PropsWithChildren } from "react";
import { getProvider } from "./providers";
import { EfpProviders } from "./efp-provider";

const config = getDefaultConfig({
  appName: "NamespaceApp",
  projectId: "c2b41d3552450616c3083c320075729e",
  chains: [mainnet, sepolia, base, baseSepolia, optimism],
  transports: {
    [mainnet.id]: getProvider("mainnet"),
    [sepolia.id]: getProvider("sepolia"),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: getProvider("optimism"),
  },
  storage: createStorage({
    storage: typeof window !== "undefined" ? localStorage : undefined,
  }),
  ssr: true, // If your dApp uses server side rendering (SSR)y
});

const queryClient = new QueryClient();

export const WalletConnectProvider = ({ children }: PropsWithChildren) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <EfpProviders>{children}</EfpProviders>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
