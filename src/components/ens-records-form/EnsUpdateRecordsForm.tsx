import { EnsRecords, TxProgress } from "@/types";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Address, ContractFunctionExecutionError, Hash, zeroHash } from "viem";
import { useMemo, useState } from "react";
import {
  deepCopy,
  EnsRecordsDiff,
  getEnsRecordsDiff,
  validateEnsRecords,
} from "@/utils";
import { Button } from "../atoms";
import { Alert, isUserDeniedError } from "../molecules";
import "./EnsUpdateRecordsForm.css";
import RecordUpdateSummary from "./RecordUpdateSummary";
import { RecordUpdateProgress } from "./RecordUpdateProgress";
import { useENSResolver, useWaitTransaction } from "@/hooks";

interface EnsUpdateRecordsForm {
  resolverChainId: number;
  // Optional, if not provided
  // the form will query ens registry
  resolverAddress: Address;
  isTestnet?: boolean;
  // Full ens name
  name: string;
  existingRecords: EnsRecords;
  onCancel?: () => void;
  onRecordsUpdated?: (diff: EnsRecordsDiff) => void;
  onGreat?: () => void;
  onTransactionSent?: (hash: Hash) => void;
  txConfirmations?: number
}

enum UpdateSteps {
  SetRecords,
  Summary,
  UpdateTxSent,
}

export const EnsUpdateRecordsForm = ({
  name,
  existingRecords,
  resolverChainId,
  resolverAddress,
  isTestnet,
  onGreat,
  onRecordsUpdated,
  onCancel,
  onTransactionSent,
  txConfirmations
}: EnsUpdateRecordsForm) => {
  const [recordsTemplate, setRecordsTemplate] = useState<EnsRecords>(
    deepCopy(existingRecords)
  );
  const { setUpdateRecordsTx } = useENSResolver({ resolverChainId, isTestnet });
  const { waitTx } = useWaitTransaction({
    isTestnet,
    chainId: resolverChainId,
  });
  const [step, setStep] = useState<UpdateSteps>(UpdateSteps.SetRecords);
  const [updateTx, setUpdateTx] = useState<{
    hash: Hash;
    status: TxProgress;
  }>({
    hash: "0x0",
    status: TxProgress.Pending,
  });

  const [error, setError] = useState<ContractFunctionExecutionError | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState<{
    waitingWallet: boolean;
    waitingTx: boolean;
  }>({
    waitingWallet: false,
    waitingTx: false,
  });

  const hasDifference = useMemo(() => {
    const diff = getEnsRecordsDiff(existingRecords, recordsTemplate);
    return diff.isDifferent;
  }, [existingRecords, recordsTemplate]);

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleNext = () => {
    setValidationError(null);
    const validationErrs = validateEnsRecords(recordsTemplate);

    if (validationErrs.validationFailed) {
      const errorMsg = validationErrs.errors[0]
        ? validationErrs.errors[0].reason
        : "Invalid record set";
      setValidationError(errorMsg);
      return;
    }

    // If validation passes, proceed to next step
    setStep(UpdateSteps.Summary);
  };

  const handleRecordUpdate = async () => {
    setError(null);
    let tx: Hash = zeroHash;
    const diff = getEnsRecordsDiff(existingRecords, recordsTemplate);

    if (!diff.isDifferent) {
      return;
    }

    try {
      setIsUpdating({ waitingWallet: true, waitingTx: false });
      tx = await setUpdateRecordsTx({
        name,
        resolver: resolverAddress,
        diff: diff,
      });
      setUpdateTx({ hash: tx, status: TxProgress.Pending });
      setIsUpdating({ waitingWallet: false, waitingTx: true });
      setStep(UpdateSteps.UpdateTxSent);
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
      setIsUpdating({ waitingWallet: false, waitingTx: false });
    }

    if (!tx) {
      return;
    }

    try {
      onTransactionSent?.(tx);
      await waitTx({ hash: tx, txConfirmations: txConfirmations || 1 });
      setUpdateTx({ hash: tx, status: TxProgress.Success });
      setIsUpdating({ waitingWallet: false, waitingTx: false });
      onRecordsUpdated?.(diff);
    } catch (err) {
      console.error("failed transaction", err);
      setUpdateTx({ hash: tx, status: TxProgress.Failed });
      setIsUpdating({ waitingWallet: false, waitingTx: false });
    }
  };

  return (
    <div>
      {step === UpdateSteps.SetRecords && (
        <SelectRecordsForm
          records={recordsTemplate}
          onRecordsUpdated={records => setRecordsTemplate(records)}
          actionButtons={
            <div style={{ padding: 10, paddingTop: 0 }}>
              {validationError && (
                <div style={{marginTop: -12}}>
                  <Alert variant="error">{validationError}</Alert>
                </div>
              )}
              <div className="ens-update-records-form-actions">
                <Button
                  onClick={() => onCancel?.()}
                  variant="outline"
                  size="lg"
                >
                  Cancel
                </Button>
                <Button
                  disabled={!hasDifference}
                  size="lg"
                  onClick={handleNext}
                >
                  Next
                </Button>
              </div>
            </div>
          }
        ></SelectRecordsForm>
      )}
      {step === UpdateSteps.Summary && (
        <RecordUpdateSummary
          oldRecords={existingRecords}
          newRecords={recordsTemplate}
          isUpdating={isUpdating}
          error={error}
          onCancel={() => {
            setStep(UpdateSteps.SetRecords);
          }}
          onConfirm={() => {
            handleRecordUpdate();
          }}
        />
      )}
      {step === UpdateSteps.UpdateTxSent && (
        <RecordUpdateProgress
          isTestnet={isTestnet}
          chainId={resolverChainId as any}
          tx={updateTx.hash}
          status={updateTx.status}
          ensName={name}
          onClose={onGreat}
          onRetry={handleRecordUpdate}
        />
      )}
    </div>
  );
};
