import React, { useState, useEffect } from "react";
import ensBanner from "../../../assets/banner.png";
import { Button, Input, Text, Icon } from "../../atoms";

export interface InitialStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onCancel: () => void;
  onRegister: () => void;
  onClose?: () => void;
  isNameAvailable?: boolean;
}

export function InitialStep({
  name,
  onNameChange,
  onCancel,
  onRegister,
  onClose,
  isNameAvailable,
}: InitialStepProps) {
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>(
    isNameAvailable
  );
  const domainSuffix = "particle.eth";

  // Extract the subname part (remove domain suffix if user typed it)
  const getSubnamePart = (inputName: string) => {
    if (!inputName) return "";
    // Remove the domain suffix if user included it
    const suffixPattern = new RegExp(
      `\\.${domainSuffix.replace(".", "\\.")}$`,
      "i"
    );
    return inputName.replace(suffixPattern, "").trim();
  };

  // Simulate name availability check - in real app, this would be an API call
  useEffect(() => {
    const subnamePart = getSubnamePart(name);
    if (subnamePart && subnamePart.length > 0) {
      // Simulate async check - for demo, consider names with length > 3 as available
      // Also check that it doesn't contain invalid characters
      const isValid =
        /^[a-z0-9-]+$/i.test(subnamePart) && subnamePart.length > 3;
      const timer = setTimeout(() => {
        setNameAvailable(isValid);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setNameAvailable(undefined);
    }
  }, [name]);

  // Use prop if provided, otherwise use internal state
  const available =
    isNameAvailable !== undefined ? isNameAvailable : nameAvailable;
  const showStatus = name && name.length > 0 && available !== undefined;
  const isUnavailable = showStatus && available === false;
  const subnamePart = getSubnamePart(name);

  const handleClear = () => {
    onNameChange("");
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove the domain suffix if user tries to type it
    const suffixPattern = new RegExp(
      `\\.${domainSuffix.replace(".", "\\.")}$`,
      "i"
    );
    value = value.replace(suffixPattern, "");
    // Only allow alphanumeric and hyphens for subname
    value = value.replace(/[^a-z0-9-]/gi, "");
    onNameChange(value);
  };

  return (
    <div className="ns-offchain-register-card">
      {onClose && (
        <button className="ns-offchain-register-close-btn" onClick={onClose}>
          <Icon name="x" size={20} />
        </button>
      )}

      <div className="ns-offchain-register-banner">
        <img src={ensBanner} alt="ENS Banner" />
      </div>

      <div className="ns-offchain-register-header">
        <Text size="lg" weight="bold">
          Get your Web3 Username
        </Text>
      </div>

      <div className="ns-offchain-register-input-row">
        <Icon
          name="search"
          size={14}
          className="ns-offchain-register-search-icon"
        />
        <Input
          type="text"
          className="ns-offchain-register-input"
          placeholder="Find name"
          value={subnamePart}
          onChange={handleNameInputChange}
        />
        {subnamePart && available && (
          <div className="ns-offchain-register-checkmark available">
            <Icon name="check-circle" size={12} color="#ffffff" />
          </div>
        )}
        {subnamePart && isUnavailable && (
          <button
            className="ns-offchain-register-clear-btn"
            onClick={handleClear}
            type="button"
          >
            <Icon name="x" size={12} color="#ffffff" />
          </button>
        )}
        <Text className="ns-offchain-register-domain-suffix">
          .{domainSuffix}
        </Text>
      </div>

      {isUnavailable && (
        <div className="ns-offchain-register-unavailable-message">
          <Icon name="alert-triangle" size={14} />
          <Text size="sm" className="ns-offchain-register-error-text">
            This name is unavailable. Please choose a different one.
          </Text>
        </div>
      )}

      <div className="ns-offchain-register-actions">
        <Button className="cancel" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="primary"
          onClick={() => {
            // Pass the full subname format
            const fullName = subnamePart
              ? `${subnamePart}.${domainSuffix}`
              : "";
            if (fullName) {
              onNameChange(fullName);
            }
            onRegister();
          }}
          disabled={!subnamePart || !!isUnavailable}
        >
          {subnamePart && available ? "Next" : "Register"}
        </Button>
      </div>

      <div className="ns-offchain-register-footer">
        <Text size="sm" color="grey">
          Powered by Namespace
        </Text>
      </div>
    </div>
  );
}
