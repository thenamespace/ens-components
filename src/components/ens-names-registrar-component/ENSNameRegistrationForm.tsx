import React, { useState, useEffect, useCallback } from "react";
import "./ENSNamesRegistrarComponent.css";
import { NameSearch } from "./sub-components/NameSearch";
import { RegistrationForm } from "./sub-components/RegistrationForm";
import { RegistrationProcess } from "./sub-components/RegistrationProcess";
import { SuccessScreen } from "./sub-components/SuccessScreen";
import { normalize } from "viem/ens";

import { debounce } from "lodash";
import { EnsRecords } from "@/types";

import { Address, Hash, toHex, zeroAddress } from "viem";

import { NameRegistration, EnsRegistrationSteps } from "@/utils/models";
import { useAccount } from "wagmi";
import { Button, Icon, Input, Text } from "../atoms";
import ninjaImage from "../../assets/banner.png";
import shurikenImage from "../../assets/shuriken.svg";
import { useRegisterENS } from "@/hooks";

const MIN_ENS_LEN = 3;

export interface ENSNameRegistrationFormProps {
  name?: string;
  duration?: number;
  onNameChange?: (name: string) => void;
  onDurationChange?: (duration: number) => void;
  onBack?: () => void;
  onClose?: () => void;
  onNext?: () => void;
  onCompleteProfile?: () => void;
  onOpenWallet?: () => void;
  onCompleteRegistration?: () => void;
  onRegisterAnother?: () => void;
  onViewName?: () => void;
}

interface EnsNameRegistrationFormProps {
  name?: string;
  expiryInYears?: number;
  isTestnet?: boolean;
}

export const EnsNameRegistrationForm = (
  props: EnsNameRegistrationFormProps
) => {
  const [expiryInYears, setExpiryInYears] = useState(props.expiryInYears || 1);
  const [nameInput, setNameInput] = useState<string>(props.name || "");
  const [ensRecords, setEnsRecords] = useState<EnsRecords>({
    addresses: [],
    texts: [],
  });
  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean;
    isTaken: boolean;
    reason?: string;
  }>({
    isChecking: false,
    isTaken: false,
  });
  const { isEnsAvailable } = useRegisterENS({
    isTestnet: props.isTestnet || false,
  });

  const handleDecrease = () => {
    if (expiryInYears > 1) {
      setExpiryInYears(expiryInYears - 1);
    }
  };

  const handleIncrease = () => {
    setExpiryInYears(expiryInYears + 1);
  };

  const handleNameChanged = async (value: string) => {
    const _value = value.toLocaleLowerCase().trim();

    if (_value.includes(".")) {
      // We don't allow ".", only label
      return;
    }

    try {
      normalize(_value);
    } catch (err) {
      // Name contains an invalid character
      return;
    }

    setNameInput(_value);

    if (_value.length >= MIN_ENS_LEN) {
      setNameValidation({ isChecking: true, isTaken: false });
      checkAvailability(_value);
    }
  };

  const checkAvailability = async (label: string) => {
    try {
      const isAvailable = await isEnsAvailable(label);
      setNameValidation({ isChecking: false, isTaken: isAvailable });
    } catch (err) {
      setNameValidation({
        isChecking: false,
        isTaken: false,
        reason: "Something went wrong",
      });
    }
  };

  return (
    <div className="ens-registration-form-container">
      <div className="d-flex justify-content-center">
        <img
          style={{ width: "250px", margin: "auto" }}
          src={ninjaImage}
          alt="Ninja Image"
        ></img>
      </div>
      <div className="text-center mb-3" style={{ textAlign: "center" }}>
        <Text weight="bold" className="text-align-center" size="lg">
          ENS Name Registration
        </Text>
        <Text color="grey" className="text-align-center" size="sm">
          Register your ENS name and set a profile
        </Text>
      </div>
      <Input
        value={nameInput}
        onChange={e => handleNameChanged(e.target.value)}
        size="lg"
        wrapperClassName="ens-name-input"
        prefix={<Icon color="grey" size={20} name="search" />}
        suffix={
          <Text weight="medium" size="sm" color="grey">
            .eth
          </Text>
        }
      />
      {/* RECEIPT */}
      <div className="ens-registration-pricing mt-2">
        <div className="ens-expiry-picker d-flex justify-content-between mb-2">
          <Button disabled={expiryInYears <= 1} onClick={handleDecrease}>
            -
          </Button>
          <Text>
            {expiryInYears} year{expiryInYears > 1 ? "s" : ""}
          </Text>
          <Button onClick={handleIncrease}>+</Button>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Text size="sm" color="grey">
            Registration Fee
          </Text>
          <Text size="sm" color="grey">
            0.04 ETH
          </Text>
        </div>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <Text size="sm" color="grey">
            Est. network fee
          </Text>
          <Text size="sm" color="grey">
            0.04 ETH
          </Text>
        </div>
        <div className="d-flex justify-content-between align-items-center mt-2 total-fee">
          <Text size="lg" weight="bold">
            Total
          </Text>
          <Text size="lg" weight="bold">
            0.08 ETH
          </Text>
        </div>
      </div>
      {/* RECEIPT */}
      {/* COMPLETE PROFILE */}
      <div className="ens-profile-selector mt-2">
        <div className="content-container d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="shuriken-cont d-flex align-items-center justify-content-center">
              <img
                className="shuriken"
                width={50}
                src={shurikenImage}
                alt="shuricken"
              ></img>
            </div>
            <div className="ms-2">
              <Text size="sm" weight="medium">
                Complete your profile
              </Text>
              <Text size="xs" color="grey">
                Make your ENS more discoverable
              </Text>
            </div>
          </div>
          <Button style={{ width: 40, height: 40 }}>{`>`}</Button>
        </div>
      </div>
      {/* COMPLETE PROFILE */}
      <Button style={{ width: "100%" }} size="lg" className="mt-3">
        Next
      </Button>
    </div>
  );
};

export function ENSNameRegistrationForm({
  name = "brightwave",
  duration: initialDuration = 1,
  onNameChange,
  onDurationChange,
  onBack,
  onClose,
  onNext,
  onCompleteProfile,
  onOpenWallet,
  onCompleteRegistration,
  onRegisterAnother,
  onViewName,
}: ENSNameRegistrationFormProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [ensName, setEnsName] = useState(name);
  const [currentStep, setCurrentStep] = useState<EnsRegistrationSteps>(
    EnsRegistrationSteps.SelectNames
  );
  const [expandedStep, setExpandedStep] = useState(1);

  // Debug: Log step changes
  useEffect(() => {
    const stepNames = {
      [EnsRegistrationSteps.SelectNames]: "SelectNames",
      [EnsRegistrationSteps.RegistrationBegin]: "RegistrationBegin",
      [EnsRegistrationSteps.CommitmentSent]: "CommitmentSent",
      [EnsRegistrationSteps.TimerStarted]: "TimerStarted",
      [EnsRegistrationSteps.TimerCompleted]: "TimerCompleted",
      [EnsRegistrationSteps.RegistrationSent]: "RegistrationSent",
      [EnsRegistrationSteps.RegistrationCompleted]: "RegistrationCompleted",
    };
    console.log(
      `[ENS Registration] Step changed to: ${stepNames[currentStep]} (${currentStep})`
    );
  }, [currentStep]);
  const [isTransactionInProgress, setIsTransactionInProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [registrations, setRegistrations] = useState<NameRegistration[]>([]);
  const [fetchedEthPrice, setFetchedEthPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [nameAvailability, setNameAvailability] = useState<{
    isAvailable: boolean;
    isChecking: boolean;
  }>({
    isAvailable: false,
    isChecking: false,
  });
  // Track the last name and duration for which we fetched price
  const [lastFetchedName, setLastFetchedName] = useState<string>("");
  const [lastFetchedDuration, setLastFetchedDuration] = useState<number>(0);
  // const { isNameAvailable, getRegistrationPrice } = useEthRegistrarController();
  // const { networkId } = useMainChain();
  const { address: connectedAddress } = useAccount();
  // const { publicResolver } = useEnsContractAddresses();

  const fetchPrice = useCallback(
    async (name: string, durationInYears: number) => {
      if (!name || name.trim() === "" || durationInYears <= 0) {
        setFetchedEthPrice(null);
        setIsLoadingPrice(false);
        setPriceError(null);
        return;
      }

      const normalizedName = normalize(name.trim());

      try {
        setIsLoadingPrice(true);
        setPriceError(null);
        // const priceResult = await getRegistrationPrice(normalizedName, durationInYears);
        const priceResult = {
          ethPrice: 0,
        };

        if (priceResult) {
          setFetchedEthPrice(priceResult.ethPrice);
          setLastFetchedName(normalizedName);
          setLastFetchedDuration(durationInYears);
        }
      } catch (error) {
        console.error("Error fetching registration price:", error);
        setPriceError("Failed to fetch price");
        setFetchedEthPrice(null);
      } finally {
        setIsLoadingPrice(false);
      }
    },
    []
  );

  const [recordsPerName, setRecordsPerName] = useState<
    Record<string, EnsRecords>
  >({});

  const isRegistrationPresent = (label: string) => {
    return registrations.find(reg => reg.label === label) !== undefined;
  };
  const addNewRegistration = async (label: string) => {
    if (isRegistrationPresent(label)) {
      return;
    }

    // const price = await getRegistrationPrice(label, 1);
    const price = {
      ethPrice: 0,
      weiPrice: 0n,
    };
    const _registrations = [
      {
        durationInYears: 1,
        label: label,
        price: {
          ethValue: price.ethPrice,
          isChecking: false,
          weiValue: price.weiPrice,
        },
      },
      ...registrations,
    ];

    if (!recordsPerName[label]) {
      const _records = { ...recordsPerName };
      _records[label] = {
        addresses: [],
        texts: [],
      };
      setRecordsPerName(_records);
    }

    setRegistrations(_registrations);
  };

  const getExpiryDate = () => {
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setFullYear(now.getFullYear() + duration);

    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const month = months[expiryDate.getMonth()];
    const day = expiryDate.getDate();
    const year = expiryDate.getFullYear();

    return `${month} ${day}, ${year}`;
  };

  useEffect(() => {
    if (isTransactionInProgress) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            console.log(
              "[ENS Registration] Progress reached 100% - Moving to TimerStarted"
            );
            setIsTimerActive(true);
            setCurrentStep(EnsRegistrationSteps.TimerStarted);
            setCompletedSteps([1]);
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [isTransactionInProgress]);

  useEffect(() => {
    if (isTimerActive && timerSeconds > 0) {
      const interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            console.log(
              "[ENS Registration] Timer completed - Moving to TimerCompleted"
            );
            setIsTimerActive(false);
            setCurrentStep(EnsRegistrationSteps.TimerCompleted);
            setCompletedSteps([1, 2]);
            setExpandedStep(3);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isTimerActive, timerSeconds]);

  const handleDurationChange = (delta: number) => {
    const newDuration = Math.max(1, duration + delta);
    setDuration(newDuration);
    onDurationChange?.(newDuration);

    // Fetch price when duration changes on RegistrationBegin step, only if name or duration changed
    if (
      currentStep === EnsRegistrationSteps.RegistrationBegin &&
      ensName &&
      ensName.length >= 3 &&
      newDuration > 0
    ) {
      const normalizedName = ensName.trim();
      if (
        normalizedName !== lastFetchedName ||
        newDuration !== lastFetchedDuration
      ) {
        fetchPrice(ensName, newDuration);
      }
    }
  };

  const checkAvailable = useCallback(async (label: string) => {
    try {
      // const available = await isNameAvailable(label);
      const available = true;
      console.log("Available:", available);
      console.log("Name availability response:", available);
      console.log("Label:", label, "Available:", available);
      setNameAvailability({ isAvailable: available, isChecking: false });
    } catch (error) {
      console.error("Error checking name availability:", error);
      console.log("Error response:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      setNameAvailability({ isAvailable: false, isChecking: false });
    }
  }, []);

  const debouncedCheck = useCallback(
    debounce((label: string) => checkAvailable(label), 300),
    [checkAvailable]
  );

  const handleNameChange = (value: string) => {
    const _value = value.toLocaleLowerCase();

    if (value.endsWith(".")) {
      return;
    }

    try {
      normalize(_value);
    } catch (err) {
      return;
    }

    setEnsName(_value);
    onNameChange?.(_value);

    // Check availability when typing
    if (_value.length > 2) {
      setNameAvailability({ isAvailable: false, isChecking: true });
      debouncedCheck(_value);
    } else {
      setNameAvailability({ isAvailable: false, isChecking: false });
    }

    // Fetch price when name changes on RegistrationBegin step, only if name or duration changed
    if (
      currentStep === EnsRegistrationSteps.RegistrationBegin &&
      _value.length >= 3 &&
      duration > 0
    ) {
      const normalizedName = normalize(_value.trim());
      if (
        normalizedName !== lastFetchedName ||
        duration !== lastFetchedDuration
      ) {
        fetchPrice(_value, duration);
      }
    }
  };

  // Check availability on mount if there's an initial name
  useEffect(() => {
    console.log(
      "[ENS Registration] Component mounted - Initial step:",
      EnsRegistrationSteps.SelectNames
    );
    if (ensName && ensName.length >= 3 && !nameAvailability.isChecking) {
      try {
        normalize(ensName);
        setNameAvailability({ isAvailable: false, isChecking: true });
        checkAvailable(ensName);
      } catch (err) {
        setNameAvailability({ isAvailable: false, isChecking: false });
      }
    }
  }, []);

  const handleNameSearchNext = () => {
    if (ensName && ensName.length >= 3 && duration > 0) {
      const normalizedName = normalize(ensName.trim());
      if (
        normalizedName !== lastFetchedName ||
        duration !== lastFetchedDuration
      ) {
        console.log(
          "[ENS Registration] Fetching price for:",
          ensName,
          "duration:",
          duration
        );
        fetchPrice(ensName, duration);
      }
    }
    setCurrentStep(EnsRegistrationSteps.RegistrationBegin);
    onNext?.();
  };

  const handleNext = () => {
    console.log(
      "[ENS Registration] handleNext called - Moving to CommitmentSent"
    );
    setCurrentStep(EnsRegistrationSteps.CommitmentSent);
    onNext?.();
  };

  const handleBackToForm = () => {
    console.log(
      "[ENS Registration] handleBackToForm called - Moving back to RegistrationBegin"
    );
    setCurrentStep(EnsRegistrationSteps.RegistrationBegin);
    setIsTransactionInProgress(false);
    setProgress(0);
    setIsTimerActive(false);
    setTimerSeconds(60);
    setCompletedSteps([]);
    onBack?.();
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? 0 : stepNumber);
  };

  const handleOpenWallet = () => {
    console.log(
      "[ENS Registration] handleOpenWallet called - Moving to CommitmentSent"
    );
    setCurrentStep(EnsRegistrationSteps.CommitmentSent);
    setIsTransactionInProgress(true);
    setProgress(0);
    onOpenWallet?.();
  };

  const prepareRegistrationContext = (): any[] => {
    if (!ensName || !connectedAddress) {
      return [];
    }

    const normalizedName = normalize(ensName.trim());
    const records = recordsPerName[normalizedName] || {
      addresses: [],
      texts: [],
    };
    const price =
      fetchedEthPrice !== null
        ? BigInt(Math.floor(fetchedEthPrice * 1e18))
        : BigInt(0);

    // Generate a random secret for the commitment
    const secretArray = new Uint8Array(32);
    crypto.getRandomValues(secretArray);
    const secret = toHex(secretArray) as Hash;

    return [
      {
        label: normalizedName,
        owner: connectedAddress as Address,
        secret: secret,
        durationInYears: duration,
        resolver: zeroAddress,
        reverseRecord: false,
        records: records,
        registrationPrice: price,
      },
    ];
  };

  const handleCompleteRegistration = () => {
    console.log(
      "[ENS Registration] handleCompleteRegistration called - Moving to RegistrationCompleted"
    );
    setCurrentStep(EnsRegistrationSteps.RegistrationCompleted);
    onCompleteRegistration?.();
  };

  const handleRegisterAnother = () => {
    console.log(
      "[ENS Registration] handleRegisterAnother called - Resetting to SelectNames"
    );
    setCurrentStep(EnsRegistrationSteps.SelectNames);
    setIsTransactionInProgress(false);
    setProgress(0);
    setIsTimerActive(false);
    setTimerSeconds(60);
    setCompletedSteps([]);
    setExpandedStep(1);
    onRegisterAnother?.();
  };

  const timerProgress = ((60 - timerSeconds) / 60) * 100;

  // Use only fetched price, no hardcoded costs
  const registrationCost = fetchedEthPrice !== null ? fetchedEthPrice : 0;
  const networkFee = 0; // Network fee is typically estimated at transaction time
  const total = registrationCost + networkFee;

  if (currentStep === EnsRegistrationSteps.SelectNames) {
    return (
      <NameSearch
        ensName={ensName}
        onNameChange={handleNameChange}
        onBack={onBack}
        onClose={onClose}
        onNext={handleNameSearchNext}
        isChecking={nameAvailability.isChecking}
        isAvailable={nameAvailability.isAvailable}
        isTaken={
          ensName.length >= 3 &&
          !nameAvailability.isChecking &&
          !nameAvailability.isAvailable
        }
      />
    );
  }

  if (currentStep === EnsRegistrationSteps.RegistrationBegin) {
    // Only allow next if name is available, not checking, and name length is valid
    const canProceed =
      nameAvailability.isAvailable &&
      !nameAvailability.isChecking &&
      ensName.length >= 3;

    const normalizedName = normalize(ensName.trim());

    const handleRecordsChange = (records: EnsRecords) => {
      setRecordsPerName({
        ...recordsPerName,
        [normalizedName]: records,
      });
    };

    return (
      <RegistrationForm
        ensName={ensName}
        duration={duration}
        registrationCost={registrationCost}
        networkFee={networkFee}
        total={total}
        onNameChange={handleNameChange}
        onDurationChange={handleDurationChange}
        onBack={() => setCurrentStep(EnsRegistrationSteps.SelectNames)}
        onClose={onClose}
        onNext={handleNext}
        onCompleteProfile={onCompleteProfile}
        onRecordsChange={handleRecordsChange}
        isLoadingPrice={isLoadingPrice}
        priceError={priceError}
        nameAvailability={nameAvailability}
        canProceed={canProceed}
      />
    );
  }

  if (currentStep === EnsRegistrationSteps.RegistrationCompleted) {
    return (
      <SuccessScreen
        ensName={ensName}
        duration={duration}
        registrationCost={registrationCost}
        networkFee={networkFee}
        total={total}
        expiryDate={getExpiryDate()}
        onClose={onClose}
        onRegisterAnother={handleRegisterAnother}
        onViewName={onViewName || (() => {})}
      />
    );
  }

  const registrationContexts = prepareRegistrationContext();

  return (
    <RegistrationProcess
      registrations={registrationContexts}
      onBack={handleBackToForm}
      onClose={onClose}
      onCompleteProfile={onCompleteProfile}
      onRegistrationComplete={() => {
        setCurrentStep(EnsRegistrationSteps.RegistrationCompleted);
        onCompleteRegistration?.();
      }}
    />
  );
}

export default ENSNameRegistrationForm;
