import React from "react";
import { ContractFunctionExecutionError } from "viem";
import { Alert } from "../alert/Alert";
import { Text } from "../../atoms";

export interface ContractErrorLabelProps {
  error: ContractFunctionExecutionError | null;
  className?: string;
}

/**
 * Checks if an error is a user rejection error (user denied the transaction)
 */
export const isUserDeniedError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") return false;
  
  // Check for user rejection code (4001)
  if ("code" in error && error.code === 4001) return true;
  
  // Check for user rejection in message
  const message =
    ("shortMessage" in error ? error.shortMessage : null) ||
    ("message" in error ? error.message : null) ||
    "";
  
  const lowerMessage = typeof message === "string" ? message.toLowerCase() : "";
  return (
    lowerMessage.includes("user rejected") ||
    lowerMessage.includes("rejected the request") ||
    lowerMessage.includes("user denied")
  );
};

/**
 * Checks if an error is a CommitmentTooNew error
 */
export const isCommitmentToNewErr = (err: ContractFunctionExecutionError): boolean => {
  // Check in shortMessage
  if (err.shortMessage && err.shortMessage.includes("CommitmentTooNew")) {
    return true;
  }
  
  // Check in message
  if (err.message && err.message.includes("CommitmentTooNew")) {
    return true;
  }
  
  // Check in cause if it exists
  if (err.cause && typeof err.cause === "object") {
    const causeMessage = 
      ("shortMessage" in err.cause ? err.cause.shortMessage : null) ||
      ("message" in err.cause ? err.cause.message : null) ||
      "";
    
    if (typeof causeMessage === "string" && causeMessage.includes("CommitmentTooNew")) {
      return true;
    }
  }
  
  // Check error name if available
  if ("name" in err && err.name === "CommitmentTooNew") {
    return true;
  }
  
  return false;
};

export const ContractErrorLabel: React.FC<ContractErrorLabelProps> = ({
  error,
  className = "",
}) => {
  // Don't show error if it's a user rejection
  if (!error) {
    return null;
  }

  if (isUserDeniedError(error)) {
    return null;
  }

  const getErrorMessage = () => {
    if (error instanceof ContractFunctionExecutionError) {
      const err = error as ContractFunctionExecutionError;
      if (isCommitmentToNewErr(err)) {
        return "Please wait a couple more seconds before registering.";
      }
    }

    const errorMessage = error.shortMessage || error.message || "Something went wrong.";
    return `${errorMessage} Check console for more info.`;
  };

  return (
    <div className={`mt-2 ns-wd-100 ${className}`} style={{ width: "100%", boxSizing: "border-box" }}>
      <Alert variant="error" className="ns-wd-100">
        <Text size="sm">{getErrorMessage()}</Text>
      </Alert>
    </div>
  );
};

export default ContractErrorLabel;

