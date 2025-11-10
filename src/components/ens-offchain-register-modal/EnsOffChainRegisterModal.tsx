import React, { useState } from "react";
import "./EnsOffChainRegisterModal.css";
import { InitialStep } from "./sub-components/InitialStep";
import { OffchainSuccessScreen } from "./sub-components/OffchainSuccessScreen";

export interface EnsOffChainRegisterModalProps {
  step?: number;
  name?: string;
  profileComplete?: boolean;
  onStepChange?: (step: number) => void;
  onNameChange?: (name: string) => void;
  onProfileCompleteChange?: (complete: boolean) => void;
  onRegister?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  onCompleteProfile?: () => void;
  onOpenWallet?: () => void;
  onCompleteRegistration?: () => void;
  onRegisterAnother?: () => void;
  onViewName?: () => void;
}

export function EnsOffChainRegisterModal({
  step: initialStep = 0,
  name: initialName = "",
  profileComplete = false,
  onStepChange,
  onNameChange,
  onProfileCompleteChange,
  onRegister,
  onCancel,
  onClose,
  onCompleteProfile,
  onOpenWallet,
  onCompleteRegistration,
  onRegisterAnother,
  onViewName,
}: EnsOffChainRegisterModalProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [ensName, setEnsName] = useState(initialName);

  const handleNameChange = (value: string) => {
    setEnsName(value);
    onNameChange?.(value);
  };

  const handleRegister = () => {
    setCurrentStep(2);
    onRegister?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  if (currentStep === 0) {
    return (
      <div className="ns-offchain-register-container">
        <InitialStep
          name={ensName}
          onNameChange={handleNameChange}
          onCancel={handleCancel}
          onRegister={handleRegister}
          onClose={onClose}
        />
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <OffchainSuccessScreen
        name={ensName}
        onClose={onClose}
        onSetProfile={onCompleteProfile}
        onFinish={onClose}
      />
    );
  }
  return (
    <div className="ns-offchain-register-container">
      <InitialStep
        name={ensName}
        onNameChange={handleNameChange}
        onCancel={handleCancel}
        onRegister={handleRegister}
        onClose={onClose}
      />
    </div>
  );
}
