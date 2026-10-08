import { formatUnits, type Address, type Hash, type Hex, type PublicClient, type WalletClient } from "viem";

export interface WalletCall {
  to: Address;
  data: Hex;
  value: bigint;
  title?: string;
}

export interface SendProgress {
  hash: Hash | null;
  call?: WalletCall;
}

export const formatTokenAmount = (amount: bigint, decimals: number, symbol: string) => {
  const value = Number(formatUnits(amount, decimals));
  if (value === 0) return "0";
  const digits = symbol === "ETH" ? 5 : 2;
  const min = 10 ** -digits;
  return value < min ? `>${min}` : value.toFixed(digits);
};

export const usdFromRaw = (raw: bigint) => (Number(raw) / 1e12).toFixed(2);

export const sendCallsWithFallback = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  calls: WalletCall[],
  chainId: number,
  onProgress: (progress: SendProgress) => void,
): Promise<Hash[]> => {
  let atomic = false;
  if (calls.length > 1) {
    try {
      const capabilities = await walletClient.getCapabilities({
        account: walletClient.account,
        chainId,
      });
      const status = (capabilities as { atomic?: { status?: string } })?.atomic
        ?.status;
      atomic = status === "supported" || status === "ready";
    } catch {
      atomic = false;
    }
  }

  if (atomic) {
    const { id } = await walletClient.sendCalls({
      // biome-ignore lint/style/noNonNullAssertion: wagmi's wallet client always has an account
      account: walletClient.account!,
      calls: calls.map(({ to, data, value }) => ({ to, data, value })),
      chain: walletClient.chain,
      forceAtomic: true,
    });
    onProgress({ hash: null });
    const result = await walletClient.waitForCallsStatus({ id });
    const hashes = [
      ...new Set((result.receipts ?? []).map((r) => r.transactionHash)),
    ];
    const hash = hashes[hashes.length - 1];
    if (result.status !== "success" || !hash)
      throw new Error("The transaction failed.");
    onProgress({ hash });
    return hashes;
  }

  const hashes: Hash[] = [];
  for (const call of calls) {
    const hash = await walletClient.sendTransaction({
      to: call.to,
      data: call.data,
      value: call.value,
      chain: walletClient.chain,
      // biome-ignore lint/style/noNonNullAssertion: wagmi's wallet client always has an account
      account: walletClient.account!,
    });
    onProgress({ hash, call });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success")
      throw new Error("A transaction reverted.");
    hashes.push(hash);
  }
  if (hashes.length === 0) throw new Error("Nothing to send.");
  return hashes;
};

export const paidFees = async (publicClient: PublicClient, hashes: Hash[]) => {
  try {
    const receipts = await Promise.all(
      hashes.map((hash) => publicClient.getTransactionReceipt({ hash })),
    );
    const wei = receipts.reduce(
      (sum, r) => sum + r.gasUsed * (r.effectiveGasPrice ?? 0n),
      0n,
    );
    return formatUnits(wei, 18);
  } catch {
    return "0";
  }
};

