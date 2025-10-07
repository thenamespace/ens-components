import React from "react";
import ensBanner from "../../assets/banner.png";
import ninjaLogo from "../../assets/ninja.png";
import finishLogo from "../../assets/finish.png";
import "./EnsOnchainRegisterModal.css";
import { Button, Icon, Input, Text } from "../atoms";

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
    const [duration, setDuration] = React.useState(1);

    function handleRegister() {
        if (step < 3) onStepChange(step + 1);
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
                            <Icon name="search" size={16} className="ns-search-icon" />
                            <Input
                                type="text"
                                className="ns-input"
                                placeholder="Find name"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                            />

                            {/* Using a span for consistency with your original code */}
                            <Text className="ns-domain-suffix">
                                bitflip.eth
                            </Text>
                        </div>

                        <div className="ns-onchain-register-name-exist">
                            {[
                                { name: "nikku.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "price", value: "0.0025 ETH" },
                                { name: "nikku.bitflip.eth", status: "free" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={`ns-onchain-register-name-item ${item.status === "price" ? "selected" : ""
                                        }`}
                                >
                                    <div className="ns-onchain-register-name-left">
                                        <img
                                            className={`ns-onchain-register-name-avatar`}
                                            src={ninjaLogo}
                                            alt="ENS Logo"
                                            style={{ width: 24, height: 24, objectFit: "cover", borderRadius: "50%" }}
                                        />
                                        <Text className="ns-onchain-register-name-text">{item.name}</Text>
                                    </div>

                                    <div className="ns-onchain-register-name-status">
                                        {item.status === "unavailable" && (
                                            <Text className="status-unavailable">Unavailable</Text>
                                        )}
                                        {item.status === "price" && (
                                            <Text className="status-price">{item.value}</Text>
                                        )}
                                        {item.status === "free" && <Text className="status-free">Free</Text>}
                                    </div>
                                </div>
                            ))}
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
                                Back
                            </Button>
                            <Button className="primary" onClick={handleRegister}>
                                Register
                            </Button>
                        </div>
                    </div>
                );
            case 2:
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
