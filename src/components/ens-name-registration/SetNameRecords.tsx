import React, { useMemo, useState } from "react";
import { EnsRecords } from "@/types";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Button } from "../atoms";
import { Alert } from "../molecules";
import { validateEnsRecords } from "@/utils";

export interface SetNameRecordsProps {
  records: EnsRecords;
  onRecordsChange: (records: EnsRecords) => void;
  onCancel: () => void;
  onSave: () => void;
  hasChanges?: boolean
}

export const SetNameRecords: React.FC<SetNameRecordsProps> = ({
  records,
  onRecordsChange,
  onCancel,
  onSave,
  hasChanges
}) => {

  const [error, setError] = useState<string | null>()

  const handleSave = () => {
    setError(null);
    const validation = validateEnsRecords(records);

    if (validation.validationFailed) {
      setError(validation.errors?.length > 0 ? validation.errors[0].reason : "Something went wrong")
      return;
    }

    onSave();
  }

  return (
    <SelectRecordsForm
      records={records}
      onRecordsUpdated={onRecordsChange}
      actionButtons={
        <div style={{ padding: 15, paddingTop: 0 }}>
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}
          <div className="d-flex" style={{ gap: "8px", width: "100%" }}>
            <Button
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onClick={() => {
                setError(null)
                onCancel?.()
              }}
            >
              Cancel
            </Button>
            <Button disabled={!hasChanges} size="lg" style={{ flex: 1 }} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      }
    />
  );
};

