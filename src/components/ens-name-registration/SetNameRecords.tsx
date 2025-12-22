import React from "react";
import { EnsRecords } from "@/types";
import { SelectRecordsForm } from "../select-records-form/SelectRecordsForm";
import { Button } from "../atoms";

export interface SetNameRecordsProps {
  records: EnsRecords;
  onRecordsChange: (records: EnsRecords) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const SetNameRecords: React.FC<SetNameRecordsProps> = ({
  records,
  onRecordsChange,
  onCancel,
  onSave,
}) => {
  return (
    <SelectRecordsForm
      records={records}
      onRecordsUpdated={onRecordsChange}
      actionButtons={
        <div style={{ padding: 15, paddingTop: 0 }}>
          <div className="d-flex" style={{ gap: "8px", width: "100%" }}>
            <Button
              variant="outline"
              size="lg"
              style={{ flex: 1 }}
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button size="lg" style={{ flex: 1 }} onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      }
    />
  );
};

