import React from "react";
import finishLogo from "../../../assets/finish.png";
import ninjaLogo from "../../../assets/ninja.png";
import { ChevronRight } from "lucide-react";
import { Button, Text, Icon } from "../../atoms";

interface OffchainSuccessScreenProps {
  name: string;
  onClose?: () => void;
  onSetProfile?: () => void;
  onFinish?: () => void;
}

export function OffchainSuccessScreen({
  name,
  onClose,
  onSetProfile,
  onFinish,
}: OffchainSuccessScreenProps) {
  return (
    <div className="ns-offchain-register-container">
      <div className="ns-offchain-register-card ns-offchain-register-success">
        {onClose && (
          <button className="ns-offchain-register-close-btn" onClick={onClose}>
            <Icon name="x" size={20} />
          </button>
        )}

        <div className="ns-offchain-register-finish-banner">
          <img src={finishLogo} alt="Success" />
        </div>

        <div className="ns-offchain-register-success-title-section">
          <Text
            size="xl"
            weight="bold"
            className="ns-offchain-register-success-message"
          >
            ENS name registered successfully
          </Text>
          <Text
            size="md"
            color="grey"
            className="ns-offchain-register-success-subtitle"
          >
            Complete your profile now
          </Text>
        </div>

        {onSetProfile && (
          <div
            className="ns-offchain-register-profile-card"
            onClick={onSetProfile}
          >
            <div className="ns-offchain-register-profile-icon">
              <img src={ninjaLogo} alt="Profile Icon" />
            </div>
            <div className="ns-offchain-register-profile-text">
              <Text size="md" weight="bold">
                Complete your profile
              </Text>
              <Text size="sm" color="grey">
                Make your ENS more discoverable
              </Text>
            </div>
            <button className="ns-offchain-register-profile-arrow">
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <div className="ns-offchain-register-actions">
          <Button className="primary finish-btn" onClick={onFinish || onClose}>
            Finish
          </Button>
        </div>
      </div>
    </div>
  );
}
