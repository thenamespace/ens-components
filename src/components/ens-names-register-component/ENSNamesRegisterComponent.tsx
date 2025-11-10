import React, { useState, useEffect } from "react";
import "./ENSNamesRegisterComponent.css";
import { NameSearch } from "./sub-components/NameSearch";
import { RegistrationForm } from "./sub-components/RegistrationForm";
import { RegistrationProcess } from "./sub-components/RegistrationProcess";
import { SuccessScreen } from "./sub-components/SuccessScreen";

export interface ENSNamesRegisterComponentProps {
  name?: string;
  duration?: number;
  onNameChange?: (name: string) => void;
  onDurationChange?: (duration: number) => void;
  onBack?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  onCompleteProfile?: () => void;
  onOpenWallet?: () => void;
  onCompleteRegistration?: () => void;
  onRegisterAnother?: () => void;
  onViewName?: () => void;
}

export function ENSNamesRegisterComponent({
  name = "brightwave",
  duration: initialDuration = 1,
  onNameChange,
  onDurationChange,
  onBack,
  onClose,
  onNext,
  onCompleteProfile,
  onOpenWallet,
  onCompleteRegistration,
  onRegisterAnother,
  onViewName,
}: ENSNamesRegisterComponentProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [ensName, setEnsName] = useState(name);
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState(1);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [remainingHours, setRemainingHours] = useState(23);

  const getExpiryDate = () => {
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setFullYear(now.getFullYear() + duration);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[expiryDate.getMonth()];
    const day = expiryDate.getDate();
    const year = expiryDate.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  useEffect(() => {
    if (isTransactionInProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTimerActive(true);
            setCompletedSteps([1]);
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isTransactionInProgress]);

  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerActive(false);
            setCompletedSteps([1, 2]);
            setExpandedStep(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimerActive, timerSeconds]);

  const handleDurationChange = (delta: number) => {
    const newDuration = Math.max(1, duration + delta);
    setDuration(newDuration);
    onDurationChange?.(newDuration);
  };

  const handleNameChange = (value: string) => {
    setEnsName(value);
    onNameChange?.(value);
  };

  const handleNameSearchNext = () => {
    setCurrentStep(1);
    onNext?.();
  };

  const handleNext = () => {
    setCurrentStep(2);
    onNext?.();
  };

  const handleBackToForm = () => {
    setCurrentStep(1);
    setIsTransactionInProgress(false);
    setProgress(0);
    setIsTimerActive(false);
    setTimerSeconds(60);
    setCompletedSteps([]);
    onBack?.();
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? 0 : stepNumber);
  };

  const handleOpenWallet = () => {
    setIsTransactionInProgress(true);
    setProgress(0);
    onOpenWallet?.();
  };

  const handleCompleteRegistration = () => {
    setCurrentStep(3);
    onCompleteRegistration?.();
  };

  const handleRegisterAnother = () => {
    setCurrentStep(0);
    setIsTransactionInProgress(false);
    setProgress(0);
    setIsTimerActive(false);
    setTimerSeconds(60);
    setCompletedSteps([]);
    setExpandedStep(1);
    onRegisterAnother?.();
  };

  const timerProgress = ((60 - timerSeconds) / 60) * 100;
  const registrationCost = 0.004 * duration;
  const networkFee = 0.001;
  const total = registrationCost + networkFee;

  if (currentStep === 0) {
    return (
      <NameSearch
        ensName={ensName}
        onNameChange={handleNameChange}
        onBack={onBack}
        onClose={onClose}
        onNext={handleNameSearchNext}
      />
    );
  }

  if (currentStep === 1) {
    return (
      <RegistrationForm
        ensName={ensName}
        duration={duration}
        registrationCost={registrationCost}
        networkFee={networkFee}
        total={total}
        onNameChange={handleNameChange}
        onDurationChange={handleDurationChange}
        onBack={() => setCurrentStep(0)}
        onClose={onClose}
        onNext={handleNext}
        onCompleteProfile={onCompleteProfile}
      />
    );
  }

  if (currentStep === 3) {
    return (
      <SuccessScreen
        ensName={ensName}
        duration={duration}
        registrationCost={registrationCost}
        networkFee={networkFee}
        total={total}
        expiryDate={getExpiryDate()}
        onClose={onClose}
        onRegisterAnother={handleRegisterAnother}
        onViewName={onViewName || (() => {})}
      />
    );
  }

  return (
    <RegistrationProcess
      expandedStep={expandedStep}
      completedSteps={completedSteps}
      isTransactionInProgress={isTransactionInProgress}
      progress={progress}
      timerSeconds={timerSeconds}
      timerProgress={timerProgress}
      remainingHours={remainingHours}
      onBack={handleBackToForm}
      onClose={onClose}
      onToggleStep={toggleStep}
      onOpenWallet={handleOpenWallet}
      onCompleteRegistration={handleCompleteRegistration}
      onCompleteProfile={onCompleteProfile}
    />
  );
}

export default ENSNamesRegisterComponent;
