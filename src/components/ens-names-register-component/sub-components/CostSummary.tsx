import React from "react";
import { Text } from "../../atoms";

interface CostSummaryProps {
  duration: number;
  registrationCost: number;
  networkFee: number;
  total: number;
  showExpiry?: boolean;
  expiryDate?: string;
}

export function CostSummary({
  duration,
  registrationCost,
  networkFee,
  total,
  showExpiry = false,
  expiryDate,
}: CostSummaryProps) {
  return (
    <div
      className={`ens-names-register-${showExpiry ? "success-" : ""}summary`}
    >
      <div
        className={`ens-names-register-${showExpiry ? "success-" : ""}summary-row`}
      >
        <Text size="sm">{duration} year registration</Text>
        <Text size="sm" weight="bold">
          {registrationCost.toFixed(3)} ETH
        </Text>
      </div>
      <div
        className={`ens-names-register-${showExpiry ? "success-" : ""}summary-row`}
      >
        <Text size="sm">Est. network fee</Text>
        <Text size="sm" weight="bold">
          {networkFee.toFixed(4)} ETH
        </Text>
      </div>
      <div
        className={`ens-names-register-${showExpiry ? "success-" : ""}summary-row ens-names-register-${showExpiry ? "success-" : ""}total`}
      >
        <Text size={showExpiry ? "md" : "lg"} weight="bold">
          Total
        </Text>
        <div
          className={`ens-names-register-${showExpiry ? "success-" : ""}total-amount`}
        >
          <Text size={showExpiry ? "md" : "lg"} weight="bold">
            {total.toFixed(4)}
          </Text>
          <span className="ens-names-register-eth-logo">⟠</span>
          <Text size={showExpiry ? "md" : "lg"} weight="bold">
            ETH
          </Text>
        </div>
      </div>
      {showExpiry && expiryDate && (
        <div className="ens-names-register-success-summary-row ens-names-register-success-expiry">
          <Text size="sm">Name Expires</Text>
          <Text size="sm" weight="bold">
            {expiryDate}
          </Text>
        </div>
      )}
    </div>
  );
}
