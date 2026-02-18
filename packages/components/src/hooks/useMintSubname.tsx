import { Address, Hash, formatEther } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { MintTransactionResponse } from "@thenamespace/mint-manager/dist/types";

interface MintSubnameResult {
  txHash: Hash;
  price: bigint;
}

export interface EstimatedFees {
  gasEstimate: bigint;
  gasPrice: bigint;
  totalFeeWei: bigint;
  totalFeeEth: number;
}

interface EstimateFeesParams {
  mintTx: MintTransactionResponse;
  account: Address;
}

export const useMintSubname = ({ chainId }: { chainId: number }) => {
  const publicClient = usePublicClient({ chainId });
  // Don't pass chainId to useWalletClient - we want the wallet client for the 
  // currently connected chain (user must switch first before minting)
  const { data: walletClient } = useWalletClient();

  const mintSubname = async (
    mintTx: MintTransactionResponse
  ): Promise<MintSubnameResult> => {
    if (!walletClient || !walletClient.account) {
      throw new Error("Wallet client is not available");
    }

    if (!publicClient) {
      throw new Error("Public client is not available");
    }

    // Simulate the transaction first
    const { request: contractRequest } = await publicClient.simulateContract({
      address: mintTx.contractAddress as Address,
      abi: mintTx.abi,
      functionName: mintTx.functionName,
      args: mintTx.args,
      account: walletClient.account,
      value: mintTx.value,
    });

    // Execute the transaction
    const txHash = await walletClient.writeContract(contractRequest);

    return {
      txHash,
      price: mintTx.value,
    };
  };

  const estimateTransactionFees = async (
    params: EstimateFeesParams
  ): Promise<EstimatedFees | null> => {
    const { mintTx, account } = params;

    if (!publicClient) {
      console.error("No public client available");
      return null;
    }

    try {
      // Estimate gas
      const gasEstimate = await publicClient.estimateContractGas({
        address: mintTx.contractAddress,
        abi: mintTx.abi,
        functionName: mintTx.functionName,
        args: mintTx.args,
        account,
        value: mintTx.value,
      });

      // Get gas price (returned in gwei, convert to wei)
      let gasPriceWei = await publicClient.getGasPrice();

      // Calculate total fee
      const totalFeeWei = gasEstimate * gasPriceWei;
      const totalFeeEth = parseFloat(formatEther(totalFeeWei));

      return {
        gasEstimate,
        gasPrice: gasPriceWei,
        totalFeeWei,
        totalFeeEth,
      };
    } catch (err) {
      console.error("Gas estimation error:", err);
      return null;
    }
  };

  return {
    mintSubname,
    estimateTransactionFees,
  };
};
