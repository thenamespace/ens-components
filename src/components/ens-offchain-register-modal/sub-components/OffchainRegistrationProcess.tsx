import React from "react";
import ensBanner from "../../../assets/banner.png";
import { Button, Text } from "../../atoms";
import { StepItem } from "../../ens-names-register-component/sub-components/StepItem";
import { ProgressBar } from "../../ens-names-register-component/sub-components/ProgressBar";
import { Timer } from "../../ens-names-register-component/sub-components/Timer";
import { Header } from "../../ens-names-register-component/sub-components/Header";

interface OffchainRegistrationProcessProps {
  name: string;
  expandedStep: number;
  completedSteps: number[];
  isTransactionInProgress: boolean;
  progress: number;
  timerSeconds: number;
  timerProgress: number;
  remainingHours: number;
  onBack: () => void;
  onClose?: () => void;
  onToggleStep: (stepNumber: number) => void;
  onOpenWallet: () => void;
  onCompleteRegistration: () => void;
  onCompleteProfile?: () => void;
}

export function OffchainRegistrationProcess({
  name,
  expandedStep,
  completedSteps,
  isTransactionInProgress,
  progress,
  timerSeconds,
  timerProgress,
  remainingHours,
  onBack,
  onClose,
  onToggleStep,
  onOpenWallet,
  onCompleteRegistration,
  onCompleteProfile,
}: OffchainRegistrationProcessProps) {
  return (
    <div className="ns-offchain-register-container">
      <div className="ns-offchain-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

        <div className="ns-offchain-register-banner">
          <img src={ensBanner} alt="ENS Banner" />
        </div>

        <div className="ns-offchain-register-title-section">
          <Text size="xl" weight="bold" className="ns-offchain-register-title">
            Offchain Subname Registration
          </Text>
          <Text
            size="md"
            color="grey"
            className="ns-offchain-register-subtitle"
          >
            Registration Consists of 3 Steps
          </Text>
        </div>

        <StepItem
          stepNumber={1}
          title="Sign Message"
          isExpanded={expandedStep === 1}
          isCompleted={completedSteps.includes(1)}
          onToggle={() => onToggleStep(1)}
        >
          {!isTransactionInProgress ? (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ns-offchain-register-step-content-title"
              >
                Start Your Registration
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ns-offchain-register-step-content-description"
              >
                Sign a message to begin the offchain subname registration
                process. This action will initiate your registration without
                requiring a blockchain transaction.
              </Text>
              <Button
                className="ns-offchain-register-open-wallet-btn"
                variant="solid"
                size="lg"
                onClick={onOpenWallet}
              >
                Sign Message
              </Button>
            </>
          ) : (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ns-offchain-register-step-content-title"
              >
                Message Signing in Progress
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ns-offchain-register-step-content-description"
              >
                Your message is being signed. Once the progress bar completes,
                your registration will be confirmed.
              </Text>
              <ProgressBar progress={progress} />
            </>
          )}
        </StepItem>

        <StepItem
          stepNumber={2}
          title="Wait for Confirmation"
          isExpanded={expandedStep === 2}
          isCompleted={completedSteps.includes(2)}
          onToggle={() => onToggleStep(2)}
        >
          <Text
            size="lg"
            weight="bold"
            className="ns-offchain-register-step-content-title"
          >
            Waiting for Confirmation...
          </Text>
          <Text
            size="sm"
            color="grey"
            className="ns-offchain-register-step-content-description"
          >
            Your subname registration is being processed. Please wait for the
            confirmation.
          </Text>
          <Timer seconds={timerSeconds} progress={timerProgress} />
        </StepItem>

        <StepItem
          stepNumber={3}
          title="Complete Registration"
          isExpanded={expandedStep === 3}
          isCompleted={false}
          onToggle={() => onToggleStep(3)}
        >
          <Text
            size="lg"
            weight="bold"
            className="ns-offchain-register-step-content-title"
          >
            Finalize Registration
          </Text>
          <Text
            size="sm"
            color="grey"
            className="ns-offchain-register-step-content-description"
          >
            Complete your offchain subname registration. You have{" "}
            {remainingHours} hours remaining to complete it.
          </Text>
          <Button
            className="ns-offchain-register-complete-btn"
            variant="solid"
            size="lg"
            onClick={onCompleteRegistration}
          >
            Complete Registration
          </Button>
        </StepItem>

        {onCompleteProfile && (
          <div
            className="ns-offchain-register-footer-link"
            onClick={onCompleteProfile}
          >
            <Text size="sm" color="grey">
              I'd like to set up my profile first
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
