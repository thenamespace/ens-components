import React, { useState, useEffect, useRef, useMemo } from "react";
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import ninjaLogo from "../../../assets/ninja.png";
import { Button, Text, Icon, Input, ChainIcon } from "../../atoms";
import { formatFloat } from "@/utils/numbers";
import { Modal } from "../../molecules/modal/Modal";
import { SelectRecordsForm } from "../../select-records-form/SelectRecordsForm";
import { EnsRecords, EnsAddressRecord } from "@/types";
import { deepCopy } from "@/utils";
import {
  getSupportedAddressByCoin,
  getSupportedAddressByName,
} from "@/constants";

export interface RegistrationStepProps {
  name: string;
  domainSuffix?: string;
  owner?: string;
  duration?: number;
  registrationFee?: string | null;
  networkFee?: string | null;
  totalCost?: string | null;
  useAsPrimary?: boolean;
  profileComplete?: boolean;
  profileImageUrl?: string;
  onBack?: () => void;
  onCancel?: () => void;
  onRegister?: () => void;
  onClose?: () => void;
  onOwnerChange?: (owner: string) => void;
  onDurationChange?: (duration: number) => void;
  onUseAsPrimaryChange?: (useAsPrimary: boolean) => void;
  onCompleteProfile?: () => void;
  onRecordsChange?: (records: EnsRecords) => void;
  mintPrice?: number;
  isFetchingPrice?: boolean;
  expiryYears?: number;
  isExpirable?: boolean;
  isRegistering?: boolean;
}

export function RegistrationStep({
  name,
  domainSuffix = "eth",
  owner = "0x035eB...24117D3",
  duration: initialDuration = 1,
  registrationFee,
  networkFee,
  totalCost,
  useAsPrimary: initialUseAsPrimary = false,
  profileComplete = false,
  profileImageUrl,
  onBack,
  onCancel,
  onRegister,
  onClose,
  onOwnerChange,
  onDurationChange,
  onUseAsPrimaryChange,
  onCompleteProfile,
  onRecordsChange,
  mintPrice = 0,
  isFetchingPrice = false,
  expiryYears = 1,
  isExpirable = false,
  isRegistering = false,
}: RegistrationStepProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [useAsPrimary, setUseAsPrimary] = useState(initialUseAsPrimary);
  const [ownerAddress, setOwnerAddress] = useState(owner);
  const [isOwnerExpanded, setIsOwnerExpanded] = useState(true);
  const [isDurationExpanded, setIsDurationExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [records, setRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const [initialRecords, setInitialRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const costBreakdownRef = useRef<HTMLDivElement>(null);

  const eth_address = getSupportedAddressByName("eth");
  const celo_address = getSupportedAddressByName("celo");

  // Sync owner address with prop changes
  useEffect(() => {
    setOwnerAddress(owner);
  }, [owner]);

  // Initialize records with owner address when available
  useEffect(() => {
    if (
      ownerAddress &&
      ownerAddress.length > 0 &&
      records.addresses.length === 0
    ) {
      const newAddresses: EnsAddressRecord[] = [];
      if (eth_address) {
        newAddresses.push({
          coinType: eth_address.coinType,
          value: ownerAddress,
        });
      }
      if (celo_address) {
        newAddresses.push({
          coinType: celo_address.coinType,
          value: ownerAddress,
        });
      }
      if (newAddresses.length > 0) {
        setRecords(prevRecords => ({
          ...prevRecords,
          addresses: newAddresses,
        }));
      }
    }
  }, [ownerAddress]);

  // Calculate number of records to add
  const recordsToAdd = useMemo(() => {
    let count = 0;
    records.texts.forEach(text => {
      if (text.value.length > 0) {
        count++;
      }
    });
    records.addresses.forEach(addr => {
      const supportedAddr = getSupportedAddressByCoin(addr.coinType);
      if (supportedAddr) {
        if (addr.value.length > 0 && supportedAddr.validateFunc?.(addr.value)) {
          count++;
        }
      }
    });
    if (records.contenthash && records.contenthash.value.length > 0) {
      count++;
    }
    return count;
  }, [records]);

  // Smooth scroll when cost breakdown expands
  useEffect(() => {
    if (isDurationExpanded && costBreakdownRef.current) {
      // Small delay to ensure animation starts
      setTimeout(() => {
        costBreakdownRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [isDurationExpanded]);

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

  const handleAddProfile = () => {
    setIsModalOpen(true);
  };

  const handleRecordsAdded = () => {
    const _initialRecords = deepCopy(records);
    setInitialRecords(_initialRecords);
    onRecordsChange?.(records);
    setIsModalOpen(false);
    onCompleteProfile?.();
  };

  const handleRecordsCancel = () => {
    setRecords(deepCopy(initialRecords));
    setIsModalOpen(false);
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
          <div
            className="ns-onchain-register-duration-text"
            onClick={() => setIsDurationExpanded(!isDurationExpanded)}
          >
            <Text size="md" weight="medium">
              {duration} year{duration !== 1 ? "s" : ""}
            </Text>
          </div>
          <button
            className="ns-onchain-register-duration-btn"
            onClick={handleDurationIncrease}
          >
            <span style={{ fontSize: "20px", lineHeight: "1" }}>+</span>
          </button>
        </div>

        {/* Mint Price Display */}
        {mintPrice > 0 && (
          <div
            className="d-flex justify-content-between align-items-center mb-1"
            style={{ marginTop: "12px", marginBottom: "8px" }}
          >
            <Text size="sm" color="grey">
              Mint price
            </Text>
            <div className="d-flex align-items-center">
              {isFetchingPrice ? (
                <Text size="sm" color="grey">
                  Loading...
                </Text>
              ) : (
                <>
                  <Text size="sm" weight="bold" className="me-1">
                    {isExpirable
                      ? formatFloat(mintPrice * expiryYears, 6)
                      : formatFloat(mintPrice, 6)}
                  </Text>
                  <ChainIcon chain="eth" size={20} />
                </>
              )}
            </div>
          </div>
        )}

        {isDurationExpanded && (
          <div
            ref={costBreakdownRef}
            className="ns-onchain-register-cost-breakdown"
          >
            <div className="ns-onchain-register-cost-row">
              <Text size="sm" color="grey">
                {duration} year registration
              </Text>
              <Text size="sm" weight="medium">
                {isFetchingPrice || !registrationFee
                  ? "..."
                  : `${registrationFee} ETH`}
              </Text>
            </div>
            {networkFee && parseFloat(networkFee) > 0 && (
              <div className="ns-onchain-register-cost-row">
                <Text size="sm" color="grey">
                  Est. network fee
                </Text>
                <Text size="sm" weight="medium">
                  {isFetchingPrice ? "..." : `${networkFee} ETH`}
                </Text>
              </div>
            )}
            {totalCost && (
              <div className="ns-onchain-register-cost-row total">
                <Text size="md" weight="bold">
                  Total
                </Text>
                <div className="ns-onchain-register-total-cost">
                  <Text size="md" weight="bold">
                    {isFetchingPrice ? "..." : totalCost}
                  </Text>
                  <span style={{ fontSize: "14px", color: "#3b82f6" }}>Ξ</span>
                  <Text size="sm" weight="medium">
                    ETH
                  </Text>
                </div>
              </div>
            )}
          </div>
        )}
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
            onClick={handleAddProfile}
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
        <div className="ns-onchain-register-toggle-content">
          <Text
            size="md"
            weight="bold"
            className="ns-onchain-register-toggle-title"
          >
            Use as primary name
          </Text>
          {useAsPrimary && (
            <div className="ns-onchain-register-toggle-description">
              <Text size="sm" color="grey">
                This links your address to this name, allowing dApps to display
                it as your profile when connected to them. You can only
                have{" "}
              </Text>
              <Text size="sm" color="grey" weight="bold">
                one primary name per address
              </Text>
            </div>
          )}
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
        <Button
          className="cancel"
          onClick={onCancel || onBack}
          disabled={isRegistering}
        >
          Cancel
        </Button>
        <Button
          className="primary"
          onClick={onRegister}
          loading={isRegistering}
          disabled={isRegistering}
        >
          Register
        </Button>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="md"
        footer={null}
        isDismissDisabled={true}
        style={{ maxWidth: "500px" }}
      >
        <div style={{ margin: "-20px", padding: 0 }}>
          <SelectRecordsForm
            records={records}
            onRecordsUpdated={(updatedRecords: EnsRecords) => {
              setRecords(updatedRecords);
            }}
          />
          <div
            style={{
              background: "#f4f4f4",
              gap: "7px",
              display: "flex",
              padding: "4px",
            }}
          >
            <Button
              onClick={handleRecordsCancel}
              variant="outline"
              style={{ width: "50%" }}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordsAdded}
              size="lg"
              style={{ width: "50%" }}
            >
              Add ({recordsToAdd})
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
