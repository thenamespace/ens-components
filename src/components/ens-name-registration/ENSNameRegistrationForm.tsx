import { useState } from "react";
import "./ENSNamesRegistrarComponent.css";
import { RegistrationSummary } from "./RegistrationSummary";
import { SetNameRecords } from "./SetNameRecords";
import { EnsRecords } from "@/types";
import { deepCopy } from "@/utils";
import { useAccount } from "wagmi";
import { RegistrationProcess } from "./RegistrationProcess";
import { ProcessSteps, SuccessScreen } from "./registration";

export interface EnsNameRegistrationFormProps {
  name?: string;
  isTestnet?: boolean;
}

enum RegistrationSteps {
  Summary = 0,
  Progress = 1,
  Success = 2,
}

interface RegistrationSuccessData {
  expiryInYears: number;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
}

export const EnsNameRegistrationForm = (
  props: EnsNameRegistrationFormProps
) => {
  const [label, setLabel] = useState<string>(props.name || "");
  const [step, setStep] = useState<RegistrationSteps>(
    RegistrationSteps.Progress
  );
  const [progressStep, setProgressStep] = useState<ProcessSteps>(
    ProcessSteps.Start
  );
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

  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>(null);

  const handleSaveRecords = () => {
    setEnsRecords(deepCopy(ensRecordTemplate));
    setShowProfile(false);
  };

  const handleCancelRecords = () => {
    setEnsRecordsTemplate(deepCopy(ensRecords));
    setShowProfile(false);
  };

  const clearInputState = () => {
    setLabel("");
    setYears(0);
    setEnsRecords({ addresses: [], texts: []})
    setEnsRecordsTemplate({addresses: [], texts: []})
    setNameValidation({ isChecking: false, isTaken: false})
    setPrice({ isChecking: false, wei: 0n, eth: 0})
  }

  return (
    <div className="ens-registration-form-container">
      {step === RegistrationSteps.Summary && (
        <>
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
              isTestnet={props.isTestnet || false}
              onLabelChange={setLabel}
              onYearsChange={setYears}
              onPriceChange={setPrice}
              onNameValidationChange={setNameValidation}
              onSetProfile={() => setShowProfile(true)}
              onStart={() => setStep(RegistrationSteps.Progress)}
            />
          )}
        </>
      )}
      {step === RegistrationSteps.Progress && (
        <RegistrationProcess
          isTestnet={props.isTestnet || false}
          label={label}
          expiryInYears={years}
          records={ensRecords}
          onBack={(clearState?: boolean) => {
            if (clearState) {
              clearInputState();
            }
            setStep(RegistrationSteps.Summary);
          }}
          onSuccess={(data: RegistrationSuccessData) => {
            setSuccessData(data);
            setStep(RegistrationSteps.Success);
          }}
        />
      )}
      {step === RegistrationSteps.Success && successData && (
        <SuccessScreen
          ensName={label}
          expiryInYears={successData.expiryInYears}
          registrationCost={successData.registrationCost}
          transactionFees={successData.transactionFees}
          total={successData.total}
          expiryDate={successData.expiryDate}
          isTestnet={props.isTestnet || false}
          onRegisterAnother={() => {
            clearInputState();
            setSuccessData(null);
            setStep(RegistrationSteps.Summary);
          }}
        />
      )}
    </div>
  );
};
