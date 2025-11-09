import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import ensBanner from "../../../assets/banner.png";
import ninjaLogo from "../../../assets/ninja.png";
import { Button, Text, Icon, Input } from "../../atoms";

export interface RegistrationStepProps {
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
  onNext?: () => void;
  onClose?: () => void;
  onOwnerChange?: (owner: string) => void;
  onDurationChange?: (duration: number) => void;
  onUseAsPrimaryChange?: (useAsPrimary: boolean) => void;
  onCompleteProfile?: () => void;
}

export function RegistrationStep({
  name,
  domainSuffix = "eth",
  owner = "0x035eB...24117D3",
  duration: initialDuration = 1,
  registrationFee = "0.004",
  networkFee = "0.0010",
  totalCost = "0.0014",
  useAsPrimary: initialUseAsPrimary = false,
  profileComplete = false,
  profileImageUrl,
  onBack,
  onCancel,
  onRegister,
  onNext,
  onClose,
  onOwnerChange,
  onDurationChange,
  onUseAsPrimaryChange,
  onCompleteProfile,
}: RegistrationStepProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [useAsPrimary, setUseAsPrimary] = useState(initialUseAsPrimary);
  const [ownerAddress, setOwnerAddress] = useState(owner);
  const [isOwnerExpanded, setIsOwnerExpanded] = useState(true);

  // Sync owner address with prop changes
  useEffect(() => {
    setOwnerAddress(owner);
  }, [owner]);

  const handleDurationDecrease = () => {
    if (duration > 1) {
      const newDuration = duration - 1;
      setDuration(newDuration);
      onDurationChange?.(newDuration);
    }
  };

  const handleDurationIncrease = () => {
    const newDuration = duration + 1;
    setDuration(newDuration);
    onDurationChange?.(newDuration);
  };

  const handleTogglePrimary = () => {
    const newValue = !useAsPrimary;
    setUseAsPrimary(newValue);
    onUseAsPrimaryChange?.(newValue);
  };

  const handleOwnerChange = (value: string) => {
    setOwnerAddress(value);
    onOwnerChange?.(value);
  };

  const formatOwnerAddress = (address: string) => {
    if (!address) return "";
    if (address.length <= 20) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  const fullName = name.includes(".") ? name : `${name}.${domainSuffix}`;
  const isSubname = domainSuffix.includes(".");

  return (
    <div className="ns-onchain-register-card">
      {onClose && (
        <button className="ns-onchain-register-close-btn" onClick={onClose}>
          <Icon name="x" size={20} />
        </button>
      )}

      <div className="ns-onchain-register-banner">
        <img src={ensBanner} alt="ENS Banner" />
      </div>

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
              value={ownerAddress}
              onChange={e => handleOwnerChange(e.target.value)}
              size="md"
              className="ns-onchain-register-owner-input"
            />
          </div>
        )}
      </div>

      {/* Duration and Cost Section */}
      <div className="ns-onchain-register-duration-section">
        <div className="ns-onchain-register-duration-controls">
          <button
            className="ns-onchain-register-duration-btn"
            onClick={handleDurationDecrease}
            disabled={duration <= 1}
          >
            <span style={{ fontSize: "20px", lineHeight: "1" }}>−</span>
          </button>
          <Text size="md" weight="medium">
            {duration} year{duration !== 1 ? "s" : ""}
          </Text>
          <button
            className="ns-onchain-register-duration-btn"
            onClick={handleDurationIncrease}
          >
            <span style={{ fontSize: "20px", lineHeight: "1" }}>+</span>
          </button>
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

      {/* Profile Section */}
      {profileComplete ? (
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
      ) : (
        onCompleteProfile && (
          <div
            className="ns-onchain-register-profile-card"
            onClick={onCompleteProfile}
          >
            <div className="ns-onchain-register-profile-icon">
              <img src={ninjaLogo} alt="Profile Icon" />
            </div>
            <div className="ns-onchain-register-profile-text">
              <Text size="md" weight="bold">
                Complete your profile
              </Text>
              <Text size="sm" color="grey">
                Make your ENS more discoverable
              </Text>
            </div>
            <button className="ns-onchain-register-profile-arrow">
              <ChevronRight size={20} />
            </button>
          </div>
        )
      )}

      {/* Use as Primary Name Section */}
      <div className="ns-onchain-register-toggle">
        <div className="ns-onchain-register-toggle-text">
          <Text size="md" weight="bold">
            Use as primary name
          </Text>
          <div style={{ marginTop: "8px" }}>
            <Text size="sm" color="grey">
              This links your address to this name, allowing dApps to display it
              as your profile when connected to them. You can only have{" "}
            </Text>
            <Text size="sm" color="grey" weight="bold">
              one primary name per address
            </Text>
            <Text size="sm" color="grey">
              .
            </Text>
          </div>
        </div>
        <div className="toggle-switch">
          <input
            type="checkbox"
            id="use-as-primary"
            checked={useAsPrimary}
            onChange={handleTogglePrimary}
          />
          <label htmlFor="use-as-primary"></label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="ns-onchain-register-actions">
        <Button className="cancel" onClick={onCancel || onBack}>
          Cancel
        </Button>
        <Button
          className="primary"
          onClick={isSubname && onNext ? onNext : onRegister}
        >
          {isSubname ? "Next" : "Register"}
        </Button>
      </div>
    </div>
  );
}
