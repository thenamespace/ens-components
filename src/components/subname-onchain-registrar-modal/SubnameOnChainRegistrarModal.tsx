import { useState } from "react";
import "./SubnameOnChainRegistrarModal.css";
import { InitialStep } from "./sub-components/InitialStep";
import { RegistrationStep } from "./sub-components/RegistrationStep";
import { OnchainSuccessScreen } from "./sub-components/OnchainSuccessScreen";

export interface SubnameOnChainRegistrarModalProps {
  step?: number;
  name?: string;
  profileComplete?: boolean;
  domainSuffix?: string;
  owner?: string;
  duration?: number;
  registrationFee?: string;
  networkFee?: string;
  totalCost?: string;
  useAsPrimary?: boolean;
  profileImageUrl?: string;
  onStepChange?: (step: number) => void;
  onNameChange?: (name: string) => void;
  onProfileCompleteChange?: (complete: boolean) => void;
  onOwnerChange?: (owner: string) => void;
  onDurationChange?: (duration: number) => void;
  onUseAsPrimaryChange?: (useAsPrimary: boolean) => void;
  onRegister?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  onCompleteProfile?: () => void;
  onOpenWallet?: () => void;
  onCompleteRegistration?: () => void;
  onRegisterAnother?: () => void;
  onViewName?: () => void;
  onFinish?: () => void;
}

export function SubnameOnChainRegistrarModal({
  step: initialStep = 0,
  name: initialName = "",
  profileComplete = false,
  domainSuffix = "eth",
  owner: initialOwner = "0x035eB...24117D3",
  duration: initialDuration = 1,
  registrationFee = "0.004",
  networkFee = "0.0010",
  totalCost = "0.0014",
  useAsPrimary: initialUseAsPrimary = false,
  profileImageUrl,
  onStepChange,
  onNameChange,
  onProfileCompleteChange,
  onOwnerChange,
  onDurationChange,
  onUseAsPrimaryChange,
  onRegister,
  onCancel,
  onClose,
  onCompleteProfile,
  onOpenWallet,
  onCompleteRegistration,
  onRegisterAnother,
  onViewName,
  onFinish,
}: SubnameOnChainRegistrarModalProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [ensName, setEnsName] = useState(initialName);
  const [owner, setOwner] = useState(initialOwner);
  const [duration, setDuration] = useState(initialDuration);
  const [useAsPrimary, setUseAsPrimary] = useState(initialUseAsPrimary);

  const handleNameChange = (value: string) => {
    setEnsName(value);
    onNameChange?.(value);
  };

  const handleOwnerChange = (value: string) => {
    setOwner(value);
    onOwnerChange?.(value);
  };

  const handleDurationChange = (value: number) => {
    setDuration(value);
    onDurationChange?.(value);
  };

  const handleUseAsPrimaryChange = (value: boolean) => {
    setUseAsPrimary(value);
    onUseAsPrimaryChange?.(value);
  };

  const handleInitialRegister = () => {
    // Move to registration step when register is clicked from InitialStep
    setCurrentStep(1);
    onStepChange?.(1);
    onRegister?.();
  };

  const handleFinish = () => {
    onFinish?.();
    onClose?.();
  };

  const handleRegister = () => {
    // Move to success screen when register is clicked from RegistrationStep
    setCurrentStep(2);
    onStepChange?.(2);
    onCompleteRegistration?.();
  };

  const handleBack = () => {
    setCurrentStep(0);
    onStepChange?.(0);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // Initial step (first screen)
  if (currentStep === 0) {
    return (
      <div className="ns-onchain-register-container">
        <InitialStep
          name={ensName}
          onNameChange={handleNameChange}
          onCancel={handleCancel}
          onRegister={handleInitialRegister}
          onClose={onClose}
          domainSuffix={domainSuffix}
        />
      </div>
    );
  }

  // Registration step (second screen)
  if (currentStep === 1) {
    return (
      <div className="ns-onchain-register-container">
        <RegistrationStep
          name={ensName}
          domainSuffix={domainSuffix}
          owner={owner}
          duration={duration}
          registrationFee={registrationFee}
          networkFee={networkFee}
          totalCost={totalCost}
          useAsPrimary={useAsPrimary}
          profileComplete={profileComplete}
          profileImageUrl={profileImageUrl}
          onBack={handleBack}
          onCancel={handleCancel}
          onRegister={handleRegister}
          onClose={onClose}
          onOwnerChange={handleOwnerChange}
          onDurationChange={handleDurationChange}
          onUseAsPrimaryChange={handleUseAsPrimaryChange}
          onCompleteProfile={onCompleteProfile}
        />
      </div>
    );
  }

  // Success step (third screen)
  if (currentStep === 2) {
    return (
      <div className="ns-onchain-register-container">
        <OnchainSuccessScreen
          name={ensName}
          onClose={onClose}
          onFinish={handleFinish}
        />
      </div>
    );
  }

  // Default to initial step
  return (
    <div className="ns-onchain-register-container">
      <InitialStep
        name={ensName}
        onNameChange={handleNameChange}
        onCancel={handleCancel}
        onRegister={handleInitialRegister}
        onClose={onClose}
        domainSuffix={domainSuffix}
      />
    </div>
  );
}
