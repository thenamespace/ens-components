import React from "react";
import ensBanner from "../../../assets/banner.png";
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
}: RegistrationFormProps) {
  return (
    <div className="ens-names-register-container">
      <div className="ens-names-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

        <div className="ens-names-register-banner">
          <img src={ensBanner} alt="ENS Banner" />
        </div>

        <div className="ens-names-register-title-section">
          <Text size="xl" weight="bold" className="ens-names-register-title">
            ENS Registration Registration
          </Text>
          <Text size="md" color="grey" className="ens-names-register-subtitle">
            Register multiple ENS name is a single transaction
          </Text>
        </div>

        <div className="ens-names-register-input-row">
          <Icon
            name="search"
            size={16}
            className="ens-names-register-search-icon"
          />
          <Input
            type="text"
            className="ens-names-register-input"
            value={ensName}
            onChange={e => onNameChange(e.target.value)}
          />
          <Text className="ens-names-register-domain-suffix">.eth</Text>
        </div>

        <div className="ens-names-register-cost-section">
          <div className="ens-names-register-duration">
            <button
              className="ens-names-register-duration-btn"
              onClick={() => onDurationChange(-1)}
            >
              <Text size="md" weight="bold">
                -
              </Text>
            </button>
            <Text
              size="lg"
              weight="bold"
              className="ens-names-register-duration-text"
            >
              {duration} year{duration > 1 ? "s" : ""}
            </Text>
            <button
              className="ens-names-register-duration-btn"
              onClick={() => onDurationChange(1)}
            >
              <Text size="md" weight="bold">
                +
              </Text>
            </button>
          </div>

          <CostSummary
            duration={duration}
            registrationCost={registrationCost}
            networkFee={networkFee}
            total={total}
          />
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
        >
          Next
        </Button>
      </div>
    </div>
  );
}
