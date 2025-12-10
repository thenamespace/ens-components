import { useState, useEffect, useCallback } from "react";
import "./SubnameOnChainRegistrarModal.css";
import { InitialStep } from "./sub-components/InitialStep";
import { RegistrationStep } from "./sub-components/RegistrationStep";
import { OnchainSuccessScreen } from "./sub-components/OnchainSuccessScreen";
import { useEnsProfileContext } from "@/context";
import { useMainChain, useMintClient, showErrorModal } from "@/hooks";
import { useAccount } from "wagmi";
import { normalise } from "@ensdomains/ensjs/utils";
import { GenericMintedName } from "@/types";
import { debounce } from "lodash";
import { getChainForListingV2 } from "@/web3";
import { ListingType } from "@/types/list-manager";
import { Address, zeroAddress } from "viem";
// import { useProfileFilterCtx } from "../profile-filter.context";
import { formatFloat } from "@/utils/numbers";
import { useProfileFilterCtx } from "@/context/profile-filter.context";
import { AppEnv } from "@/environment";

enum ValidationErrors {
  EXPIRED = "LISTING_EXPIRED",
  WHITELIST = "MINTER_NOT_WHITELISTED",
  TOKEN_GATED_ACCESS = "MINTER_NOT_TOKEN_OWNER",
}
const randomLabel = `${Math.floor(Math.random() * 1_000_000_000)}`;


export interface SubnameOnChainRegistrarModalProps {
  step?: number;
  name?: string;
  profileComplete?: boolean;
  domainSuffix?: string;
  owner?: string;
  duration?: number;
  registrationFee?: string;
  networkFee?: string;
  totalCost?: string;
  useAsPrimary?: boolean;
  profileImageUrl?: string;
  onStepChange?: (step: number) => void;
  onNameChange?: (name: string) => void;
  onProfileCompleteChange?: (complete: boolean) => void;
  onOwnerChange?: (owner: string) => void;
  onDurationChange?: (duration: number) => void;
  onUseAsPrimaryChange?: (useAsPrimary: boolean) => void;
  onRegister?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  onCompleteProfile?: () => void;
  onOpenWallet?: () => void;
  onCompleteRegistration?: () => void;
  onRegisterAnother?: () => void;
  onViewName?: () => void;
  onFinish?: () => void;
}

export function SubnameOnChainRegistrarModal({
  step: initialStep = 0,
  name: initialName = "",
  profileComplete = false,
  domainSuffix = "eth",
  owner: initialOwner = "0x035eB...24117D3",
  duration: initialDuration = 1,
  useAsPrimary: initialUseAsPrimary = false,
  profileImageUrl,
  onStepChange,
  onNameChange,
  onProfileCompleteChange,
  onOwnerChange,
  onDurationChange,
  onUseAsPrimaryChange,
  onRegister,
  onCancel,
  onClose,
  onCompleteProfile,
  onOpenWallet,
  onCompleteRegistration,
  onRegisterAnother,
  onViewName,
  onFinish,
}: SubnameOnChainRegistrarModalProps) {
  const { listing, onSubnameMinted, subnames } = useEnsProfileContext();
  console.log("listing", listing);
  const { address } = useAccount();
  const mintClient = useMintClient();
  const { networkId, isTestnet } = useMainChain();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [ensName, setEnsName] = useState(initialName);
  const [owner, setOwner] = useState(initialOwner || address || "");
  const [duration, setDuration] = useState(initialDuration);
  const [useAsPrimary, setUseAsPrimary] = useState(initialUseAsPrimary);
  const {
    searchedSubname,
    onSubnameSeach,
    availableIndicator,
    onAvailableIndicatorChange,
  } = useProfileFilterCtx();
  const [initialCheck, setInitialCheck] = useState<{
    canMint: boolean;
    isFetching: boolean;
    errorMessage?: string;
  }>({
    canMint: false,
    isFetching: true,
  });

  const [availabilityStatus, setAvailabilityStatus] = useState<{
    isAvailable: boolean | undefined;
    isChecking: boolean;
  }>({
    isAvailable: undefined,
    isChecking: false,
  });

  // Mint details state
  const [mintDetails, setMintDetails] = useState<{
    isChecking: boolean;
    price: number;
    isReserved: boolean;
    isFreeMint?: boolean;
  }>({
    isChecking: false,
    isReserved: false,
    price: 0,
    isFreeMint: false,
  });

  // Mint validation state with full details
  const [mintValidation, setMintValidation] = useState<{
    isFetching: boolean;
    result?: {
      estimatedFeeEth: number;
      estimatedPriceEth: number;
      isStandardFee: boolean;
      canMint: boolean;
    };
  }>({
    isFetching: true,
  });

  const fetchMintDetails = useCallback(
    async (label: string, minter: Address, expiryYears: number = 1) => {
      return mintClient.getMintDetails({
        label: label,
        minterAddress: minter,
        parentName: ensName,
        isTestnet: isTestnet,
        expiryInYears: expiryYears,
      });
    },
    [mintClient, ensName, isTestnet]
  );

  // Step 1: Check if user can mint on page load
  useEffect(() => {
    if (listing.listingData) {
      fetchMintDetails(randomLabel, address || zeroAddress, duration)
        .then((result) => {
          console.log("result", result);
          setInitialCheck({
            canMint: result.canMint,
            isFetching: false,
            errorMessage: result.validationErrors?.[0],
          });
        })
        .catch((err) => {
          showErrorModal(err);
          setInitialCheck({
            canMint: false,
            errorMessage: "Unknown issue ocurred",
            isFetching: false,
          });
        });
    } else {
      setInitialCheck({
        canMint: false,
        isFetching: false,
      });
    }
  }, [listing.listingData, address, fetchMintDetails, duration]);


  const checkIsAvailable = useCallback(
    async (label: string) => {
      if (listing.listingData && label.length > 0) {
        const fullName = `${label}.${listing.listingData.name}`;
        const listingChain = getChainForListingV2(listing.listingData);
        const isL2Type = listing.listingData.type === ListingType.L2;
        console.log("fullName", fullName);
        console.log("listingChain", listingChain);
        console.log("isL2Type", isL2Type);
        try {
          const checkPromise = isL2Type
            ? mintClient.isL2SubnameAvailable(fullName, listingChain.id)
            : mintClient.isL1SubnameAvailable(fullName);
          const available = await checkPromise;

          let _available = true;
          if (subnames && subnames.length > 0) {
            _available = subnames.find((s) => s.label === label) === undefined;
          }

          onAvailableIndicatorChange({
            isChecking: false,
            isAvailable: available && _available,
          });
        } catch (err) {
          onAvailableIndicatorChange({
            isChecking: false,
            isAvailable: false,
          });
          showErrorModal(err);
        }
      } else {
        onAvailableIndicatorChange({
          isChecking: false,
          isAvailable: false,
        });
      }
    },
    [listing.listingData, mintClient, subnames, onAvailableIndicatorChange]
  );

  const debouncedCheckIsAvailable = useCallback(
    debounce((label: string) => checkIsAvailable(label), 300),
    [checkIsAvailable]
  );

  const fetchMintDetailsDebounced = useCallback(
    debounce((label: string, minterAddress: Address, expiryYears: number = 1) => {
      fetchMintDetails(label, minterAddress, expiryYears)
        .then((result) => {
          const isFreeMint = result.estimatedPriceEth === 0;
          const totalPrice = result.estimatedPriceEth + result.estimatedFeeEth;
          setMintDetails({
            isChecking: false,
            isReserved: !result.canMint,
            price: totalPrice,
            isFreeMint,
          });
          setMintValidation({
            isFetching: false,
            result: {
              estimatedFeeEth: result.estimatedFeeEth,
              estimatedPriceEth: result.estimatedPriceEth,
              isStandardFee: result.isStandardFee || false,
              canMint: result.canMint,
            },
          });
        })
        .catch((err) => {
          showErrorModal(err);
          setMintDetails({
            isChecking: false,
            isReserved: true,
            price: 0,
            isFreeMint: false,
          });
          setMintValidation({
            isFetching: false,
          });
        });
    }, 300),
    [fetchMintDetails]
  );

  const handleMintableSubnameChange = async (val: string) => {
    console.log("handleMintableSubnameChange", val);
    const _val = val.toLowerCase();

    try {
      normalise(val);
    } catch (err) {
      return;
    }

    setEnsName(_val);
    onSubnameSeach(_val);
    onNameChange?.(_val);
    console.log("initialCheck.isFetching", initialCheck);

    if (_val.length > 0 && !initialCheck.isFetching) {
      if (initialCheck.canMint) {
        onAvailableIndicatorChange({ isAvailable: false, isChecking: true });
        debouncedCheckIsAvailable(_val);
        setMintDetails({ ...mintDetails, isChecking: true });
        setMintValidation({ isFetching: true });
        fetchMintDetailsDebounced(_val, address || zeroAddress, duration);
      }
    }
  };

  const handleNameChange = (value: string) => {
    handleMintableSubnameChange(value);
  };

  const handleOwnerChange = (value: string) => {
    setOwner(value);
    onOwnerChange?.(value);
  };

  // Update owner when connected address changes (always use connected address when available)
  useEffect(() => {
    if (address) {
      setOwner(address);
      onOwnerChange?.(address);
    } else if (!address && initialOwner) {
      // Only use initialOwner if no address is connected
      setOwner(initialOwner);
    }
  }, [address, initialOwner]);

  const handleDurationChange = (value: number) => {
    setDuration(value);
    onDurationChange?.(value);
    
    // Fetch price when duration changes
    if (ensName && ensName.length > 0 && address && initialCheck.canMint) {
      const label = ensName.split(".")[0].toLowerCase();
      setMintValidation({ isFetching: true });
      fetchMintDetailsDebounced(label, address, value);
    }
  };

  const handleUseAsPrimaryChange = (value: boolean) => {
    setUseAsPrimary(value);
    onUseAsPrimaryChange?.(value);
  };

  const handleInitialRegister = () => {
    // Move to registration step when register is clicked from InitialStep
    setCurrentStep(1);
    onStepChange?.(1);
    onRegister?.();
  };

  const handleFinish = () => {
    onFinish?.();
    onClose?.();
  };

  const handleRegister = () => {
    // Move to success screen when register is clicked from RegistrationStep
    setCurrentStep(2);
    onStepChange?.(2);
    onCompleteRegistration?.();
  };

  const handleBack = () => {
    setCurrentStep(0);
    onStepChange?.(0);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  // Initial step (first screen)
  if (currentStep === 0) {
    return (
      <div className="ns-onchain-register-container">
        <InitialStep
          name={ensName}
          onNameChange={handleNameChange}
          onCancel={handleCancel}
          onRegister={handleInitialRegister}
          onClose={onClose}
          domainSuffix={domainSuffix}
          isNameAvailable={
            availabilityStatus.isChecking
              ? undefined
              : availabilityStatus.isAvailable
          }
        />
      </div>
    );
  }

  // Registration step (second screen)
  if (currentStep === 1) {
    // Calculate dynamic values based on validation result
    const estimatedPriceEth = mintValidation.result?.estimatedPriceEth || 0;
    const estimatedFeeEth = mintValidation.result?.estimatedFeeEth || 0;
    const isStandardFee = mintValidation.result?.isStandardFee || false;
    
    // Calculate registration fee (price per year)
    const registrationFeePerYear = isStandardFee 
      ? estimatedPriceEth 
      : estimatedPriceEth + estimatedFeeEth;
    
    // Total registration fee for the duration
    const registrationFee = registrationFeePerYear * duration;
    
    // Network fee (estimated fee, only if not standard fee)
    const networkFee = isStandardFee ? 0 : estimatedFeeEth;
    
    // Total cost
    const totalCost = registrationFee + networkFee;
    
    // Mint price for display (per year)
    const mintPrice = registrationFeePerYear;
    const isExpirable = duration > 1;

    return (
      <div className="ns-onchain-register-container">
        <RegistrationStep
          name={ensName}
          domainSuffix={domainSuffix}
          owner={owner}
          duration={duration}
          registrationFee={mintValidation.result ? formatFloat(registrationFee, 6).toString() : null}
          networkFee={mintValidation.result ? formatFloat(networkFee, 6).toString() : null}
          totalCost={mintValidation.result ? formatFloat(totalCost, 6).toString() : null}
          useAsPrimary={useAsPrimary}
          profileComplete={profileComplete}
          profileImageUrl={profileImageUrl}
          onBack={handleBack}
          onCancel={handleCancel}
          onRegister={handleRegister}
          onClose={onClose}
          onOwnerChange={handleOwnerChange}
          onDurationChange={handleDurationChange}
          onUseAsPrimaryChange={handleUseAsPrimaryChange}
          onCompleteProfile={onCompleteProfile}
          mintPrice={mintPrice}
          isFetchingPrice={mintValidation.isFetching}
          expiryYears={duration}
          isExpirable={isExpirable}
        />
      </div>
    );
  }

  // Success step (third screen)
  if (currentStep === 2) {
    return (
      <div className="ns-onchain-register-container">
        <OnchainSuccessScreen
          name={ensName}
          onClose={onClose}
          onFinish={handleFinish}
        />
      </div>
    );
  }

  // Default to initial step
  return (
    <div className="ns-onchain-register-container">
      <InitialStep
        name={ensName}
        onNameChange={handleNameChange}
        onCancel={handleCancel}
        onRegister={handleInitialRegister}
        onClose={onClose}
        domainSuffix={domainSuffix}
        isNameAvailable={
          availabilityStatus.isChecking
            ? undefined
            : availabilityStatus.isAvailable
        }
      />
    </div>
  );
}
