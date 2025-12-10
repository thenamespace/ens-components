import { usePublicClient, useWalletClient } from "wagmi";
import { sepolia } from "viem/chains";

export const useWeb3Clients = ({ chainId }: { chainId: number }) => {
  const _chainId = chainId;
  const publicClient = usePublicClient({ chainId: _chainId });
  const { data: walletClient } = useWalletClient({ chainId: _chainId });

  // Log for debugging Sepolia connection
  if (_chainId === sepolia.id) {
    console.log("Using Sepolia network (chainId:", _chainId, ")");
    console.log("publicClient:", publicClient ? "connected" : "not available");
    if (!publicClient) {
      console.warn("publicClient is null for Sepolia. Check wagmi configuration and RPC endpoints.");
    }
  }

  return {
    publicClient,
    walletClient,
  };
};

export const isSupportedTestnet = (chainId: number) => {
  return chainId === sepolia.id
}
