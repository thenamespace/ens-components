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
  isChecking?: boolean;
  isAvailable?: boolean;
  isTaken?: boolean;
}

export function NameSearch({
  ensName,
  onNameChange,
  onBack,
  onClose,
  onNext,
  isChecking = false,
  isAvailable = false,
  isTaken = false,
}: NameSearchProps) {
  const getSearchInputInfo = () => {
    if (isChecking) {
      return (
        <Text size="sm" color="grey">
          Checking...
        </Text>
      );
    }

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

    if (isAvailable && ensName.length >= 3) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
          <Text size="sm" style={{ color: "black" }}>
            Yes, this name is Available
          </Text>
          <Icon size={15} name="check-circle" color="black" />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ens-names-register-container">
      <div className="ens-names-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

        <div className="ens-names-register-banner">
          <img src={ensBanner} alt="ENS Banner" />
        </div>

        <div className="ens-names-register-title-section">
          <Text size="md" color="grey" className="ens-names-register-subtitle">
            Register Your ENS Name
          </Text>
          <Text size="xl" weight="bold" className="ens-names-register-title">
            {ensName}.eth
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
          {ensName && ensName.length >= 3 && isAvailable && !isChecking && (
            <div className="ens-names-register-checkmark available">
              <Icon name="check-circle" size={12} color="#ffffff" />
            </div>
          )}
          {ensName && ensName.length >= 3 && isTaken && !isChecking && (
            <button
              className="ens-names-register-clear-btn"
              onClick={() => onNameChange("")}
              type="button"
            >
              <Icon name="x" size={12} color="#ffffff" />
            </button>
          )}
          <Text className="ens-names-register-domain-suffix">.eth</Text>
        </div>

        {getSearchInputInfo() && (
          <div style={{ marginBottom: "8px", paddingLeft: "12px" }}>
            {getSearchInputInfo()}
          </div>
        )}

        <Button
          className="ens-names-register-next-btn"
          variant="solid"
          size="lg"
          onClick={onNext}
          disabled={isChecking || isTaken || ensName.length < 3 || !isAvailable}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
