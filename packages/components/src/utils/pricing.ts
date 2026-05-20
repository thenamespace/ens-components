/**
 * Pure helpers for formatting ETH/USD pricing in the registration UI.
 *
 * Display rules:
 *  - ETH is rendered at a fixed 4 decimals.
 *  - Non-zero values smaller than 0.0001 ETH render as the literal "<0.0001"
 *    so cheap-gas rows stay informative without claiming a misleading exact
 *    figure. The USD subtitle is derived from wei (when available) so it
 *    stays numerically honest even when the ETH cell is rounded.
 *  - "Free" and "N/A" are sentinel strings — they bypass formatting and
 *    suppress the USD subtitle.
 */

export const ETH_SENTINELS = ["Free", "N/A"] as const;
export type EthSentinel = (typeof ETH_SENTINELS)[number];

export const isSentinel = (amount: number | string): amount is EthSentinel =>
  amount === "Free" || amount === "N/A";

/**
 * Format an ETH amount for display at a fixed 4 decimals.
 *
 * Any positive value below the 4-decimal threshold renders as the literal
 * "<0.0001" — honest about the rounding direction, and (crucially) avoids
 * the misleading 1:1 read against the wei-derived USD subtitle when the
 * true amount is much smaller than 0.0001 ETH.
 */
export const formatEth = (eth: number): string => {
  if (!isFinite(eth) || eth <= 0) return "0.0000";
  if (eth < 0.0001) return "<0.0001";
  return eth.toFixed(4);
};

/**
 * Convert wei → USD. Note the `Number(bigint)` cast loses exactness above
 * 2^53 wei (~0.009 ETH); the resulting error is < 1e-7 relative, which is
 * invisible after `.toFixed(2)` for any realistic ENS registration total.
 */
export const usdFromWei = (wei: bigint, rate: number): number =>
  (Number(wei) * rate) / 1e18;

/**
 * Compute the `≈ $X.XX` subtitle for a fee row.
 *
 * Prefers `weiAmount` (precise) over the displayed string (which may have
 * been rounded by `formatEth`). Returns `null` when the row is loading,
 * unpriced, a sentinel ("Free"/"N/A"), or otherwise unparseable.
 */
export const computeUsd = (
  amount: number | string,
  weiAmount: bigint | undefined,
  ethUsdRate: number | null | undefined,
  isChecking: boolean
): string | null => {
  if (!ethUsdRate || isChecking || isSentinel(amount)) return null;
  if (weiAmount !== undefined && weiAmount > 0n) {
    return usdFromWei(weiAmount, ethUsdRate).toFixed(2);
  }
  // Fallback path: parse the displayed string. Strips the heuristic "~"
  // prefix. Returns null if the result is not a usable positive number.
  const eth = parseFloat(String(amount).replace(/^~/, ""));
  if (isNaN(eth) || eth <= 0) return null;
  return (eth * ethUsdRate).toFixed(2);
};
