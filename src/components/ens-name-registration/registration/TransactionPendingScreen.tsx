import React, { useEffect, useState } from "react";
import { Hash } from "viem";
import { Text } from "../../atoms";
import { ProgressBar } from "./ProgressBar";

interface TransactionPendingScreenProps {
  message?: string;
  hash: Hash;
  isCompleted: boolean;
  isTestnet?: boolean;
}

export const TransactionPendingScreen: React.FC<TransactionPendingScreenProps> = ({
  message,
  hash,
  isCompleted,
  isTestnet,
}) => {
  const [progressStep, setProgressStep] = useState(0);

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

  // Get etherscan URL based on network
  const getEtherscanUrl = (hash: string) => {
    const baseUrl = isTestnet
      ? "https://sepolia.etherscan.io"
      : "https://etherscan.io";
    return `${baseUrl}/tx/${hash}`;
  };

  return (
    <div className="ns-text-center">
      <Text weight="medium">
        Transaction {!isCompleted ? "in Progress" : "Completed!"}
      </Text>
      <Text color="grey" size="xs" className="mt-2">
        {message || "Your transaction has been sent!"}
      </Text>
      <ProgressBar progress={progressStep} />
      <a href={getEtherscanUrl(hash)} target="_blank" rel="noopener noreferrer">
        <Text className="mt-2" size="xs" color="grey">
          Check on Etherscan
        </Text>
      </a>
    </div>
  );
};

