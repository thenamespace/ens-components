import React from "react";
import { Hash } from "viem";
import {
  TransactionDetail,
  TransactionProgress,
} from "../../transaction-progress";

interface TransactionPendingScreenProps {
  hash?: Hash;
  isCompleted: boolean;
  isTestnet?: boolean;
  chainId?: number;
  /** Name / Action rows describing what the transaction does */
  details?: TransactionDetail[];
}

export const TransactionPendingScreen: React.FC<
  TransactionPendingScreenProps
> = ({ hash, isCompleted, isTestnet, chainId, details }) => (
  <TransactionProgress
    status={isCompleted ? "success" : "pending"}
    hash={hash}
    chainId={chainId}
    isTestnet={isTestnet}
    details={details}
  />
);
