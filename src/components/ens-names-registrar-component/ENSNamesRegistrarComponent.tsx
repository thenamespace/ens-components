import React, { useState, useEffect, useCallback } from "react";
import "./ENSNamesRegistrarComponent.css";
import { NameSearch } from "./sub-components/NameSearch";
import { RegistrationForm } from "./sub-components/RegistrationForm";
import { RegistrationProcess } from "./sub-components/RegistrationProcess";
import { SuccessScreen } from "./sub-components/SuccessScreen";
import {
  EnsRegistrationContext,
  useEnsContractAddresses,
  useEthRegistrarController,
  useMainChain,
} from "@/hooks";

import { normalise } from "@ensdomains/ensjs/utils";
import { debounce } from "lodash";
import {
  EnsRecords,
} from "@/types";

import { useConnectedPrincipal } from "@/context";
import { Address, Hash, toHex } from "viem";

import { NameRegistration , EnsRegistrationSteps } from "@/utils/models";
import { useAccount, useSwitchChain } from "wagmi";
import { AppEnv } from "@/environment";
export interface ENSNamesRegistrarComponentProps {
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

export function ENSNamesRegistrarComponent({
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
}: ENSNamesRegistrarComponentProps) {
  const [duration, setDuration] = useState(initialDuration);
  const [ensName, setEnsName] = useState(name);
  const [currentStep, setCurrentStep] = useState<EnsRegistrationSteps>(EnsRegistrationSteps.SelectNames);
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
    console.log(`[ENS Registration] Step changed to: ${stepNames[currentStep]} (${currentStep})`);
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
  const { isNameAvailable, getRegistrationPrice } = useEthRegistrarController();
  const { networkId } = useMainChain();
  const { connectedAddress } = useConnectedPrincipal();
  const { publicResolver } = useEnsContractAddresses();
  console.log("connectedAddress:", connectedAddress);
  const fetchPrice = useCallback(async (name: string, durationInYears: number) => {
    if (!name || name.trim() === "" || durationInYears <= 0) {
      setFetchedEthPrice(null);
      setIsLoadingPrice(false);
      setPriceError(null);
      return;
    }

    const normalizedName = normalise(name.trim());

    try {
      setIsLoadingPrice(true);
      setPriceError(null);
      const priceResult = await getRegistrationPrice(normalizedName, durationInYears);
      
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
  }, [getRegistrationPrice]);


  const [recordsPerName, setRecordsPerName] = useState<
  Record<string, EnsRecords>
>({});

  const isRegistrationPresent = (label: string) => {
    return registrations.find((reg) => reg.label === label) !== undefined;
  };
  const addNewRegistration = async (label: string) => {
    if (isRegistrationPresent(label)) {
      return;
    }

    const price = await getRegistrationPrice(label, 1);
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
            console.log("[ENS Registration] Progress reached 100% - Moving to TimerStarted");
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
            console.log("[ENS Registration] Timer completed - Moving to TimerCompleted");
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
    if (currentStep === EnsRegistrationSteps.RegistrationBegin && ensName && ensName.length >= 3 && newDuration > 0) {
      const normalizedName = normalise(ensName.trim());
      if (normalizedName !== lastFetchedName || newDuration !== lastFetchedDuration) {
        fetchPrice(ensName, newDuration);
      }
    }
  };

  const checkAvailable = useCallback(async (label: string) => {
    console.log("Checking availability for label:", label);
    console.log("Network ID:", networkId);
    console.log("Is Testnet:", AppEnv.isTestnet);
    try {
      
      const available = await isNameAvailable(label);
      console.log("Available:", available);
      console.log("Name availability response:", available);
      console.log("Label:", label, "Available:", available);
      setNameAvailability({ isAvailable: available, isChecking: false });
    } catch (error) {
      console.error("Error checking name availability:", error);
      console.log("Error response:", error);
      console.log("Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      setNameAvailability({ isAvailable: false, isChecking: false });
    }
  }, [isNameAvailable, networkId]);

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
      normalise(_value);
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
    if (currentStep === EnsRegistrationSteps.RegistrationBegin && _value.length >= 3 && duration > 0) {
      const normalizedName = normalise(_value.trim());
      if (normalizedName !== lastFetchedName || duration !== lastFetchedDuration) {
        fetchPrice(_value, duration);
      }
    }
  };

  // Check availability on mount if there's an initial name
  useEffect(() => {
    console.log("[ENS Registration] Component mounted - Initial step:", EnsRegistrationSteps.SelectNames);
    if (ensName && ensName.length >= 3 && !nameAvailability.isChecking) {
      try {
        normalise(ensName);
        setNameAvailability({ isAvailable: false, isChecking: true });
        checkAvailable(ensName);
      } catch (err) {
        setNameAvailability({ isAvailable: false, isChecking: false });
      }
    }
  }, []);

  const handleNameSearchNext = () => {
    console.log("[ENS Registration] handleNameSearchNext called - Moving to RegistrationBegin");
    // Fetch price when moving to RegistrationBegin step, only if we haven't fetched for this name/duration yet
    if (ensName && ensName.length >= 3 && duration > 0) {
      const normalizedName = normalise(ensName.trim());
      if (normalizedName !== lastFetchedName || duration !== lastFetchedDuration) {
        console.log("[ENS Registration] Fetching price for:", ensName, "duration:", duration);
        fetchPrice(ensName, duration);
      }
    }
    setCurrentStep(EnsRegistrationSteps.RegistrationBegin);
    onNext?.();
  };

  const handleNext = () => {
    console.log("[ENS Registration] handleNext called - Moving to CommitmentSent");
    setCurrentStep(EnsRegistrationSteps.CommitmentSent);
    onNext?.();
  };

  const handleBackToForm = () => {
    console.log("[ENS Registration] handleBackToForm called - Moving back to RegistrationBegin");
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
    console.log("[ENS Registration] handleOpenWallet called - Moving to CommitmentSent");
    setCurrentStep(EnsRegistrationSteps.CommitmentSent);
    setIsTransactionInProgress(true);
    setProgress(0);
    onOpenWallet?.();
  };

  const prepareRegistrationContext = (): EnsRegistrationContext[] => {
    if (!ensName || !connectedAddress || !publicResolver) {
      return [];
    }

    const normalizedName = normalise(ensName.trim());
    const records = recordsPerName[normalizedName] || { addresses: [], texts: [] };
    const price = fetchedEthPrice !== null 
      ? BigInt(Math.floor(fetchedEthPrice * 1e18))
      : BigInt(0);

    // Generate a random secret for the commitment
    const secretArray = new Uint8Array(32);
    crypto.getRandomValues(secretArray);
    const secret = toHex(secretArray) as Hash;

    return [{
      label: normalizedName,
      owner: connectedAddress as Address,
      secret: secret,
      durationInYears: duration,
      resolver: publicResolver as Address,
      reverseRecord: false,
      records: records,
      registrationPrice: price,
    }];
  };

  const handleCompleteRegistration = () => {
    console.log("[ENS Registration] handleCompleteRegistration called - Moving to RegistrationCompleted");
    setCurrentStep(EnsRegistrationSteps.RegistrationCompleted);
    onCompleteRegistration?.();
  };

  const handleRegisterAnother = () => {
    console.log("[ENS Registration] handleRegisterAnother called - Resetting to SelectNames");
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
        isTaken={ensName.length >= 3 && !nameAvailability.isChecking && !nameAvailability.isAvailable}
      />
    );
  }

  if (currentStep === EnsRegistrationSteps.RegistrationBegin) {
    // Only allow next if name is available, not checking, and name length is valid
    const canProceed = nameAvailability.isAvailable && !nameAvailability.isChecking && ensName.length >= 3;
    
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
        onViewName={onViewName || (() => { })}
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

export default ENSNamesRegistrarComponent;
