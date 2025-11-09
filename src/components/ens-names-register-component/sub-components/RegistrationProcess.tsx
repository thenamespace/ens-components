import ensBanner from "../../../assets/banner.png";
import { Button, Text } from "../../atoms";
import { Header } from "./Header";
import { StepItem } from "./StepItem";
import { ProgressBar } from "./ProgressBar";
import { Timer } from "./Timer";

interface RegistrationProcessProps {
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

export function RegistrationProcess({
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
}: RegistrationProcessProps) {
  return (
    <div className="ens-names-register-container">
      <div className="ens-names-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

        <div className="ens-names-register-banner">
          <img src={ensBanner} alt="ENS Banner" />
        </div>

        <div className="ens-names-register-title-section">
          <Text size="xl" weight="bold" className="ens-names-register-title">
            ENS Registration Process
          </Text>
          <Text size="md" color="grey" className="ens-names-register-subtitle">
            Registration Consists of 3 Steps
          </Text>
        </div>

        <StepItem
          stepNumber={1}
          title="Commitment"
          isExpanded={expandedStep === 1}
          isCompleted={completedSteps.includes(1)}
          onToggle={() => onToggleStep(1)}
        >
          {!isTransactionInProgress ? (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Start Your Journey
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Kickstart your registration by completing a transaction. This
                action sets your timer and officially begins the process. Simply
                create the transaction in your wallet to move forward.
              </Text>
              <Button
                className="ens-names-register-open-wallet-btn"
                variant="solid"
                size="lg"
                onClick={onOpenWallet}
              >
                Open Wallet
              </Button>
            </>
          ) : (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Transaction in Progress
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Your transaction has been sent! The timer is now running. Once
                the progress bar completes, your registration will be confirmed.
              </Text>
              <ProgressBar progress={progress} />
            </>
          )}
        </StepItem>

        <StepItem
          stepNumber={2}
          title="Time Started"
          isExpanded={expandedStep === 2}
          isCompleted={completedSteps.includes(2)}
          onToggle={() => onToggleStep(2)}
        >
          <Text
            size="lg"
            weight="bold"
            className="ens-names-register-step-content-title"
          >
            Waiting...
          </Text>
          <Text
            size="sm"
            color="grey"
            className="ens-names-register-step-content-description"
          >
            This wait prevents others from front running your transaction. You
            will be prompted to complete a second transaction when the timer is
            complete.
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
            className="ens-names-register-step-content-title"
          >
            Register name
          </Text>
          <Text
            size="sm"
            color="grey"
            className="ens-names-register-step-content-description"
          >
            Your name is not registered until you've completed the second
            transaction. You have {remainingHours} hours remaining to complete
            it.
          </Text>
          <Button
            className="ens-names-register-complete-btn"
            variant="solid"
            size="lg"
            onClick={onCompleteRegistration}
          >
            Complete Registration
          </Button>
        </StepItem>

        <div
          className="ens-names-register-footer-link"
          onClick={onCompleteProfile}
        >
          <Text size="sm" color="grey">
            I'd like to set up my profile first
          </Text>
        </div>
      </div>
    </div>
  );
}
