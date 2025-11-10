import React from "react";
import ensBanner from "../../../assets/banner.png";
import { Button, Input, Text, Icon } from "../../atoms";
import { Header } from "./Header";

interface NameSearchProps {
  ensName: string;
  onNameChange: (value: string) => void;
  onBack?: () => void;
  onClose?: () => void;
  onNext: () => void;
}

export function NameSearch({
  ensName,
  onNameChange,
  onBack,
  onClose,
  onNext,
}: NameSearchProps) {
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
