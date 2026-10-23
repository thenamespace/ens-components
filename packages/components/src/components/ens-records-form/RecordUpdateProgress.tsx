import React from "react";
import { TxProgress } from "@/types";
import { Hash } from "viem";
import { Button, Text, Icon } from "../atoms";
import { getEnsAppUrl } from "@/utils";
import { TransactionPendingScreen } from "../ens-name-registration/registration/TransactionPendingScreen";
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
  // Show success screen
  if (status === TxProgress.Success) {
    return (
      <div className="record-update-screen-container">
        <div className="record-update-screen-card">
          <div className="record-update-success-illustration" data-testid="records-update-success">
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
          <div className="record-update-failed-icon" data-testid="records-update-failed">
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
    <div style={{ padding: 25 }}>
      <TransactionPendingScreen
        chainId={chainId}
        hash={tx}
        isCompleted={false}
        details={[
          { label: "Name", value: ensName },
          { label: "Action", value: "Update Records" },
        ]}
      />
    </div>
  );
};
