import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Address, ContractFunctionExecutionError, Hash } from "viem";
import { Accordion } from "../../molecules/accordion";
import { Button, Text, Icon } from "../../atoms";
import { useRegisterENS, useWaitTransaction } from "@/hooks";
import {
  ContractErrorLabel,
  isUserDeniedError,
} from "../../molecules/contract-error-label/ContractErrorLabel";
import { ProcessSteps, RegistrationState } from "./types";
import { TransactionPendingScreen } from "./TransactionPendingScreen";

interface CommitmentStepProps {
  state: RegistrationState;
  isTestnet?: boolean;
  onStateUpdated: (state: RegistrationState) => void;
  referrer?: Address
}

export const CommitmentStep: React.FC<CommitmentStepProps> = ({
  state,
  isTestnet,
  onStateUpdated,
  referrer
}) => {
  const { sendCommitmentTx } = useRegisterENS({ isTestnet });
  const { waitTx } = useWaitTransaction({ isTestnet });
  const [error, setError] = useState<ContractFunctionExecutionError | null>(
    null
  );
  const { address } = useAccount();
  const [btnState, setBtnState] = useState<{
    waitingWallet: boolean;
    waitingTx: boolean;
  }>({
    waitingTx: false,
    waitingWallet: false,
  });
  const [commitTxStatus, setCommitTxStatus] = useState<{
    sent: boolean;
    completed: boolean;
    hash: string;
  }>({
    sent: false,
    completed: false,
    hash: "",
  });

  const { isCurrentStep, isCompleted, isPending } = useMemo(() => {
    return {
      isPending: state.step <= ProcessSteps.CommitmentSent,
      isCurrentStep: state.step < ProcessSteps.TimerStarted,
      isCompleted: state.step >= ProcessSteps.TimerStarted,
    };
  }, [state]);

  const handleCommitment = async () => {
    // Clear any previous errors
    setError(null);
    let tx: Hash | null = null;

    console.log("MAking commitment with records", state.records)

    try {
      setBtnState({ ...btnState, waitingWallet: true });

      tx = await sendCommitmentTx({
        label: state.label,
        owner: address!,
        expiryInYears: state.expiryInYears,
        secret: state.secret,
        records: state.records,
        referrer: referrer
      });
      setCommitTxStatus({ sent: true, completed: false, hash: tx });

      onStateUpdated({
        ...state,
        step: ProcessSteps.CommitmentSent,
        commitment: { tx: tx, completed: false, time: 0 },
      });

      setBtnState({ waitingTx: true, waitingWallet: false });
    } catch (err: any) {
      console.error(err);
      if (
        err instanceof ContractFunctionExecutionError &&
        !isUserDeniedError(err)
      ) {
        setError(err);
      } else if (!isUserDeniedError(err)) {
        const genericError = new Error(
          err?.shortMessage || err?.message || "Transaction failed"
        );
        setError(genericError as ContractFunctionExecutionError);
      }
    } finally {
      setBtnState({ waitingTx: false, waitingWallet: false });
    }

    if (!tx) {
      return;
    }

    try {
      // Wait for transaction with retry
      await waitTx({ hash: tx });

      setCommitTxStatus({ sent: true, completed: true, hash: tx });

      setTimeout(() => {
        onStateUpdated({
          ...state,
          step: ProcessSteps.TimerStarted,
          commitment: { tx: tx, completed: true, time: new Date().getTime() },
        });
        setCommitTxStatus({ sent: false, completed: false, hash: "" });
      }, 1000);
    } catch (err) {
      console.error(err);
      setCommitTxStatus({ sent: false, completed: false, hash: "" });
    }
  };

  const btnDisabled = btnState.waitingTx || btnState.waitingWallet;
  const btnLabel = btnState.waitingWallet ? "Waiting Wallet..." : "Open Wallet";

  const getProgressStatusBadge = () => {
    if (isCurrentStep) {
      return (
        <div className="ns-process-badge me-2">
          <Text color="white" weight="bold" size="sm">
            1
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
            1
          </Text>
        </div>
      );
    }
  };

  return (
    <Accordion
      isOpen={isCurrentStep}
      togglable={isPending}
      disabled={isCompleted}
      title={
        <div className="d-flex align-items-center">
          {getProgressStatusBadge()}
          <Text size="sm" weight="medium">
            Commitment
          </Text>
        </div>
      }
      defaultOpen={true}
    >
      {!commitTxStatus.sent && (
        <>
          <div className="ns-text-center">
            <Text weight="medium" className="mb-2">
              Start Your Journey
            </Text>
            <Text size="xs" color="grey">
              Kickstart your registration by completing a transaction. This
              action sets your timer and officially begins the process. Simply
              create the transaction in your wallet to move forward.
            </Text>
            {!isCompleted && (
              <Button
                disabled={btnDisabled}
                onClick={() => handleCommitment()}
                className="mt-3 ns-wd-100"
              >
                {btnLabel}
              </Button>
            )}
            <ContractErrorLabel error={error} />
          </div>
        </>
      )}
      {commitTxStatus.sent && (
        <TransactionPendingScreen
          isTestnet={isTestnet}
          message="Your transaction has been sent! Once the progress bar completes, first registration step is completed."
          hash={commitTxStatus.hash as Hash}
          isCompleted={commitTxStatus.completed}
        />
      )}
    </Accordion>
  );
};
