import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, Button } from "@/components/atoms";
import { Alert } from "@/components/molecules";
import { normalize } from "viem/ens";
import { debounce, deepCopy, getEnsRecordsDiff, validateEnsRecords } from "@/utils";
import { useOffchainManager } from "@/hooks";
import { EnsRecords } from "@/types";
import { SetSubnameRecords } from "../subname-mint-form/SetSubnameRecords";
import { ProfileSelector } from "../subname-mint-form/ProfileSelector";
import { CreateSubnameRequest } from "@thenamespace/offchain-manager";
import { offchainRecordsToEnsRecords } from "./utils";
import { SuccessScreen } from "./SuccessScreen";
import { FormHeader } from "./FormHeader";
import { SubnameInput } from "./SubnameInput";
import { OwnerAddressInput } from "./OwnerAddressInput";
import { useOwnerValidation } from "./useSubnameValidation";
import { useSubnameChecker } from "./useSubnameChecker";
import { buildSubnameRequest } from "./requestBuilder";
import "./OffchainSubnameForm.css";

enum CreateStep {
  Form = "form",
  Creating = "creating",
  Success = "success",
}

export interface OffchainSubnameCreatedData {
  label: string;
  parentName: string;
  fullSubname: string;
  records: EnsRecords;
  ownerAddress?: string;
}

interface OffchainSubnameFormProps {
  apiKeyOrToken: string;
  name: string; 
  label?: string;
  hideTitle?: boolean;
  onCancel?: () => void;
  onSuccess?: (data: OffchainSubnameCreatedData) => void;
}

const MIN_ENS_LEN = 1;

export const OffchainSubnameForm = ({
  apiKeyOrToken,
  name,
  label: propLabel,
  hideTitle = false,
  onCancel,
  onSuccess,
}: OffchainSubnameFormProps) => {
  const client = useOffchainManager(name, apiKeyOrToken);

  const [label, setLabel] = useState<string>(propLabel || "");
  const [showProfile, setShowProfile] = useState(false);
  const [createStep, setCreateStep] = useState<CreateStep>(CreateStep.Form);
  const [successData, setSuccessData] = useState<OffchainSubnameCreatedData | null>(null);

  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [initialOwner, setInitialOwner] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);

  const [ensRecordTemplate, setEnsRecordsTemplate] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const [ensRecords, setEnsRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  // Baseline records from API (never modified by user, only updated when fetching)
  const [baselineRecords, setBaselineRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });

  const hasRecordsDifference = useMemo(() => {
    return getEnsRecordsDiff(ensRecords, ensRecordTemplate).isDifferent;
  }, [ensRecords, ensRecordTemplate]);

  const [availability, setAvailability] = useState<{
    isChecking: boolean;
    isAvailable: boolean;
  }>({
    isChecking: false,
    isAvailable: true,
  });

  // Owner address state
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const { ownerAddressError, validateOwnerAddress, clearError: clearOwnerError } = useOwnerValidation();

  // Creating state
  const [isCreating, setIsCreating] = useState(false);

  // Subname checker hook
  const { isLoadingSubname, error: checkError, setError: setCheckError, checkSubname } = useSubnameChecker(client, name);

  // Check if subname exists and determine create/update mode
  const checkSubnameExists = async (subnameLabel: string) => {
    setAvailability({ isAvailable: false, isChecking: false });
    
    try {
      const result = await checkSubname(subnameLabel);
      
      if (!result.exists) {
        // Subname doesn't exist - CREATE mode (available)
        setIsUpdateMode(false);
        setAvailability({ isAvailable: true, isChecking: false });
        // Clear records and owner when switching to create mode
        setEnsRecords({ addresses: [], texts: [] });
        setEnsRecordsTemplate({ addresses: [], texts: [] });
        setBaselineRecords({ addresses: [], texts: [] });
        setOwnerAddress("");
        setInitialOwner("");
        setShowProfile(false);
        return;
      }

      // Subname exists - UPDATE mode
      setIsUpdateMode(true);
      setAvailability({ isAvailable: false, isChecking: false });
      
      const records = result.records || { addresses: [], texts: [] };
      const owner = result.owner || "";

      setEnsRecords(records);
      setEnsRecordsTemplate(deepCopy(records));
      setBaselineRecords(deepCopy(records));
      setOwnerAddress(owner);
      setInitialOwner(owner);
    } catch (err) {
      setAvailability({ isAvailable: false, isChecking: false });
      setIsUpdateMode(false);
    }
  };


  const debouncedCheckSubnameExists = useCallback(
    debounce((subnameLabel: string) => checkSubnameExists(subnameLabel), 500),
    [client, name]
  );

  // Check if propLabel is provided on mount
  useEffect(() => {
    if (propLabel && propLabel.length >= MIN_ENS_LEN) {
      checkSubnameExists(propLabel);
    }
  }, [propLabel]);

  const handleNameChanged = async (value: string) => {
    const _value = value.toLowerCase().trim();

    if (_value.includes(".")) {
      return;
    }

    try {
      normalize(_value);
    } catch (err) {
      return;
    }

    setLabel(_value);

    // Set checking state immediately when user starts typing
    if (_value.length >= MIN_ENS_LEN) {
      setAvailability({ isAvailable: false, isChecking: true });
      debouncedCheckSubnameExists(_value);
    } else {
      setAvailability({ isAvailable: false, isChecking: false });
    }
  };

  const handleSaveRecords = () => {
    const newRecords = deepCopy(ensRecordTemplate);
    setEnsRecords(newRecords);
    setShowProfile(false);
  };

  const handleCancelRecords = () => {
    setEnsRecordsTemplate(deepCopy(ensRecords));
    setShowProfile(false);
  };

  const handleOwnerAddressChange = (value: string) => {
    setOwnerAddress(value);
    if (value) {
      validateOwnerAddress(value);
    } else {
      clearOwnerError();
    }
  };

  const handleCreate = async () => {
    setCreateError(null);
    setIsCreating(true);

    // Validate owner address if provided
    if (ownerAddress && !validateOwnerAddress(ownerAddress)) {
      setIsCreating(false);
      return;
    }

    try {
      // Validate records if any are set
      if (ensRecords.addresses.length > 0 || ensRecords.texts.length > 0) {
        const validation = validateEnsRecords(ensRecords);
        if (validation.validationFailed) {
          setCreateError(
            validation.errors?.length > 0
              ? validation.errors[0].reason
              : "Invalid records"
          );
          setIsCreating(false);
          return;
        }
      }

      // Build request using helper function
      const requestData = buildSubnameRequest(ensRecords, ownerAddress);

      // Create or Update subname
      if (isUpdateMode) {
        const fullSubname = `${label}.${name}`;
        await client.updateSubname(fullSubname, requestData);
      } else {
        const createRequest: CreateSubnameRequest = {
          parentName: name,
          label,
          ...requestData,
        };
        await client.createSubname(createRequest);
      }

      // Fetch the created/updated subname to get the latest data
      await refreshSubnameData();
    } catch (err: any) {
      console.error("Create/Update error:", err);
      setCreateError(err?.message || `Failed to ${isUpdateMode ? 'update' : 'create'} subname`);
    } finally {
      setIsCreating(false);
    }
  };

  // Refresh subname data after create/update
  const refreshSubnameData = async () => {
    const fullSubname = `${label}.${name}`;
    const updatedSubname = await client.getSingleSubname(fullSubname);
    
    const latestRecords = updatedSubname 
      ? offchainRecordsToEnsRecords(updatedSubname)
      : ensRecords;

    // Update all record states
    setBaselineRecords(deepCopy(latestRecords));
    setEnsRecords(latestRecords);
    setEnsRecordsTemplate(deepCopy(latestRecords));
    
    // Update owner
    const latestOwner = updatedSubname?.owner || (ownerAddress && ownerAddress.trim() !== "" ? ownerAddress : "");
    setInitialOwner(latestOwner);
    setOwnerAddress(latestOwner);

    // Prepare success data
    const data: OffchainSubnameCreatedData = {
      label,
      parentName: name,
      fullSubname: `${label}.${name}`,
      records: latestRecords,
      ownerAddress: latestOwner || undefined,
    };

    setSuccessData(data);
    setCreateStep(CreateStep.Success);
    onSuccess?.(data);
  };

  const handleCreateAnother = () => {
    setSuccessData(null);
    setCreateError(null);
    setCreateStep(CreateStep.Form);
    
    // Fetch the subname data to populate the form in update mode
    if (label && label.length >= MIN_ENS_LEN) {
      checkSubnameExists(label);
    }
  };

  // Check if there are any changes in update mode
  const hasRecordChanges = useMemo(() => {
    if (!isUpdateMode) return true; // Always allow create
    
    // Check if owner changed - if so, return true immediately
    if (ownerAddress !== initialOwner) {
      return true;
    }
    
    // Only check record difference if owner hasn't changed
    const diff = getEnsRecordsDiff(ensRecords, baselineRecords);
    return diff.isDifferent;
  }, [isUpdateMode, ensRecords, baselineRecords, ownerAddress, initialOwner]);

  const isAvailableForCreate = useMemo(() => {
    if (isUpdateMode) {
      // For update mode, need label, data loaded, and changes made
      return label.length >= MIN_ENS_LEN && !isLoadingSubname && hasRecordChanges;
    }
    
    // For create mode, need availability check
    return (
      label.length >= MIN_ENS_LEN &&
      availability.isAvailable &&
      !availability.isChecking
    );
  }, [label, availability, isUpdateMode, isLoadingSubname, hasRecordChanges]);

  // Show SetSubnameRecords when profile editing is active
  if (showProfile) {
    return (
      <SetSubnameRecords
        key={`${label}-${isUpdateMode ? 'update' : 'create'}`}
        records={ensRecordTemplate}
        onRecordsChange={setEnsRecordsTemplate}
        onCancel={handleCancelRecords}
        onSave={handleSaveRecords}
        hasChanges={hasRecordsDifference}
      />
    );
  }

  // Show success screen
  if (createStep === CreateStep.Success && successData) {
    return (
      <SuccessScreen
        fullSubname={successData.fullSubname}
        isUpdateMode={isUpdateMode}
        onContinue={handleCreateAnother}
      />
    );
  }

  // Main form
  const showFullName = isUpdateMode || (!isUpdateMode && label.length >= MIN_ENS_LEN);
  const actionButtonText = isUpdateMode ? "Update" : "Create";
  const errorMessage = createError || checkError;

  return (
    <div className="ns-offchain-subname-form">
      <div style={{ padding: 15 }}>
        {!hideTitle && (
          <FormHeader
            isUpdateMode={isUpdateMode}
            label={label}
            parentName={name}
            showFullName={showFullName}
          />
        )}

        {/* Name input */}
        <SubnameInput
          value={label}
          parentName={name}
          isUpdateMode={isUpdateMode}
          isLoading={isLoadingSubname}
          isChecking={availability.isChecking}
          isDisabled={isCreating}
          isAvailable={availability.isAvailable}
          minLength={MIN_ENS_LEN}
          onChange={handleNameChanged}
        />

        {/* Owner Address Input */}
        {label.length >= MIN_ENS_LEN && (
          <>
            <OwnerAddressInput
              value={ownerAddress}
              error={ownerAddressError}
              onChange={handleOwnerAddressChange}
            />

            {/* Add Records - Always show when label is valid */}
            <ProfileSelector 
              key={`${label}-${isUpdateMode ? 'update' : 'create'}`}
              onSelect={() => setShowProfile(true)} 
            />
          </>
        )}

        {/* Error alert */}
        {errorMessage && (
          <div className="mt-2">
            <Alert variant="error" position="vertical">
              <Text size="sm">{errorMessage}</Text>
            </Alert>
          </div>
        )}

        {/* Action buttons */}
        <div className="ens-update-records-form-actions mt-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            size="lg"
            disabled={!isAvailableForCreate || isCreating || !!ownerAddressError}
            onClick={handleCreate}
            loading={isCreating}
          >
            {isCreating 
              ? (isUpdateMode ? "Updating..." : "Creating...") 
              : actionButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
};
