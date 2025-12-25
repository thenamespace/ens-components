import { EnsRecords } from "@/types";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Address } from "viem";
import { useMemo, useState } from "react";
import { deepCopy, getEnsRecordsDiff, validateEnsRecords } from "@/utils";
import { Button } from "../atoms";
import { Alert } from "../molecules";
import "./EnsUpdateRecordsForm.css";
import RecordUpdateSummary from "./RecordUpdateSummary";

interface EnsUpdateRecordsForm {
  resolverChainId?: number;
  // Optional, if not provided
  // the form will query ens registry
  resolverAddress?: Address;
  isTestnet?: boolean;
  // Full ens name
  name: string;
  existingRecords: EnsRecords;
  onRecordsUpdated: (records: EnsRecords) => void;
}

enum UpdateSteps {
  SetRecords,
  Summary,
  UpdateTxSent,
}

export const EnsUpdateRecordsForm = ({
  name,
  existingRecords,
}: EnsUpdateRecordsForm) => {
  const [recordsTemplate, setRecordsTemplate] = useState<EnsRecords>(
    deepCopy(existingRecords)
  );
  const [step, setStep] = useState<UpdateSteps>(UpdateSteps.SetRecords);

  const [error, setError] = useState<string | null>(null);

  const hasDifference = useMemo(() => {
    const diff = getEnsRecordsDiff(existingRecords, recordsTemplate);
    return diff.isDifferent;
  }, [existingRecords, recordsTemplate]);

  const handleNext = () => {
    setError(null);
    const validationErrs = validateEnsRecords(recordsTemplate);

    if (validationErrs.validationFailed) {
      const errorMsg = validationErrs.errors[0]
        ? validationErrs.errors[0].reason
        : "Invalid record set";
      setError(errorMsg);
      return;
    }

    // If validation passes, proceed to next step
    setStep(UpdateSteps.Summary);
  };

  return (
    <div>
      {step === UpdateSteps.SetRecords && (
        <SelectRecordsForm
          records={recordsTemplate}
          onRecordsUpdated={records => setRecordsTemplate(records)}
          actionButtons={
            <div style={{padding: 10, paddingTop: 0}}>
              {error && (
                <div>
                  <Alert variant="error">{error}</Alert>
                </div>
              )}
              <div className="ens-update-records-form-actions">
                <Button variant="outline" size="lg">
                  Cancel
                </Button>
                <Button disabled={!hasDifference} size="lg" onClick={handleNext}>
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
          onCancel={() => {
            setStep(UpdateSteps.SetRecords);
          }}
        />
      )}
    </div>
  );
};
