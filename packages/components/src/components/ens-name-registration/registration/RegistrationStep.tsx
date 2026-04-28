import React, { useMemo, useState } from "react";
import { Button, Text, Icon } from "../../atoms";
import { ProcessSteps, RegistrationState } from "./types";
import {
  RegistrationRequest,
  useRegisterENS,
  useWaitTransaction,
} from "@/hooks";
import { ContractFunctionExecutionError, Hash, formatEther } from "viem";
import {
  ContractErrorLabel,
  Accordion,
  isUserDeniedError,
} from "../../molecules";
import { useAccount } from "wagmi";
import { TransactionPendingScreen } from "./TransactionPendingScreen";
import { formatFloat } from "@/utils";
import { formatDurationSummary } from "@/utils/date";
import { EnsRecords } from "@/types";

export interface RegistrationSuccessData {
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
  thHash: string;
  name: string;
  records: EnsRecords;
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
  const [btnState, setBtnState] = useState({ waitingWallet: false, waitingTx: false });
  const { address } = useAccount();
  const { waitTx } = useWaitTransaction({ isTestnet });
  const [error, setError] = useState<ContractFunctionExecutionError | null>(null);
  const [commitTxStatus, setCommitTxStatus] = useState({ sent: false, completed: false, hash: "" });

  const { sendRegisterTx } = useRegisterENS({ isTestnet });

  const handleRegistration = async () => {
    setError(null);
    let tx: Hash | null = null;
    let registrationPrice = 0;

    try {
      setBtnState({ waitingWallet: true, waitingTx: false });

      const request: RegistrationRequest = {
        label: state.label,
        owner: address!,
        durationInSeconds: state.durationInSeconds,
        secret: state.secret,
        records: state.records,
        referrer: state.referrer,
      };

      const regData = await sendRegisterTx(request);
      tx = regData.txHash;
      registrationPrice = formatFloat(regData.price.eth, 5);
      setCommitTxStatus({ sent: true, completed: false, hash: tx });

      onStateUpdated({
        ...state,
        step: ProcessSteps.RegistrationSent,
        commitment: { tx, completed: false, time: 0 },
      });

      setBtnState({ waitingTx: true, waitingWallet: false });
    } catch (err: any) {
      console.error(err);
      if (err instanceof ContractFunctionExecutionError && !isUserDeniedError(err)) {
        setError(err);
      } else if (!isUserDeniedError(err)) {
        setError(
          new Error(err?.shortMessage || err?.message || "Transaction failed") as ContractFunctionExecutionError
        );
      }
    } finally {
      setBtnState({ waitingTx: false, waitingWallet: false });
    }

    if (!tx) return;

    try {
      const receipt = await waitTx({ hash: tx });

      setCommitTxStatus({ sent: true, completed: true, hash: tx });

      const registerFeeWei = receipt.gasUsed * (receipt.effectiveGasPrice || 0n);
      const commitFeeWei = state.commitment?.feeWei ?? 0n;
      const totalFeeWei = registerFeeWei + commitFeeWei;
      const transactionFeesEth = formatEther(totalFeeWei);
      const totalCost = (registrationPrice + parseFloat(transactionFeesEth)).toString();

      const expiryDate = new Date(Date.now() + state.durationInSeconds * 1000);
      const formattedExpiryDate = expiryDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setTimeout(() => {
        onStateUpdated({
          ...state,
          step: ProcessSteps.RegistrationCompleted,
          commitment: { tx, completed: true, time: Date.now() },
        });
        setCommitTxStatus({ sent: false, completed: false, hash: "" });
        onSuccess?.({
          durationLabel: formatDurationSummary(state.durationInSeconds),
          registrationCost: registrationPrice.toString(),
          transactionFees: transactionFeesEth,
          total: totalCost,
          expiryDate: formattedExpiryDate,
          thHash: tx!,
          name: `${state.label}.eth`,
          records: state.records,
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      setCommitTxStatus({ sent: false, completed: false, hash: "" });
    }
  };

  const { isCurrentStep, isDisabled, isCompleted } = useMemo(() => {
    const isCurrentStep =
      state.step >= ProcessSteps.TimerCompleted &&
      state.step < ProcessSteps.RegistrationCompleted;
    const isCompleted = state.step >= ProcessSteps.RegistrationCompleted;
    const isDisabled = state.step < ProcessSteps.TimerCompleted;
    return { isCurrentStep, isDisabled, isCompleted };
  }, [state]);

  const getProgressStatusBadge = () => {
    if (isCurrentStep) {
      return (
        <div className="ns-process-badge me-2">
          <Text color="white" weight="bold" size="sm">3</Text>
        </div>
      );
    } else if (isCompleted) {
      return (
        <div className="ns-process-badge ns-process-badge--inactive ns-process-badge--completed me-2">
          <Icon name="check" size={16} color="black" />
        </div>
      );
    }
    return (
      <div className="ns-process-badge ns-process-badge--inactive me-2">
        <Text color="primary" weight="bold" size="sm">3</Text>
      </div>
    );
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
          <Text size="sm" weight="medium">Complete Registration</Text>
        </div>
      }
    >
      {!commitTxStatus.sent && (
        <div className="ns-text-center">
          <Text weight="medium" className="mb-2">Register Name</Text>
          <Text size="xs" color="grey">
            Your name is not registered until you've completed the second transaction. You have 23
            hours remaining to complete it.
          </Text>
          <Button disabled={btnDisabled} onClick={handleRegistration} className="mt-3 ns-wd-100">
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
