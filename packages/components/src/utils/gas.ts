import type { PublicClient } from "viem";

// eth_maxPriorityFeePerGas can be ~1000x below what wallets tip, so the tip comes from recent blocks.
export const estimateEffectiveGasPrice = async (
  client: PublicClient
): Promise<bigint> => {
  const [history, fees] = await Promise.all([
    client
      .getFeeHistory({ blockCount: 10, rewardPercentiles: [50] })
      .catch(() => null),
    client.estimateFeesPerGas().catch(() => null),
  ]);
  const rpcTip = fees?.maxPriorityFeePerGas ?? 0n;
  const baseFee = history?.baseFeePerGas[history.baseFeePerGas.length - 1];
  if (baseFee === undefined) return fees?.maxFeePerGas ?? fees?.gasPrice ?? 0n;
  const tips = (history?.reward ?? [])
    .map(r => r[0])
    .filter((t): t is bigint => t !== undefined)
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const medianTip = tips.length > 0 ? tips[Math.floor(tips.length / 2)] : 0n;
  return baseFee + (medianTip > rpcTip ? medianTip : rpcTip);
};
