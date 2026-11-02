import {
  OnchainError,
  type OnchainClient,
  type PreparedOperation,
} from "@thenamespace/onchain-subnames";
import type { PublicClient, WalletClient } from "viem";
import { sendCallsWithFallback, type SendProgress } from "./send-calls";

/** Refresh after a sequential approval, before the operation that spends it. */
export const submitOnchainOperation = async <
  Operation extends PreparedOperation<unknown>,
>({
  client,
  publicClient,
  walletClient,
  prepare,
  onProgress,
}: {
  client: OnchainClient;
  publicClient: PublicClient;
  walletClient: WalletClient;
  prepare: () => Promise<Operation>;
  onProgress: (progress: SendProgress) => void;
}) => {
  let operation = await prepare();
  const checkSubmission = async () => {
    if (
      walletClient.account?.address.toLowerCase() !==
      operation.account.toLowerCase()
    )
      throw new OnchainError(
        "INVALID_INPUT",
        "The connected account changed. Refresh the quote before confirming."
      );
    if ((await walletClient.getChainId()) !== operation.chainId)
      throw new OnchainError(
        "CHAIN_MISMATCH",
        "Switch to the quoted chain before confirming."
      );
    const cost = await client.estimateTransactionCost(operation);
    if (cost.nativeBalanceShortfallWei > 0n || cost.tokenBalanceShortfall > 0n)
      throw new OnchainError(
        "INSUFFICIENT_FUNDS",
        "Your wallet needs more funds for the payment and network fee."
      );
    if (cost.networkFeeWei === null)
      throw new OnchainError(
        "RPC_ERROR",
        "Couldn't estimate the network fee. Try again before submitting."
      );
  };
  await checkSubmission();
  const hashes = await sendCallsWithFallback(
    walletClient,
    publicClient,
    operation.calls,
    operation.chainId,
    onProgress,
    async (call, index) => {
      if (
        index === 0 ||
        call.to.toLowerCase() !== client.deployment.subnameIssuer.toLowerCase()
      )
        return call;
      operation = await prepare();
      const refreshedIndex = operation.calls.findIndex(
        next =>
          next.to.toLowerCase() ===
          client.deployment.subnameIssuer.toLowerCase()
      );
      if (refreshedIndex < 0)
        throw new OnchainError(
          "TRANSACTION_FAILED",
          "The prepared operation has no registration or renewal call."
        );
      if (refreshedIndex > 0)
        throw new OnchainError(
          "PRICE_CHANGED",
          "The payment amount changed after approval. Refresh the quote before confirming."
        );
      await checkSubmission();
      return operation.calls[refreshedIndex];
    }
  );
  return { operation, hashes };
};
