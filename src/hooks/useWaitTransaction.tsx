import { Hash, TransactionReceipt } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { usePublicClient } from "wagmi";

interface WaitTransactionOptions {
  hash: Hash;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export const useWaitTransaction = ({ isTestnet, chainId }: { isTestnet?: boolean, chainId?: number }) => {
  const txChainId = chainId ? chainId : isTestnet ? sepolia.id : mainnet.id
  const publicClient = usePublicClient({
    chainId: txChainId
  });

  const waitTx = async (
    options: WaitTransactionOptions
  ): Promise<TransactionReceipt> => {
    const {
      hash,
      retries = 3,
      retryDelay = 2000,
      timeout = 60000, // 1 minute default timeout
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create a promise that will timeout if transaction takes too long
        const receiptPromise = publicClient!.waitForTransactionReceipt({
          hash,
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Transaction timeout after ${timeout}ms`));
          }, timeout);
        });

        // Race between receipt and timeout
        const receipt = await Promise.race([receiptPromise, timeoutPromise]);

        return receipt;
      } catch (err: any) {
        lastError = err;

        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw err;
        }

        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new Error("Failed to wait for transaction");
  };

  return {
    waitTx,
  };
};


