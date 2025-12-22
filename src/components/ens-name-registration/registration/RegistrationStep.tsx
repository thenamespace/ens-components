import React, { useMemo, useState } from "react";
import { Button, Text, Icon } from "../../atoms";
import { ProcessSteps, RegistrationState } from "./types";
import { useRegisterENS, useWaitTransaction } from "@/hooks";
import { ContractFunctionExecutionError, Hash, formatEther } from "viem";
import {
  ContractErrorLabel,
  Accordion,
  isUserDeniedError,
} from "../../molecules";
import { useAccount } from "wagmi";
import { TransactionPendingScreen } from "./TransactionPendingScreen";

interface RegistrationSuccessData {
  expiryInYears: number;
  registrationCost: string; // ETH as string
  transactionFees: string; // ETH as string
  total: string; // ETH as string
  expiryDate: string;
}

interface RegistrationStepProps {
  state: RegistrationState;
  isTestnet: boolean;
  onStateUpdated: (state: RegistrationState) => void;
  onSuccess?: (data: RegistrationSuccessData) => void;
}

export const RegistrationStep: React.FC<RegistrationStepProps> = ({
  state,
  isTestnet,
  onStateUpdated,
  onSuccess,
}) => {
  const [btnState, setBtnState] = useState<{
    waitingWallet: boolean;
    waitingTx: boolean;
  }>({
    waitingTx: false,
    waitingWallet: false,
  });
  const { address } = useAccount();
  const { waitTx } = useWaitTransaction({ isTestnet });
  const [error, setError] = useState<ContractFunctionExecutionError | null>(
    null
  );
  const [commitTxStatus, setCommitTxStatus] = useState<{
    sent: boolean;
    completed: boolean;
    hash: string;
  }>({
    sent: false,
    completed: false,
    hash: "",
  });

  const { sendRegisterTx, getRegistrationPrice } = useRegisterENS({ isTestnet });

  const handleRegistration = async () => {
    setError(null);
    let tx: Hash | null = null;

    try {
      setBtnState({ ...btnState, waitingWallet: true });

      console.log("Sending tx with records", state.records);

      tx = await sendRegisterTx({
        label: state.label,
        owner: address!,
        expiryInYears: state.expiryInYears,
        secret: state.secret,
        records: state.records,
      });
      setCommitTxStatus({ sent: true, completed: false, hash: tx });

      onStateUpdated({
        ...state,
        step: ProcessSteps.RegistrationSent,
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
      const receipt = await waitTx({ hash: tx });

      setCommitTxStatus({ sent: true, completed: true, hash: tx });

      // Get registration price (transaction value)
      const registrationPrice = await getRegistrationPrice(
        state.label,
        state.expiryInYears
      );

      // Calculate gas fees (gasUsed * gasPrice)
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice || BigInt(0);
      const transactionFees = gasUsed * gasPrice;
      const transactionFeesEth = formatEther(transactionFees);

      // Calculate total cost
      const totalCost = (registrationPrice.eth + parseFloat(transactionFeesEth)).toString();

      // Calculate expiry date (current date + expiryInYears)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + state.expiryInYears);
      const formattedExpiryDate = expiryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Print registration completion details
      console.log("=== Registration Completed ===");
      console.log("1. Expiration Years:", state.expiryInYears);
      console.log("2. Transaction Value:", registrationPrice.eth, "ETH");
      console.log("3. Transaction Fees:", transactionFeesEth, "ETH");
      console.log("==============================");

      setTimeout(() => {
        onStateUpdated({
          ...state,
          step: ProcessSteps.RegistrationCompleted,
          commitment: { tx: tx, completed: true, time: new Date().getTime() },
        });
        setCommitTxStatus({ sent: false, completed: false, hash: "" });
        onSuccess?.({
          expiryInYears: state.expiryInYears,
          registrationCost: registrationPrice.eth.toString(),
          transactionFees: transactionFeesEth,
          total: totalCost,
          expiryDate: formattedExpiryDate,
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setCommitTxStatus({ sent: false, completed: false, hash: "" });
    }
  };

  const { isCurrentStep, isDisabled, isPending, isCompleted } = useMemo(() => {
    const isPending = state.step < ProcessSteps.TimerCompleted;
    const isCurrentStep = state.step >= ProcessSteps.TimerCompleted && state.step < ProcessSteps.RegistrationCompleted;
    const isCompleted = state.step >= ProcessSteps.RegistrationCompleted;
    const isDisabled = state.step < ProcessSteps.TimerCompleted;
    return {
      isCurrentStep,
      isDisabled,
      isPending,
      isCompleted
    };
  }, [state]);

  const getProgressStatusBadge = () => {
    if (isCurrentStep) {
      return (
        <div className="ns-process-badge me-2">
          <Text color="white" weight="bold" size="sm">
            3
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
            3
          </Text>
        </div>
      );
    }
  };

  const btnDisabled = btnState.waitingTx || btnState.waitingWallet;
  const btnLabel = btnState.waitingWallet ? "Waiting Wallet..." : "Open Wallet";

  return (
    <Accordion
      togglable={isCurrentStep}
      disabled={isDisabled}
      isOpen={isCurrentStep}
      title={
        <div className="d-flex align-items-center">
          {getProgressStatusBadge()}
          <Text size="sm" weight="medium">
            Complete Registration
          </Text>
        </div>
      }
    >
      {!commitTxStatus.sent && (
        <div className="ns-text-center">
          <Text weight="medium" className="mb-2">
            Register Name
          </Text>
          <Text size="xs" color="grey">
            Your name is not registered until you've completed the second
            transaction. You have 23 hours remaining to complete it.
          </Text>
          <Button
            disabled={btnDisabled}
            onClick={() => handleRegistration()}
            className="mt-3 ns-wd-100"
          >
            {btnLabel}
          </Button>
          <ContractErrorLabel error={error} />
        </div>
      )}
      {commitTxStatus.sent && (
        <TransactionPendingScreen
          isTestnet={isTestnet}
          message="Your transaction has been sent! Once the progress bar completes, your registration will be confirmed."
          hash={commitTxStatus.hash as Hash}
          isCompleted={commitTxStatus.completed}
        />
      )}
    </Accordion>
  );
};
