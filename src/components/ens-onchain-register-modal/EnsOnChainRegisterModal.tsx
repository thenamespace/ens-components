import React from "react";
import ensBanner from "../../assets/1.png";
import "./EnsOnchainRegisterModal.css";
import { Button, Input, Text } from "../atoms";

export interface EnsOnchainRegisterModalProps {
  step: number;
  name: string;
  profileComplete: boolean;
  onStepChange: (step: number) => void;
  onNameChange: (name: string) => void;
  onProfileCompleteChange: (complete: boolean) => void;
  onRegister: () => void;
  onCancel: () => void;
}

export function EnsOnchainRegisterModal({
  step,
  name,
  profileComplete,
  onStepChange,
  onNameChange,
  onProfileCompleteChange,
  onRegister,
  onCancel,
}: EnsOnchainRegisterModalProps) {
  function handleRegister() {
    if (step < 5) onStepChange(step + 1);
    onRegister();
  }
  function handleCancel() {
    onCancel();
  }
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <div className="ns-onchain-register-card">
            <div className="ns-onchain-register-banner">
              <img src={ensBanner} alt="ENS Banner" />
            </div>
            <div className="ns-onchain-register-header">
              <Text size="lg" weight="bold">Get your Web3 Username</Text>
            </div>
            <div className="ns-onchain-register-input-row">
              <Input
                type="text"
                placeholder="Find name"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
              />
              <span>.eth</span>
            </div>
            <div className="ns-onchain-register-actions">
              <Button className="cancel" onClick={handleCancel}>Cancel</Button>
              <Button
                className="primary"
                onClick={() => onStepChange(1)}
                disabled={!name}
              >
                Register
              </Button>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="ns-onchain-register-card">
            <div className="ns-onchain-register-banner">
              <img src={ensBanner} alt="ENS Banner" />
            </div>
            <div className="ns-onchain-register-header">
              <Text size="lg" weight="bold">Get your Web3 Username</Text>
            </div>
            <div className="ns-onchain-register-input-row">
              <Input type="text" value={name} readOnly />
              <span>.eth</span>
            </div>
            <div className="ns-onchain-register-actions">
              <Button className="cancel" onClick={handleCancel}>Cancel</Button>
              <Button className="primary" onClick={() => onStepChange(2)}>
                Register
              </Button>
            </div>
          </div>
        );
      case 2:
      case 3:
      case 4:
        return (
          <div className="ns-onchain-register-card">
            <div className="ns-onchain-register-banner">
              <img src={ensBanner} alt="ENS Banner" />
            </div>
            <div className="ns-onchain-register-header">
              <Text size="lg" weight="bold">You are about to mint</Text>
              <Text size="md" color="grey">{name}.eth</Text>
            </div>
            <div className="ns-onchain-register-section">
              <label>Owner</label>
              <div className="ns-onchain-register-select">
                <select>
                  <option value="0x95aD6...7B26F70B">0x95aD6...7B26F70B</option>
                  <option value="0x1234...ABCD">0x1234...ABCD</option>
                </select>
              </div>
            </div>
            <div className="ns-onchain-register-section">
              <label>Duration</label>
              <div className="ns-onchain-register-duration">
                <button>-</button>
                <span>1 year</span>
                <button>+</button>
              </div>
            </div>
            <div className="ns-onchain-register-summary">
              <div className="row">
                <span>1 year registration</span>
                <span>0.004 ETH</span>
              </div>
              <div className="row">
                <span>Est. network fee</span>
                <span>0.0010 ETH</span>
              </div>
              <div className="row total">
                <span>Total</span>
                <span>0.0014 ETH</span>
              </div>
            </div>
            <div className="ns-onchain-register-profile-card">
              <div className="ns-onchain-register-profile-icon">◎</div>
              <div className="ns-onchain-register-profile-text">
                <strong>Complete your profile</strong>
                <p>Make your ENS more discoverable</p>
              </div>
              <div className="ns-onchain-register-profile-action">›</div>
            </div>
            <div className="ns-onchain-register-toggle">
              <div className="toggle-text">
                <strong>Use as primary name</strong>
                <p>
                  This links your address to this name, allowing dApps to display it as your profile when connected.
                  You can only have one primary name per address.
                </p>
              </div>
              <div className="toggle-switch">
                <input type="checkbox" id="primaryToggle" />
                <label htmlFor="primaryToggle"></label>
              </div>
            </div>
            <div className="ns-onchain-register-actions">
              <Button className="cancel" onClick={handleCancel}>Cancel</Button>
              <Button className="primary" onClick={handleRegister}>
                Register
              </Button>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="ns-onchain-register-card ns-onchain-register-success">
            <div className="ns-onchain-register-banner">
              <img src={ensBanner} alt="ENS Banner" />
            </div>
            <div className="ns-onchain-register-icon">✅</div>
            <Text size="lg" weight="bold">ENS name registered successfully</Text>
            <Text size="sm" color="grey">Lorem ipsum dolor sit amet</Text>
            <div className="ns-onchain-register-actions">
              <Button className="primary" onClick={() => onStepChange(0)}>
                Finish
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
  return (
    <div className="ns-onchain-register-container">
      {renderStep()}
    </div>
  );
}
