import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { http, WagmiProvider } from "wagmi";
import { mainnet, sepolia, base, baseSepolia, optimism } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

const config = getDefaultConfig({
  appName: "NamespaceApp",
  projectId: "c2b41d3552450616c3083c320075729e",
  chains: [mainnet, sepolia, base, baseSepolia, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [optimism.id]: http(),
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
