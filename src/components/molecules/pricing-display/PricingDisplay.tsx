import React from "react";
import { Button, Text, ShurikenSpinner } from "@/components/atoms";
import "./PricingDisplay.css";

export interface PricingDisplayProps {
  // Primary fee (registration fee, minting fee, etc.)
  primaryFee: {
    label: string;
    amount: number | string;
    isChecking: boolean;
  };
  // Optional network/transaction fees
  networkFees?: {
    amount: number | string;
    isChecking: boolean;
  };
  // Total amount
  total: {
    amount: number | string;
    isChecking: boolean;
  };
  // Optional expiry picker for registration
  expiryPicker?: {
    years: number;
    onYearsChange: (years: number) => void;
  };
  className?: string;
}

export const PricingDisplay: React.FC<PricingDisplayProps> = ({
  primaryFee,
  networkFees,
  total,
  expiryPicker,
  className = "",
}) => {
  const totalLoading = total.isChecking || primaryFee.isChecking || networkFees?.isChecking;

  return (
    <div className={`ens-registration-pricing ${className}`}>
      {expiryPicker && (
        <div className="ens-expiry-picker d-flex justify-content-between mb-2">
          <Button
            disabled={expiryPicker.years <= 1}
            onClick={() => expiryPicker.onYearsChange(expiryPicker.years - 1)}
          >
            -
          </Button>
          <Text>
            {expiryPicker.years} year{expiryPicker.years > 1 ? "s" : ""}
          </Text>
          <Button onClick={() => expiryPicker.onYearsChange(expiryPicker.years + 1)}>
            +
          </Button>
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
          <Text size="lg" weight="bold">
            {total.amount === "Free" ? "Free" : `${total.amount} ETH`}
          </Text>
        )}
      </div>
    </div>
  );
};

export default PricingDisplay;


