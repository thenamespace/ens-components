import React from "react";
import { Text, ShurikenSpinner } from "@/components/atoms";
import { DurationPicker } from "../duration-picker/DurationPicker";
import "./PricingDisplay.css";

export interface PricingDisplayProps {
  primaryFee: {
    label: string;
    amount: number | string;
    isChecking: boolean;
  };
  networkFees?: {
    amount: number | string;
    isChecking: boolean;
  };
  total: {
    amount: number | string;
    isChecking: boolean;
  };
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

  const totalUsd = React.useMemo(() => {
    if (!ethUsdRate || totalLoading || total.amount === "Free" || total.amount === "N/A") {
      return null;
    }
    const eth = parseFloat(String(total.amount));
    if (isNaN(eth) || eth <= 0) return null;
    return (eth * ethUsdRate).toFixed(2);
  }, [ethUsdRate, total.amount, totalLoading]);

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
        {primaryFee.isChecking ? (
          <ShurikenSpinner size={16} />
        ) : (
          <Text size="sm" color="grey">
            {primaryFee.amount === "Free" ? "Free" : `${primaryFee.amount} ETH`}
          </Text>
        )}
      </div>
      {networkFees && (
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Text size="sm" color="grey">
            Est. network fees
          </Text>
          {networkFees.isChecking ? (
            <ShurikenSpinner size={16} />
          ) : (
            <Text size="sm" color="grey">
              {networkFees.amount} ETH
            </Text>
          )}
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mt-2 total-fee">
        <Text size="lg" weight="bold">
          Total
        </Text>
        {totalLoading ? (
          <ShurikenSpinner size={20} />
        ) : (
          <div style={{ textAlign: "right" }}>
            <Text size="lg" weight="bold">
              {total.amount === "Free" ? "Free" : `${total.amount} ETH`}
            </Text>
            {totalUsd && (
              <Text size="xs" color="grey">
                ≈ ${totalUsd}
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;
