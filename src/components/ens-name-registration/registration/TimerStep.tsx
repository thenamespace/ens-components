import React, { useEffect, useMemo, useState } from "react";
import { Accordion } from "../../molecules/accordion";
import { Text, Icon } from "../../atoms";
import { ProcessSteps, RegistrationState } from "./types";
import { Timer } from "./Timer";

interface TimerStepProps {
  state: RegistrationState;
  onTimerCompleted?: () => void;
}

export const TimerStep: React.FC<TimerStepProps> = ({
  state,
  onTimerCompleted,
}) => {
  const INITIAL_SECONDS = 60;
  const [secondsToWait, setSecondsToWait] = useState<number>(INITIAL_SECONDS);

  const { isCurrentStep, isDisabled, shouldStartTimer, isPending, isCompleted } = useMemo(() => {
    const isPending = state.step < ProcessSteps.TimerStarted;
    const isCurrentStep =
      state.step >= ProcessSteps.CommitmentCompleted &&
      state.step < ProcessSteps.TimerCompleted;  
    const isCompleted = state.step >= ProcessSteps.TimerCompleted;
    const isDisabled = !isCurrentStep;
    return {
      isCurrentStep,
      isDisabled,
      shouldStartTimer: state.step === ProcessSteps.TimerStarted,
      isPending,
      isCompleted
    };
  }, [state]);

  const getProgressStatusBadge = () => {
    if (isCurrentStep) {
      return (
        <div className="ns-process-badge me-2">
          <Text color="white" weight="bold" size="sm">
            2
          </Text>
        </div>
      );
    } else if (isCompleted) {
      return (
        <div className="ns-process-badge ns-process-badge--inactive ns-process-badge--completed me-2">
          <Icon name="check" size={16} color="black" />
        </div>
      );
    } else {
      return (
        <div className="ns-process-badge ns-process-badge--inactive me-2">
          <Text color="primary" weight="bold" size="sm">
            2
          </Text>
        </div>
      );
    }
  };

  useEffect(() => {
    if (!shouldStartTimer) {
      return;
    }
    const int = setInterval(() => {
      setSecondsToWait(prev => {
        if (prev <= 0) {
          onTimerCompleted?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(int);
  }, [onTimerCompleted, shouldStartTimer]);

  // Calculate progress: 60 seconds = 0%, 0 seconds = 100%
  const progress = Math.ceil(
    ((INITIAL_SECONDS - secondsToWait) / INITIAL_SECONDS) * 100
  );

  return (
    <Accordion
      disabled={isDisabled}
      isOpen={isCurrentStep}
      title={
        <div className="d-flex align-items-center">
          {getProgressStatusBadge()}
          <Text size="sm" weight="medium">
            Timer Started
          </Text>
        </div>
      }
    >
      <div className="ns-text-center">
        <Text weight="medium" className="mb-2">
          Waiting...
        </Text>
        <Text size="xs" color="grey">
          This wait prevents others from front running your transaction. You
          will be prompted to complete a second transaction when the timer is
          complete.
        </Text>
        <Timer seconds={secondsToWait} progress={progress} />
      </div>
    </Accordion>
  );
};
