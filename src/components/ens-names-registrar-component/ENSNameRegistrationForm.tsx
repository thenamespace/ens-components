import React, { useEffect, useState } from "react";
import "./ENSNamesRegistrarComponent.css";
import { RegistrationSummary } from "./RegistrationSummary";
import { SetNameRecords } from "./SetNameRecords";
import { EnsRecords } from "@/types";
import { deepCopy } from "@/utils";
import { useAccount } from "wagmi";
import { ProgressBar } from "./sub-components/ProgressBar";

export interface EnsNameRegistrationFormProps {
  name?: string;
  isTestnet?: boolean;
}

enum RegistrationSteps {
  Summary = 0,
}

export const EnsNameRegistrationForm = (
  props: EnsNameRegistrationFormProps
) => {
  const [label, setLabel] = useState<string>(props.name || "");
  const [years, setYears] = useState(1);
  const [price, setPrice] = useState<{
    isChecking: boolean;
    wei: bigint;
    eth: number;
  }>({
    isChecking: false,
    wei: 0n,
    eth: 0,
  });
  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  }>({
    isChecking: false,
    isTaken: false,
  });
  const [showProfile, setShowProfile] = useState(false);
  const { address } = useAccount();

  const [ensRecordTemplate, setEnsRecordsTemplate] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const [ensRecords, setEnsRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const handleSaveRecords = () => {
    setEnsRecords(deepCopy(ensRecordTemplate));
    setShowProfile(false);
  };

  const handleCancelRecords = () => {
    setEnsRecordsTemplate(deepCopy(ensRecords));
    setShowProfile(false);
  };

  return (
    <div className="ens-registration-form-container">
      {showProfile && (
        <SetNameRecords
          records={ensRecords}
          onRecordsChange={setEnsRecords}
          onCancel={handleCancelRecords}
          onSave={handleSaveRecords}
        />
      )}
      {!showProfile && (
        <RegistrationSummary
          label={label}
          years={years}
          price={price}
          nameValidation={nameValidation}
          isTestnet={props.isTestnet}
          onLabelChange={setLabel}
          onYearsChange={setYears}
          onPriceChange={setPrice}
          onNameValidationChange={setNameValidation}
          onSetProfile={() => setShowProfile(true)}
        />
      )}
    </div>
  );
};
