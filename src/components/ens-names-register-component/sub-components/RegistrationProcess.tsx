import { useEffect, useState } from "react";
import { Hash } from "viem";
import { Button, Text } from "../../atoms";
import { Header } from "./Header";
import { StepItem } from "./StepItem";
import { ProgressBar } from "./ProgressBar";
import { Timer } from "./Timer";
import {
  EnsRegistrationContext,
  useErrorModal,
  useEthRegistrarController,
  useMainChain,
} from "@/hooks";
import { useWaitForTransaction } from "@/hooks/web3/use-wait-for-transaction";

interface RegistrationProcessProps {
  registrations: EnsRegistrationContext[];
  onBack: () => void;
  onClose?: () => void;
  onCompleteProfile?: () => void;
  onRegistrationComplete?: () => void;
}

enum RegistrationStep {
  RegistrationBegin = 0,
  CommitmentSent = 1,
  TimerStarted = 2,
  TimerCompleted = 3,
  RegistrationSent = 4,
  RegistrationCompleted = 5,
}

export function RegistrationProcess({
  registrations,
  onBack,
  onClose,
  onCompleteProfile,
  onRegistrationComplete,
}: RegistrationProcessProps) {
  const [step, setStep] = useState<RegistrationStep>(RegistrationStep.RegistrationBegin);
  const [expandedStep, setExpandedStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerProgress, setTimerProgress] = useState(0);
  const [waitingForWallet, setWaitingForWallet] = useState(false);
  const [waitingForTx, setWaitingForTx] = useState(false);

  const { bulkCommitment, bulkRegister } = useEthRegistrarController();
  const { showErrorModal } = useErrorModal();
  const { networkId } = useMainChain();
  const { waitForTransactionReceipt } = useWaitForTransaction({ chainId: networkId });

  // Timer countdown effect
  useEffect(() => {
    if (step === RegistrationStep.TimerStarted && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStep(RegistrationStep.TimerCompleted);
            setCompletedSteps([1, 2]);
            setExpandedStep(3);
            return 0;
          }
          const newSeconds = prev - 1;
          setTimerProgress(((60 - newSeconds) / 60) * 100);
          return newSeconds;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, timerSeconds]);

  // Progress bar effect for commitment transaction
  useEffect(() => {
    if (isTransactionInProgress && step === RegistrationStep.CommitmentSent) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsTransactionInProgress(false);
            setStep(RegistrationStep.TimerStarted);
            setCompletedSteps([1]);
            setExpandedStep(2);
            setTimerSeconds(60);
            setTimerProgress(0);
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isTransactionInProgress, step]);

  const sendCommitmentTx = async () => {
    let tx: Hash;

    try {
      setWaitingForWallet(true);
      tx = await bulkCommitment(registrations);
    } catch (err) {
      showErrorModal(err);
      setWaitingForWallet(false);
      return;
    } finally {
      setWaitingForWallet(false);
    }

    try {
      setStep(RegistrationStep.CommitmentSent);
      setIsTransactionInProgress(true);
      setProgress(0);
      setWaitingForTx(true);

      await waitForTransactionReceipt(tx, 2);

      setWaitingForTx(false);
      setIsTransactionInProgress(false);
      setStep(RegistrationStep.TimerStarted);
      setCompletedSteps([1]);
      setExpandedStep(2);
      setTimerSeconds(60);
      setTimerProgress(0);
    } catch (err) {
      showErrorModal(err);
      setWaitingForTx(false);
      setIsTransactionInProgress(false);
      setStep(RegistrationStep.RegistrationBegin);
    }
  };

  const sendRegistrationTx = async () => {
    let tx: Hash;

    try {
      setWaitingForWallet(true);
      tx = await bulkRegister(registrations);
    } catch (err) {
      showErrorModal(err);
      setWaitingForWallet(false);
      return;
    } finally {
      setWaitingForWallet(false);
    }

    try {
      setStep(RegistrationStep.RegistrationSent);
      setWaitingForTx(true);

      await waitForTransactionReceipt(tx, 2);

      setWaitingForTx(false);
      setStep(RegistrationStep.RegistrationCompleted);
      setCompletedSteps([1, 2, 3]);
      onRegistrationComplete?.();
    } catch (err) {
      console.log(err);
      showErrorModal(err);
      setWaitingForTx(false);
      setStep(RegistrationStep.TimerCompleted);
    }
  };

  const handleOpenWallet = () => {
    sendCommitmentTx();
  };

  const handleCompleteRegistration = () => {
    sendRegistrationTx();
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? 0 : stepNumber);
  };

  const getActionButton = () => {
    let label = "Open Wallet";
    let loading = false;
    let action = handleOpenWallet;

    if (waitingForTx) {
      label = "Waiting for transaction";
      loading = true;
    } else if (waitingForWallet) {
      label = "Waiting for wallet";
      loading = true;
    } else if (step === RegistrationStep.TimerStarted) {
      label = "Waiting for timer";
      loading = true;
    } else if (step === RegistrationStep.TimerCompleted) {
      label = "Complete Registration";
      action = handleCompleteRegistration;
    }

    return (
      <Button
        className="ens-names-register-open-wallet-btn"
        variant="solid"
        size="lg"
        onClick={action}
        disabled={loading}
      >
        {label}
      </Button>
    );
  };

  const remainingHours = 23; // This could be calculated based on actual deadline

  // Determine step states
  const isCommitmentNotStarted = step === RegistrationStep.RegistrationBegin;
  const isCommitmentInProgress = step === RegistrationStep.CommitmentSent;
  const isCommitmentCompleted = step >= RegistrationStep.TimerStarted;
  
  const isTimerNotStarted = step < RegistrationStep.TimerStarted;
  const isTimerInProgress = step === RegistrationStep.TimerStarted;
  const isTimerCompleted = step >= RegistrationStep.TimerCompleted;
  
  const isRegistrationNotStarted = step < RegistrationStep.TimerCompleted;
  const isRegistrationInProgress = step === RegistrationStep.RegistrationSent;
  const isRegistrationCompleted = step === RegistrationStep.RegistrationCompleted;

  return (
    <div className="ens-names-register-container">
      <div className="ens-names-register-card">
        <Header showBack={true} onBack={onBack} onClose={onClose} />

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
          isCompleted={isCommitmentCompleted}
          onToggle={() => toggleStep(1)}
        >
          {isCommitmentNotStarted ? (
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
              {getActionButton()}
            </>
          ) : isCommitmentInProgress ? (
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
          ) : (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Commitment Complete
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Your commitment transaction has been confirmed. The timer has started.
              </Text>
            </>
          )}
        </StepItem>

        <StepItem
          stepNumber={2}
          title="Time Started"
          isExpanded={expandedStep === 2}
          isCompleted={isTimerCompleted}
          onToggle={() => toggleStep(2)}
        >
          {isTimerNotStarted ? (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Waiting to Start
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Complete the commitment transaction first to start the timer.
              </Text>
            </>
          ) : isTimerInProgress ? (
            <>
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
            </>
          ) : (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Timer Complete
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                The waiting period has completed. You can now complete your registration.
              </Text>
            </>
          )}
        </StepItem>

        <StepItem
          stepNumber={3}
          title="Complete Registration"
          isExpanded={expandedStep === 3}
          isCompleted={isRegistrationCompleted}
          onToggle={() => toggleStep(3)}
        >
          {isRegistrationNotStarted ? (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Waiting for Timer
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Complete the previous steps to proceed with registration.
              </Text>
            </>
          ) : isRegistrationInProgress ? (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Registration in Progress
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Your registration transaction is being processed. Please wait...
              </Text>
            </>
          ) : isRegistrationCompleted ? (
            <>
              <Text
                size="lg"
                weight="bold"
                className="ens-names-register-step-content-title"
              >
                Registration Complete
              </Text>
              <Text
                size="sm"
                color="grey"
                className="ens-names-register-step-content-description"
              >
                Your ENS name has been successfully registered!
              </Text>
            </>
          ) : (
            <>
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
              {getActionButton()}
            </>
          )}
        </StepItem>

        {step === RegistrationStep.RegistrationBegin && (
          <div
            className="ens-names-register-footer-link"
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
