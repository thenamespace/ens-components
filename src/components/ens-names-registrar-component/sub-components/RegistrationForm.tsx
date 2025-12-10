import React, { useState } from "react";
import ninjaLogo from "../../../assets/ninja.png";
import { ChevronRight } from "lucide-react";
import { Button, Input, Text, Icon } from "../../atoms";
import { Header } from "./Header";
import { CostSummary } from "./CostSummary";

interface RegistrationFormProps {
  ensName: string;
  duration: number;
  registrationCost: number;
  networkFee: number;
  total: number;
  onNameChange: (value: string) => void;
  onDurationChange: (delta: number) => void;
  onBack?: () => void;
  onClose?: () => void;
  onNext: () => void;
  onCompleteProfile?: () => void;
  isLoadingPrice?: boolean;
  priceError?: string | null;
  nameAvailability?: {
    isAvailable: boolean;
    isChecking: boolean;
  };
  canProceed?: boolean;
}

export function RegistrationForm({
  ensName,
  duration,
  registrationCost,
  networkFee,
  total,
  onNameChange,
  onDurationChange,
  onBack,
  onClose,
  onNext,
  onCompleteProfile,
  isLoadingPrice = false,
  priceError = null,
  nameAvailability = { isAvailable: false, isChecking: false },
  canProceed = false,
}: RegistrationFormProps) {
  const [isDurationExpanded, setIsDurationExpanded] = useState(false);
  const getSearchInputInfo = () => {

    if (ensName.length < 3 && ensName.length !== 0) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Text size="sm" style={{ color: "#000000" }}>
            Too short
          </Text>
          <Icon size={15} name="x" color="#000000" />
        </div>
      );
    }

    // Show unavailable if name is taken
    const isTaken = ensName.length >= 3 && !nameAvailability.isChecking && !nameAvailability.isAvailable;
    if (isTaken) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Text size="sm" style={{ color: "#000000" }}>
            Unavailable
          </Text>
          <Icon size={15} name="x" color="#000000" />
        </div>
      );
    }

    // Show available if name is available
    if (nameAvailability.isAvailable && ensName.length >= 3) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <Text size="sm" style={{ color: "#22c55e" }}>
            Yes, this name is Available
          </Text>
          <Icon size={15} name="check-circle" color="#22c55e" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ens-names-register-container">
      <div className="ens-names-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

        <div className="ens-names-register-title-section">
          <Text size="xl" weight="light" className="ens-names-register-title">
            ENS Registration
          </Text>
          <Text size="md" color="grey" className="ens-names-register-subtitle">
            Your about to mint this ENS name
          </Text>
        </div>



        {ensName && (
          <div className="ens-names-register-name-display">
            <Text size="xl" weight="bold">
              {ensName}.eth
            </Text>
          </div>
        )}

        <div className="ens-names-register-duration-section">
          <div className="ens-names-register-duration-controls">
            <button
              className="ens-names-register-duration-btn"
              onClick={() => onDurationChange(-1)}
              disabled={duration <= 1}
            >
              <span style={{ fontSize: "20px", lineHeight: "1" }}>−</span>
            </button>
            <div
              className="ens-names-register-duration-text"
              onClick={() => setIsDurationExpanded(!isDurationExpanded)}
            >
              <Text size="md" weight="medium">
                {duration} year{duration !== 1 ? "s" : ""}
              </Text>
            </div>
            <button
              className="ens-names-register-duration-btn"
              onClick={() => onDurationChange(1)}
            >
              <span style={{ fontSize: "20px", lineHeight: "1" }}>+</span>
            </button>
          </div>

          {isDurationExpanded && (
            <div className="ens-names-register-cost-breakdown">
              <CostSummary
                duration={duration}
                registrationCost={registrationCost}
                networkFee={networkFee}
                total={total}
                isLoading={isLoadingPrice}
                priceError={priceError}
              />
            </div>
          )}
        </div>

        <div
          className="ens-names-register-profile-card"
          onClick={onCompleteProfile}
        >
          <div className="ens-names-register-profile-icon">
            <img src={ninjaLogo} alt="Profile Icon" />
          </div>
          <div className="ens-names-register-profile-text">
            <Text size="md" weight="bold">
              Complete your profile
            </Text>
            <Text size="sm" color="grey">
              Make your ENS more discoverable
            </Text>
          </div>
          <button className="ens-names-register-profile-arrow">
            <ChevronRight size={20} />
          </button>
        </div>

        <Button
          className="ens-names-register-next-btn"
          variant="solid"
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
