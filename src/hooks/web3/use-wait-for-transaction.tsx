import { Hash, TransactionReceipt } from "viem";
import { useWeb3Clients } from "./use-web3-clients";

export const showTxPopup = (tx: Hash, chainId: number) => {
  console.log("Transaction pending:", { tx, chainId });
};

export const useWaitForTransaction = ({ chainId }: { chainId: number }) => {
  const { publicClient } = useWeb3Clients({ chainId });

  const waitForTransactionReceipt = async (
    tx: Hash,
    confirmations: number = 1,
  ): Promise<TransactionReceipt> => {
    return await publicClient?.waitForTransactionReceipt({ hash: tx, confirmations })!!;
  };

  const showPendingTransactionModal = async (
    tx: Hash,
  ) => {
    showTxPopup(tx, chainId)
  };

  return {
    waitForTransactionReceipt,
    showPendingTransactionModal,
  };
};
