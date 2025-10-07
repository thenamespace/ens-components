import React from "react";
import ensBanner from "../../assets/banner.png";
import ninjaLogo from "../../assets/ninja.png";
import finishLogo from "../../assets/finish.png";
import "./EnsOffChainRegisterModal.css";
import { Button, Input, Text, Icon } from "../atoms";

export interface EnsOffChainRegisterModalProps {
    step: number;
    name: string;
    profileComplete: boolean;
    onStepChange: (step: number) => void;
    onNameChange: (name: string) => void;
    onProfileCompleteChange: (complete: boolean) => void;
    onRegister: () => void;
    onCancel: () => void;
}

export function EnsOffChainRegisterModal({
    step,
    name,
    profileComplete,
    onStepChange,
    onNameChange,
    onProfileCompleteChange,
    onRegister,
    onCancel,
}: EnsOffChainRegisterModalProps) {
    function handleRegister() {
        onStepChange(1);
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
                            <Icon name="search" size={16} className="ns-search-icon" />
                            <Input
                                type="text"
                                className="ns-input"
                                placeholder="Find name"
                                value={name}
                                onChange={(e) => onNameChange(e.target.value)}
                            />
                            <Text className="ns-domain-suffix">bitflip.eth</Text>
                        </div>
                        <div className="ns-onchain-register-name-exist">
                            {[
                                { name: "nikku.eth", status: "unavailable" },
                                { name: "nikku.miracool.eth", status: "unavailable" },
                                { name: "nikku.bitflip.eth", status: "unavailable" },
                                { name: "nikku.basedsubs.eth", status: "free" },
                                { name: "nikku.fbwallet.eth", status: "free" },
                                { name: "nikku.premium.eth", status: "price", value: "0.0025 ETH" }
                            ].map((item, index) => (
                                <div
                                    key={index}
                                    className={`ns-onchain-register-name-item ${item.status === "price" ? "selected" : ""}`}
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
                                            <Text className="status-price">{('value' in item ? item.value : '')}</Text>
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
                                onClick={handleRegister}
                                disabled={!name}
                            >
                                Register
                            </Button>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="ns-offchain-register-card ns-offchain-register-success">
                        <div className="ns-offchain-register-finish-banner">
                            <img src={finishLogo} alt="ENS Banner" />
                        </div>
                        <Text size="xl" weight="bold">ENS name registered successfully</Text>
                        <Text size="lg" color="grey">You have successfully registered {name}.eth</Text>
                        <div className="ns-offchain-register-actions">
                            <Button className="primary" onClick={() => onStepChange(0)}>
                                Finish
                            </Button>
                            <Button className="secondary" onClick={() => onProfileCompleteChange(true)}>
                                Set Profile
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }
    return (
        <div className="ns-offchain-register-container">
            {renderStep()}
        </div>
    );
}
