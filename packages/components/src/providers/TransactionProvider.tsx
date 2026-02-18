import { useAccount, usePublicClient, useWalletClient } from "wagmi";

interface TransactionContext {}

export const TransactionProvider = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  return <div></div>;
};
