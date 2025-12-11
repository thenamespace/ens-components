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
  domainSuffix?: string;
  parentName?: string;
}

export function InitialStep({
  name,
  onNameChange,
  onCancel,
  onRegister,
  onClose,
  isNameAvailable,
  domainSuffix = "eth",
  parentName,
}: InitialStepProps) {
  const [nameAvailable, setNameAvailable] = useState<boolean | undefined>(
    isNameAvailable
  );
  
  // Extract the subname part (remove domain suffix or parent name if user typed it)
  const getSubnamePart = (inputName: string) => {
    if (!inputName) return "";
    let cleaned = inputName;
    // Remove parent name if user included it
    if (parentName) {
      const parentPattern = new RegExp(
        `\\.${parentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        "i"
      );
      cleaned = cleaned.replace(parentPattern, "");
    }
    // Remove the domain suffix if user included it
    const suffixPattern = new RegExp(
      `\\.${domainSuffix.replace(".", "\\.")}$`,
      "i"
    );
    return cleaned.replace(suffixPattern, "").trim();
  };
  
  // Use local state for input value to prevent fluctuation
  const [inputValue, setInputValue] = useState(() => getSubnamePart(name));
  
  // Sync local state with prop only on mount or when name is cleared externally
  useEffect(() => {
    const propSubnamePart = getSubnamePart(name);
    // Only sync if name prop is empty (external clear) or on initial mount
    if (!propSubnamePart && inputValue) {
      setInputValue("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  // Simulate name availability check - in real app, this would be an API call
  useEffect(() => {
    if (inputValue && inputValue.length > 0) {
      // Simulate async check - for demo, consider names with length > 3 as available
      // Also check that it doesn't contain invalid characters
      const isValid =
        /^[a-z0-9-]+$/i.test(inputValue) && inputValue.length > 3;
      const timer = setTimeout(() => {
        setNameAvailable(isValid);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setNameAvailable(undefined);
    }
  }, [inputValue]);

  // Use prop if provided, otherwise use internal state
  const available =
    isNameAvailable !== undefined ? isNameAvailable : nameAvailable;
  const showStatus = inputValue && inputValue.length > 0 && available !== undefined;
  const isUnavailable = showStatus && available === false;
  const subnamePart = inputValue;

  const handleClear = () => {
    setInputValue("");
    onNameChange("");
  };

  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove parent name if user tries to type it
    if (parentName) {
      const parentPattern = new RegExp(
        `\\.${parentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
        "gi"
      );
      value = value.replace(parentPattern, "");
    }
    // Remove the domain suffix if user tries to type it
    const suffixPattern = new RegExp(
      `\\.${domainSuffix.replace(".", "\\.")}`,
      "gi"
    );
    value = value.replace(suffixPattern, "");
    // Only allow alphanumeric and hyphens for subname
    value = value.replace(/[^a-z0-9-]/gi, "");
    
    // Update local state immediately for smooth input
    setInputValue(value);
    // Notify parent
    onNameChange(value);
  };

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

      <div className="ns-onchain-register-header">
        <Text size="lg" weight="bold">
          Get your Web3 Username
        </Text>
      </div>

      <div className="ns-onchain-register-input-row">
        <Icon
          name="search"
          size={14}
          className="ns-onchain-register-search-icon"
        />
        <div style={{ position: "relative", flex: 1 }}>
          <Input
            type="text"
            className="ns-onchain-register-input"
            placeholder="Find name"
            value={inputValue}
            onChange={handleNameInputChange}
          />
        </div>
        {subnamePart && available && (
          <div className="ns-onchain-register-checkmark available">
            <Icon name="check-circle" size={12} color="#ffffff" />
          </div>
        )}
        {subnamePart && isUnavailable && (
          <button
            className="ns-onchain-register-clear-btn"
            onClick={handleClear}
            type="button"
          >
            <Icon name="x" size={12} color="#ffffff" />
          </button>
        )}
        {parentName && (
          <Text className="ns-onchain-register-domain-suffix">
            {parentName}
          </Text>
        )}
        {!parentName && (
          <Text className="ns-onchain-register-domain-suffix">
            .{domainSuffix}
          </Text>
        )}
      </div>

      {isUnavailable && (
        <div className="ns-onchain-register-unavailable-message">
          <Icon name="alert-triangle" size={14} />
          <Text size="sm" className="ns-onchain-register-error-text">
            This name is unavailable. Please choose a different one.
          </Text>
        </div>
      )}

      <div className="ns-onchain-register-actions">
        <Button className="cancel" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          className="primary"
          onClick={() => {
            // Pass just the label - parentName is handled in the parent component
            if (subnamePart) {
              onNameChange(subnamePart);
            }
            onRegister();
          }}
          disabled={!subnamePart || !!isUnavailable}
        >
          {available ? "Next" : "Register"}
        </Button>
      </div>

      <div className="ns-onchain-register-footer">
        <Text size="sm" color="grey">
          Powered by Namespace
        </Text>
      </div>
    </div>
  );
}
