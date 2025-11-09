import React from "react";
import finishLogo from "../../../assets/finish.png";
import { Button, Text, Icon } from "../../atoms";

export interface OnchainSuccessScreenProps {
  name: string;
  onClose?: () => void;
  onFinish?: () => void;
}

export function OnchainSuccessScreen({
  name,
  onClose,
  onFinish,
}: OnchainSuccessScreenProps) {
  return (
    <div className="ns-onchain-register-container">
      <div className="ns-onchain-register-card ns-onchain-register-success">
        {onClose && (
          <button className="ns-onchain-register-close-btn" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        )}

        <div className="ns-onchain-register-finish-banner">
          <img src={finishLogo} alt="Success" />
        </div>

        <div className="ns-onchain-register-success-title-section">
          <Text
            size="xl"
            weight="bold"
            className="ns-onchain-register-success-message"
          >
            ENS name registered successfully
          </Text>
          <Text
            size="md"
            color="grey"
            className="ns-onchain-register-success-subtitle"
          >
            Your ENS name is now active and ready to use
          </Text>
        </div>

        <div className="ns-onchain-register-actions">
          <Button className="primary finish-btn" onClick={onFinish || onClose}>
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
}
