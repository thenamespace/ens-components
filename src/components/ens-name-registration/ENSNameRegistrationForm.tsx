import { useMemo, useState } from "react";
import "./ENSNamesRegistrarComponent.css";
import { RegistrationSummary } from "./RegistrationSummary";
import { SetNameRecords } from "./SetNameRecords";
import { EnsRecords } from "@/types";
import { deepCopy, getEnsRecordsDiff } from "@/utils";
import { useAccount } from "wagmi";
import { RegistrationProcess } from "./RegistrationProcess";
import { SuccessScreen } from "./registration";
import { Address } from "viem";

export interface EnsNameRegistrationFormProps {
  name?: string;
  isTestnet?: boolean;
  referrer?: Address;
  noBorder?: boolean;
  className?: string;
  onRegistrationSuccess?: (result: RegistrationSuccessData) => void
  onClose?: (isSuccess: boolean) => void
  onRegistrationStart?: (name: string) => void
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

const getLabel = (name?: string) => {

  if (!name) {
    return "";
  }

  if (name.split(".").length !== 1) {
    return name.split(".")[0]
  }
  return name;
}

export const EnsNameRegistrationForm = (
  props: EnsNameRegistrationFormProps
) => {
  const [label, setLabel] = useState<string>(getLabel(props.name));
  const [step, setStep] = useState<RegistrationSteps>(
    RegistrationSteps.Summary
  );
  const [years, setYears] = useState(1);
  // TODO: Implement gas prices, Currently its hardcoded!
  const [regTxFees, setRegTxFees] = useState<{
    isChecking: boolean
    estimatedGas: number
    price: { wei: bigint, eth: number }
  }>({
    estimatedGas: 0,
    isChecking: false,
    price: {
      wei: 0n,
      eth: 0.0001
    }
  })
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

  const hasRecordsDifference = useMemo(() => {
    return getEnsRecordsDiff(ensRecords, ensRecordTemplate).isDifferent;
  }, [ensRecords, ensRecordTemplate]);

  const [successData, setSuccessData] =
    useState<RegistrationSuccessData | null>(null);

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
    setYears(1);
    setEnsRecords({ addresses: [], texts: [] });
    setEnsRecordsTemplate({ addresses: [], texts: [] });
    setNameValidation({ isChecking: false, isTaken: false });
    setPrice({ isChecking: false, wei: 0n, eth: 0 });
  };



  return (
    <div
      className={`ens-registration-form-container ${props.className || ""} ${props.noBorder ? "no-border" : ""}`}
    >
      {step === RegistrationSteps.Summary && (
        <>
          {showProfile && (
            <SetNameRecords
              records={ensRecordTemplate}
              onRecordsChange={setEnsRecordsTemplate}
              onCancel={handleCancelRecords}
              onSave={handleSaveRecords}
              hasChanges={hasRecordsDifference}
            />
          )}
          {!showProfile && (
            <RegistrationSummary
              label={label}
              years={years}
              price={price}
              nameValidation={nameValidation}
              isTestnet={props.isTestnet || false}
              transactionFees={regTxFees}
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
          onStart={props.onRegistrationStart}
          onSuccess={(data: RegistrationSuccessData) => {
            setSuccessData(data);
            props.onRegistrationSuccess?.(data);
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
          onGreat={() => props.onClose?.(true)}
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
