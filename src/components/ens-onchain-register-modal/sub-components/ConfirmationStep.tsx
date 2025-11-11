import React, { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import ensBanner from "../../../assets/banner.png";
import { Button, Text, Icon, Input } from "../../atoms";

export interface ConfirmationStepProps {
  name: string;
  domainSuffix?: string;
  owner?: string;
  duration?: number;
  registrationFee?: string;
  networkFee?: string;
  totalCost?: string;
  useAsPrimary?: boolean;
  profileComplete?: boolean;
  profileImageUrl?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onRegister?: () => void;
  onClose?: () => void;
  onOwnerChange?: (owner: string) => void;
}

export function ConfirmationStep({
  name,
  domainSuffix = "eth",
  owner = "0x035eB...24117D3",
  duration = 1,
  registrationFee = "0.004",
  networkFee = "0.0010",
  totalCost = "0.0014",
  useAsPrimary = false,
  profileComplete = true,
  profileImageUrl = "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  onBack,
  onCancel,
  onRegister,
  onClose,
  onOwnerChange,
}: ConfirmationStepProps) {
  const [isOwnerExpanded, setIsOwnerExpanded] = useState(true);

  const formatOwnerAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 20) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const fullName = name.includes(".") ? name : `${name}.${domainSuffix}`;

  return (
    <div className="ns-onchain-register-card">
      {onClose && (
        <button className="ns-onchain-register-close-btn" onClick={onClose}>
          <Icon name="x" size={20} />
        </button>
      )}

      <div className="ns-onchain-register-mint-title">
        <Text size="sm" color="grey">
          You are about to mint
        </Text>
      </div>

      <div className="ns-onchain-register-name-display">
        <Text size="xl" weight="bold">
          {fullName}
        </Text>
      </div>

      {profileComplete && (
        <div className="ns-onchain-register-profile-completed">
          <div className="ns-onchain-register-profile-completed-avatar">
            {profileImageUrl ? (
              <img src={profileImageUrl} alt="Profile" />
            ) : (
              <Icon name="person" size={24} />
            )}
          </div>
          <div className="ns-onchain-register-profile-completed-text">
            <Text size="md" weight="bold">
              Profile completed
            </Text>
            <Text size="sm" color="grey">
              You're all set! Finish your registration.
            </Text>
          </div>
          <div className="ns-onchain-register-profile-completed-checkmark">
            <Icon name="check-circle" size={24} color="#ffffff" />
          </div>
        </div>
      )}

      {/* Owner Section */}
      <div className="ns-onchain-register-owner-section">
        <div
          className="ns-onchain-register-owner-header"
          onClick={() => setIsOwnerExpanded(!isOwnerExpanded)}
        >
          <div className="ns-onchain-register-owner-left">
            <Icon name="person" size={16} />
            <Text size="sm" weight="medium">
              Owner
            </Text>
          </div>
          <div className="ns-onchain-register-owner-chevron">
            {isOwnerExpanded ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </div>
        </div>
        {isOwnerExpanded && (
          <div className="ns-onchain-register-owner-content">
            <Input
              type="text"
              placeholder="Enter owner address (0x...)"
              value={owner}
              onChange={e => onOwnerChange?.(e.target.value)}
              size="md"
              className="ns-onchain-register-owner-input"
            />
          </div>
        )}
      </div>

      {/* Duration and Cost Section */}
      <div className="ns-onchain-register-duration-section">
        <div className="ns-onchain-register-duration-controls">
          <Text size="md" weight="medium">
            {duration} year{duration !== 1 ? "s" : ""}
          </Text>
        </div>

        <div className="ns-onchain-register-cost-breakdown">
          <div className="ns-onchain-register-cost-row">
            <Text size="sm" color="grey">
              {duration} year registration
            </Text>
            <Text size="sm" weight="medium">
              {registrationFee} ETH
            </Text>
          </div>
          <div className="ns-onchain-register-cost-row">
            <Text size="sm" color="grey">
              Est. network fee
            </Text>
            <Text size="sm" weight="medium">
              {networkFee} ETH
            </Text>
          </div>
          <div className="ns-onchain-register-cost-row total">
            <Text size="md" weight="bold">
              Total
            </Text>
            <div className="ns-onchain-register-total-cost">
              <Text size="md" weight="bold">
                {totalCost}
              </Text>
              <span style={{ fontSize: "14px", color: "#3b82f6" }}>Ξ</span>
              <Text size="sm" weight="medium">
                ETH
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ns-onchain-register-actions">
        <Button className="cancel" onClick={onCancel || onBack}>
          Cancel
        </Button>
        <Button className="primary" onClick={onRegister}>
          Register
        </Button>
      </div>
    </div>
  );
}
