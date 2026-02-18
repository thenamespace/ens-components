import React, { useEffect, useState } from "react";
import { TxProgress } from "@/types";
import { Hash } from "viem";
import { ProgressBar } from "../molecules";
import { Button, Text, Icon } from "../atoms";
import { getBlockExplorerTransactionUrl, getBlockExplorerName, getEnsAppUrl } from "@/utils";
import finishLogo from "../../assets/finish.png";
import "./RecordUpdateProgress.css";

interface RecordUpdateProgressProps {
  tx: Hash;
  chainId: number;
  status: TxProgress;
  ensName: string;
  isTestnet?: boolean;
  onClose?: () => void;
  onRetry?: () => void;
  onViewName?: () => void;
}

export const RecordUpdateProgress: React.FC<RecordUpdateProgressProps> = ({
  tx,
  chainId,
  status,
  ensName,
  isTestnet = false,
  onClose,
  onRetry,
  onViewName,
}) => {
  const [progressStep, setProgressStep] = useState(0);

  // Update progress based on transaction status
  useEffect(() => {
    if (status === TxProgress.Success) {
      setProgressStep(100);
      return;
    }

    if (status === TxProgress.Failed) {
      setProgressStep(0);
      return;
    }

    // Animate progress while pending
    const int = setInterval(() => {
      setProgressStep((prev) => {
        if (prev >= 98) {
          return 50; // Reset to 50% to show it's still pending
        }
        return prev + 0.4;
      });
    }, 100);

    return () => clearInterval(int);
  }, [status]);


  // Show success screen
  if (status === TxProgress.Success) {
    return (
      <div className="record-update-screen-container">
        <div className="record-update-screen-card">
          <div className="record-update-success-illustration">
            <img src={finishLogo} alt="Success Illustration" />
          </div>

          <div className="record-update-screen-title-section">
            <Text size="sm" color="grey" className="mb-2">
              Records updated successfully!
            </Text>
            <Text size="lg" weight="bold">
              {ensName}
            </Text>
          </div>

          <div className="record-update-screen-actions">
            <Button
              variant="outline"
              onClick={() => {
                if (onViewName) {
                  onViewName();
                } else {
                  window.open(getEnsAppUrl(ensName, isTestnet), "_blank", "noopener,noreferrer");
                }
              }}
              className="record-update-screen-view-name-btn"
            >
              View Name
            </Button>
            <Button
              onClick={() => onClose?.()}
              size="lg"
              className="record-update-screen-close-btn"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show failed screen
  if (status === TxProgress.Failed) {
    return (
      <div className="record-update-screen-container">
        <div className="record-update-screen-card">
          <div className="record-update-failed-icon">
            <Icon name="x-circle" size={64} color="#ef4444" />
          </div>

          <div className="record-update-screen-title-section">
            <Text size="lg" weight="bold" className="mb-2">
              Update Failed
            </Text>
            <Text size="sm" color="grey">
              Failed to update records for {ensName}
            </Text>
          </div>

          <div className="record-update-screen-actions">
            {onRetry && (
              <Button
                variant="solid"
                onClick={onRetry}
                className="record-update-screen-retry-btn"
              >
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onClose?.()}
              className="record-update-screen-close-btn"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show pending progress
  return (
    <div style={{padding:25}}>
      <div className="ns-text-center">
        <Text weight="medium">Transaction in Progress</Text>
        <Text color="grey" size="xs" className="mt-2">
          Your transaction has been sent!
        </Text>
        <ProgressBar progress={progressStep} />
        <a
          href={getBlockExplorerTransactionUrl(chainId, tx)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Text className="mt-2" size="xs" color="grey">
            Check on {getBlockExplorerName(chainId)}
          </Text>
        </a>
      </div>
    </div>
  );
};
