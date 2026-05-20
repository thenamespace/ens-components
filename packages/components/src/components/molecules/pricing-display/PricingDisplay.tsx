import React from "react";
import { Text, ShurikenSpinner } from "@/components/atoms";
import { computeUsd, isSentinel } from "@/utils";
import { DurationPicker } from "../duration-picker/DurationPicker";
import "./PricingDisplay.css";

interface FeeRow {
  amount: number | string;
  isChecking: boolean;
  /** Optional precise wei value. When provided, USD is computed from wei
   *  rather than from the (possibly rounded) display string. See
   *  `usdFromWei` for the precision bound. */
  weiAmount?: bigint;
}

// Non-breaking space — used as placeholder content so a USD subtitle slot
// reserves vertical space even when no value is available, preventing the
// row from growing/shrinking as data loads.
const NBSP = " ";

export interface PricingDisplayProps {
  primaryFee: FeeRow & { label: string };
  networkFees?: FeeRow;
  total: FeeRow;
  expiryPicker?: {
    durationSeconds: number;
    onDurationChange: (seconds: number) => void;
    minSeconds?: number;
  };
  ethUsdRate?: number | null;
  className?: string;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  primaryFee,
  networkFees,
  total,
  expiryPicker,
  ethUsdRate,
  className = "",
}) => {
  const totalLoading = total.isChecking || primaryFee.isChecking || networkFees?.isChecking;

  const totalUsd = React.useMemo(
    () => computeUsd(total.amount, total.weiAmount, ethUsdRate, !!totalLoading),
    [ethUsdRate, total.amount, total.weiAmount, totalLoading]
  );

  return (
    <div className={`ens-registration-pricing ${className}`}>
      {expiryPicker && (
        <div className="ens-expiry-picker mb-2">
          <DurationPicker
            durationSeconds={expiryPicker.durationSeconds}
            onDurationChange={expiryPicker.onDurationChange}
            minSeconds={expiryPicker.minSeconds}
          />
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-1">
        <Text size="sm" color="grey">
          {primaryFee.label}
        </Text>
        <Text size="sm" color="grey">
          {primaryFee.isChecking ? (
            <ShurikenSpinner size={14} />
          ) : isSentinel(primaryFee.amount) ? (
            primaryFee.amount
          ) : (
            `${primaryFee.amount} ETH`
          )}
        </Text>
      </div>
      {networkFees && (
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Text size="sm" color="grey">
            Est. network fees
          </Text>
          <Text size="sm" color="grey">
            {networkFees.isChecking ? (
              <ShurikenSpinner size={14} />
            ) : networkFees.amount === "N/A" ? (
              "N/A"
            ) : (
              `${networkFees.amount} ETH`
            )}
          </Text>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mt-2 total-fee">
        <Text size="lg" weight="bold">
          Total
        </Text>
        <div style={{ textAlign: "right" }}>
          <Text size="lg" weight="bold">
            {totalLoading ? (
              <ShurikenSpinner size={18} />
            ) : isSentinel(total.amount) ? (
              total.amount
            ) : (
              `${total.amount} ETH`
            )}
          </Text>
          <Text size="xs" color="grey">
            {totalUsd ? `≈ $${totalUsd}` : NBSP}
          </Text>
        </div>
      </div>
    </div>
  );
};

export default PricingDisplay;
