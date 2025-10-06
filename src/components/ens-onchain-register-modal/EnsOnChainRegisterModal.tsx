import React from "react";
import ensBanner from "../../assets/1.png";
import ninjaLogo from "../../assets/ninja.png";
import finishLogo from "../../assets/finish.png";
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
    const [showInput, setShowInput] = React.useState(false);
    const [customOwner, setCustomOwner] = React.useState("");
    const [duration, setDuration] = React.useState(1); // years

    function handleRegister() {
        if (step < 5) onStepChange(step + 1);
        onRegister();
    }
    function handleCancel() {
        onCancel();
    }
    function handleDurationChange(delta: number) {
        setDuration((d) => Math.max(1, d + delta));
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

                            <div className="ns-onchain-register-select">
                                <select
                                    onChange={(e) => setShowInput(e.target.value === "custom")}
                                    defaultValue="self"
                                >
                                    <option value="self">Owner</option>
                                    <option value="custom">Custom address</option>
                                </select>
                                {showInput && (
                                    <Input
                                        type="text"
                                        placeholder="Enter custom address"
                                        value={customOwner}
                                        onChange={(e) => setCustomOwner(e.target.value)}
                                    />
                                )}
                            </div>
                        </div>
                        <div className="ns-onchain-register-container-inner">
                            <div className="ns-onchain-register-duration-section">
                                <div className="ns-onchain-register-duration">
                                    <button onClick={() => handleDurationChange(-1)}>-</button>
                                    <Text weight="bold">
                                        {duration} year{duration > 1 ? "s" : ""}
                                    </Text>
                                    <button onClick={() => handleDurationChange(1)}>+</button>
                                </div>
                            </div>

                            <div className="ns-onchain-register-summary">
                                <div className="row">
                                    <Text size="sm">{duration} year registration</Text>
                                    <Text size="sm" weight="bold">{(0.004 * duration).toFixed(3)} ETH</Text>
                                </div>
                                <div className="row">
                                    <Text size="sm">Est. network fee</Text>
                                    <Text size="sm" weight="bold">0.0010 ETH</Text>
                                </div>
                                <div className="row total">
                                    <Text size="lg" weight="bold">Total</Text>
                                    <Text size="lg" weight="bold">{(0.004 * duration + 0.001).toFixed(3)} ETH</Text>
                                </div>
                            </div>
                        </div>
                        <div className="ns-onchain-register-profile-card">
                            <div className="ns-onchain-register-profile-icon">
                                <img src={ninjaLogo} alt="ENS Icon" />
                            </div>
                            <div className="ns-onchain-register-profile-text">
                                <Text size="md" weight="bold">Complete your profile</Text>
                                <Text size="sm">Make your ENS more discoverable</Text>
                            </div>
                            <div className="ns-onchain-register-profile-action">›</div>
                        </div>

                        <div className="ns-onchain-register-toggle">
                            <div className="toggle-text">
                                <Text size="md" weight="bold">Use as primary name</Text>
                                <Text size="xs">
                                    This links your address to this name, allowing dApps to display it as your profile when connected.
                                    You can only have one primary name per address.
                                </Text>
                            </div>
                            <div className="toggle-switch">
                                <input type="checkbox" id="primaryToggle" />
                                <label htmlFor="primaryToggle"></label>
                            </div>
                        </div>
                        <div className="ns-onchain-register-actions">
                            <Button className="cancel" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button className="primary" onClick={handleRegister}>
                                Register
                            </Button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="ns-onchain-register-card ns-onchain-register-success">
                        <div className="ns-onchain-register-finish-banner">
                            <img src={finishLogo} alt="ENS Banner" />
                        </div>
                        <Text size="xl" weight="bold">ENS name registered successfully</Text>
                        <Text size="lg" color="grey">Lorem ipsum dolor sit amet</Text>
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
