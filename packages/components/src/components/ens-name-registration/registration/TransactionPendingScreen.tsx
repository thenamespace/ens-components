import React, { useEffect, useState } from "react";
import { Hash } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { Text, Icon } from "../../atoms";
import { ProgressBar } from "../../molecules";
import { getBlockExplorerTransactionUrl, getBlockExplorerName } from "@/utils";

interface TransactionPendingScreenProps {
  message?: string;
  hash: Hash;
  isCompleted: boolean;
  isTestnet?: boolean;
  chainId?: number;
}

export const TransactionPendingScreen: React.FC<TransactionPendingScreenProps> = ({
  message,
  hash,
  isCompleted,
  isTestnet,
  chainId,
}) => {
  const [progressStep, setProgressStep] = useState(0);
  
  // Derive chainId from isTestnet if not provided
  const effectiveChainId = chainId ?? (isTestnet ? sepolia.id : mainnet.id);

  useEffect(() => {
    if (isCompleted) {
      setProgressStep(98);
      return;
    }

    const int = setInterval(() => {
      if (progressStep >= 98) {
        setProgressStep(50);
        return;
      }
      setProgressStep(progressStep + 0.4);
    }, 100);

    return () => clearInterval(int);
  }, [progressStep, isCompleted]);

  return (
    <div className="ns-text-center">
      <Text weight="bold" size="lg">
        Transaction {!isCompleted ? "in Progress" : "Completed!"}
      </Text>
      <Text color="grey" size="xs" className="mt-2">
        {message || "Your transaction has been sent!"}
      </Text>
      <ProgressBar progress={progressStep} />
      <a
        href={getBlockExplorerTransactionUrl(effectiveChainId, hash)}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
          padding: "6px 14px",
          borderRadius: 999,
          border: "1px solid var(--ns-color-border)",
          background: "var(--ns-color-bg-secondary, var(--ns-color-bg))",
          textDecoration: "none",
          color: "var(--ns-color-text-secondary)",
          fontSize: 12,
          fontWeight: 500,
          transition: "border-color 0.15s, color 0.15s",
        }}
      >
        <Icon name="globe" size={13} />
        View on {getBlockExplorerName(effectiveChainId)}
      </a>
    </div>
  );
};

