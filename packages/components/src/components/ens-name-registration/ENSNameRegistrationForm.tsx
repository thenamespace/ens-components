import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./ENSNamesRegistrarComponent.css";
import { RegistrationSummary } from "./RegistrationSummary";
import { SetNameRecords } from "./SetNameRecords";
import { EnsRecords } from "@/types";
import { debounce, deepCopy, getEnsRecordsDiff } from "@/utils";
import { secondsFromYears } from "@/utils/date";
import { RegistrationProcess } from "./RegistrationProcess";
import { SuccessScreen } from "./registration";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { useRegisterENS } from "@/hooks";

const REG_SECRET_PLACEHOLDER = "0x0000000000000000000000000000000000000000000000000000000000000001";

export interface EnsNameRegistrationFormProps {
  name?: string;
  isTestnet?: boolean;
  referrer?: Address;
  noBorder?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  bannerImage?: string;
  hideBanner?: boolean;
  bannerWidth?: number;
  avatarUploadDomain?: string;
  onRegistrationSuccess?: (result: RegistrationSuccessData) => void;
  onClose?: (isSuccess: boolean) => void;
  onRegistrationStart?: (name: string) => void;
  onConnectWallet?: () => void;
}

enum RegistrationSteps {
  Summary = 0,
  Progress = 1,
  Success = 2,
}

interface RegistrationSuccessData {
  durationLabel: string;
  registrationCost: string;
  transactionFees: string;
  total: string;
  expiryDate: string;
}

const getLabel = (name?: string) => {
  if (!name) return "";
  if (name.split(".").length !== 1) return name.split(".")[0];
  return name;
};

export const EnsNameRegistrationForm = (props: EnsNameRegistrationFormProps) => {
  const { address: connectedAddress } = useAccount();
  const { estimateRegistrationFees } = useRegisterENS({ isTestnet: props.isTestnet });

  const [label, setLabel] = useState<string>(getLabel(props.name));
  const [step, setStep] = useState<RegistrationSteps>(RegistrationSteps.Summary);
  const [durationSeconds, setDurationSeconds] = useState(() => secondsFromYears(new Date(), 1));
  const [regTxFees, setRegTxFees] = useState<{
    isChecking: boolean;
    failed?: boolean;
    estimatedGas: number;
    price: { wei: bigint; eth: number };
  }>({
    estimatedGas: 0,
    isChecking: false,
    failed: false,
    price: { wei: 0n, eth: 0 },
  });
  const [price, setPrice] = useState<{
    isChecking: boolean;
    wei: bigint;
    eth: number;
  }>({ isChecking: false, wei: 0n, eth: 0 });
  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  }>({ isChecking: false, isTaken: false });
  const [showProfile, setShowProfile] = useState(false);
  const [ensRecordTemplate, setEnsRecordsTemplate] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const [ensRecords, setEnsRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const hasRecordsDifference = useMemo(
    () => getEnsRecordsDiff(ensRecords, ensRecordTemplate).isDifferent,
    [ensRecords, ensRecordTemplate]
  );

  const [successData, setSuccessData] = useState<RegistrationSuccessData | null>();

  const feeRequestRef = useRef(0);

  const runFeeEstimate = useCallback(
    async (
      requestId: number,
      params: {
        label: string;
        owner: Address;
        durationInSeconds: number;
        records: EnsRecords;
      }
    ) => {
      try {
        const result = await estimateRegistrationFees({
          label: params.label,
          owner: params.owner,
          durationInSeconds: params.durationInSeconds,
          secret: REG_SECRET_PLACEHOLDER,
          records: params.records,
          referrer: props.referrer,
        });
        if (feeRequestRef.current !== requestId) return;
        setRegTxFees({
          isChecking: false,
          failed: false,
          estimatedGas: Number(result.gasEstimate),
          price: { wei: result.wei, eth: result.eth },
        });
      } catch {
        if (feeRequestRef.current !== requestId) return;
        setRegTxFees({
          isChecking: false,
          failed: true,
          estimatedGas: 0,
          price: { wei: 0n, eth: 0 },
        });
      }
    },
    [estimateRegistrationFees, props.referrer]
  );

  const debouncedEstimate = useMemo(
    () =>
      debounce(
        (
          requestId: number,
          params: {
            label: string;
            owner: Address;
            durationInSeconds: number;
            records: EnsRecords;
          }
        ) => {
          void runFeeEstimate(requestId, params);
        },
        500
      ),
    [runFeeEstimate]
  );

  useEffect(() => {
    if (
      !connectedAddress ||
      !label ||
      label.length < 3 ||
      nameValidation.isChecking ||
      nameValidation.isTaken ||
      price.isChecking ||
      price.eth <= 0
    ) {
      return;
    }

    const requestId = feeRequestRef.current + 1;
    feeRequestRef.current = requestId;
    setRegTxFees((prev) => ({ ...prev, isChecking: true, failed: false }));
    debouncedEstimate(requestId, {
      label,
      owner: connectedAddress,
      durationInSeconds: durationSeconds,
      records: ensRecords,
    });
  }, [
    connectedAddress,
    label,
    durationSeconds,
    ensRecords,
    nameValidation.isChecking,
    nameValidation.isTaken,
    price.isChecking,
    price.eth,
    debouncedEstimate,
  ]);

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
    setDurationSeconds(secondsFromYears(new Date(), 1));
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
              avatarUpload={
                label
                  ? {
                      ensName: `${label}.eth`,
                      isTestnet: props.isTestnet,
                      siweDomain: props.avatarUploadDomain,
                    }
                  : undefined
              }
            />
          )}
          {!showProfile && (
            <RegistrationSummary
              label={label}
              durationSeconds={durationSeconds}
              price={price}
              nameValidation={nameValidation}
              isTestnet={props.isTestnet || false}
              transactionFees={regTxFees}
              title={props.title}
              subtitle={props.subtitle}
              bannerImage={props.bannerImage}
              hideBanner={props.hideBanner}
              bannerWidth={props.bannerWidth}
              onLabelChange={setLabel}
              onDurationChange={setDurationSeconds}
              onPriceChange={setPrice}
              onNameValidationChange={setNameValidation}
              onSetProfile={() => setShowProfile(true)}
              onStart={() => setStep(RegistrationSteps.Progress)}
              onConnectWallet={props.onConnectWallet}
            />
          )}
        </>
      )}
      {step === RegistrationSteps.Progress && (
        <RegistrationProcess
          isTestnet={props.isTestnet || false}
          label={label}
          durationInSeconds={durationSeconds}
          records={ensRecords}
          referrer={props.referrer}
          onBack={(clearState?: boolean) => {
            if (clearState) clearInputState();
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
          durationLabel={successData.durationLabel}
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
