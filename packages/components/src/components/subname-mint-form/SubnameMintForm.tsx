import { useCallback, useEffect, useMemo, useState } from "react";
import { Text, ShurikenSpinner } from "@/components/atoms";
import {
  PricingDisplay,
  Alert,
  ContractErrorLabel,
  isUserDeniedError,
} from "@/components/molecules";
import { useAccount, useSwitchChain } from "wagmi";
import { sepolia, mainnet } from "viem/chains";
import { getSupportedAddressByChainId } from "@/constants/records/addressConstants";
import { Address, ContractFunctionExecutionError, formatEther, Hash } from "viem";
import { normalize } from "viem/ens";
import { debounce, deepCopy, getEnsRecordsDiff } from "@/utils";
import "./SubnameMintForm.css";
import { useMintManager, useMintSubname, useWaitTransaction } from "@/hooks";
import { getChainIdForListingNetwork, ListingType, EnsRecords } from "@/types";
import {
  MintDetailsResponse,
  EnsRecords as EnsMintRecords,
} from "@thenamespace/mint-manager";
import { SetSubnameRecords } from "./SetSubnameRecords";
import { NameAvailabilityInput } from "./NameAvailabilityInput";
import { ProfileSelector } from "./ProfileSelector";
import { MintFormActions } from "./MintFormActions";
import { MintSuccess } from "./MintSuccess";
import { TransactionPendingScreen } from "../ens-name-registration/registration/TransactionPendingScreen";

enum MintDeniedError {
  MinterNotTakenOwner = "MINTER_NOT_TOKEN_OWNER",
  MinterNotWhitelisted = "MINTER_NOT_WHITELISTED",
  ListingExpired = "LISTING_EXPIRED",
  SubnameReserved = "SUBNAME_RESERVED",
}

enum MintStep {
  Form = "form",
  Minting = "minting",
  Success = "success",
}

export interface MintSuccessData {
  fullName: string;
  label: string;
  parentName: string;
  txHash: string;
  price: string;
  transactionFees: string;
  records: EnsRecords;
}

export interface SubnameMintedData {
  label: string;
  parentName: string;
  fullSubname: string;
  records: EnsRecords;
  price: string;
  transactionFees: string;
  ownerAddress: string;
  txHash: string;
  chainId: number;
}

interface SubnameMintFormProps {
  parentName: string;
  label?: string;
  isTestnet?: boolean;
  avatarUploadDomain?: string;
  onCancel?: () => void;
  onSuccess?: (data: MintSuccessData) => void;
  onSubnameMinted?: (data: SubnameMintedData) => void;
  txConfirmations?: number;
  onConnectWallet?: () => void;
}

const MIN_ENS_LEN = 1;

export const SubnameMintForm = ({
  parentName,
  label,
  isTestnet,
  avatarUploadDomain,
  onCancel,
  onSuccess,
  onSubnameMinted,
  txConfirmations,
  onConnectWallet,
}: SubnameMintFormProps) => {
  const { getListingDetails } = useMintManager({ isTestnet });

  const [initState, setInitState] = useState<{
    isChecking: boolean;
    isListingValid: boolean;
    listingChainId: number;
    isL2: boolean;
    isExpirable?: boolean;
    error?: string;
  }>({
    isChecking: true,
    isListingValid: false,
    listingChainId: 0,
    isL2: false,
    isExpirable: false,
  });

  useEffect(() => {
    getListingDetails(parentName)
      .then((listing) => {
        const isL2 = listing.type === ListingType.L2;
        const listingNetwork =
          isL2 && listing.l2Metadata
            ? listing.l2Metadata.registryNetwork
            : listing.nameNetwork;
        const listingChainId = getChainIdForListingNetwork(listingNetwork);

        setInitState({
          isChecking: false,
          isListingValid: listing?.isVerified,
          listingChainId: listingChainId,
          isL2: isL2,
          isExpirable: listing?.l2Metadata?.isExpirable,
        });
      })
      .catch((e) => {
        console.error(e);
        setInitState({
          isChecking: false,
          isListingValid: false,
          listingChainId: 0,
          isL2: false,
          error: e?.message || "Failed to load listing details. Please try again later.",
        });
      });
  }, [getListingDetails, parentName]);

  // Show loading spinner while checking
  if (initState.isChecking) {
    return (
      <div className="ns-subname-mint-form">
        <div
          className="ns-text-center d-flex align-items-center justify-content-center"
          style={{ gap: "8px" }}
        >
          <ShurikenSpinner size={24} />
          <Text size="sm" color="grey">
            Checking listing configuration...
          </Text>
        </div>
      </div>
    );
  }

  // Show error if fetching listing details failed
  if (initState.error) {
    return (
      <div className="ns-subname-mint-form">
        <Alert variant="error" position="vertical">
          <Text size="sm">{initState.error}</Text>
        </Alert>
      </div>
    );
  }

  // Show error if listing is not valid
  if (!initState.isListingValid) {
    return (
      <div className="ns-subname-mint-form">
        <Alert variant="error" position="vertical">
          <Text size="sm">
            ENS name <span style={{ fontWeight: "bold" }}>{parentName}</span> is
            not configured properly to issue subnames.
          </Text>
        </Alert>
      </div>
    );
  }

  return (
    <div className="ns-subname-mint-form">
      <SubnameMintFormContent
        parentName={parentName}
        label={label}
        chainId={initState.listingChainId}
        isTestnet={isTestnet}
        isL2={initState.isL2}
        isExpirable={initState.isExpirable || false}
        avatarUploadDomain={avatarUploadDomain}
        onCancel={onCancel}
        onSuccess={onSuccess}
        onSubnameMinted={onSubnameMinted}
        txConfirmations={txConfirmations}
        onConnectWallet={onConnectWallet}
      />
    </div>
  );
};

interface SubnameMintContentProps extends SubnameMintFormProps {
  isL2: boolean;
  isExpirable: boolean;
  chainId: number;
}

// Helper to get chain display name from chainId
const getChainDisplayName = (chainId: number): string => {
  if (chainId === sepolia.id) return "Sepolia";
  if (chainId === mainnet.id) return "Ethereum";

  const supportedAddress = getSupportedAddressByChainId(chainId);
  if (supportedAddress) return supportedAddress.label;

  return `Chain ${chainId}`;
};

const SubnameMintFormContent = ({
  parentName,
  label: initialLabel,
  chainId,
  isTestnet = false,
  isL2,
  isExpirable = false,
  avatarUploadDomain,
  onCancel,
  onSuccess,
  onSubnameMinted,
  txConfirmations,
  onConnectWallet,
}: SubnameMintContentProps) => {
  const { address: connectedAddress, chain: currentChain } = useAccount();
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain();
  const { mintClient } = useMintManager({ isTestnet });
  const { mintSubname, estimateTransactionFees } = useMintSubname({ chainId });
  const { waitTx } = useWaitTransaction({ chainId });

  // Check if user needs to switch chain
  const needsChainSwitch = currentChain?.id !== chainId;
  const requiredChainName = getChainDisplayName(chainId);

  const handleSwitchChain = () => {
    if (switchChain) {
      switchChain({ chainId });
    }
  };

  const [label, setLabel] = useState<string>(initialLabel || "");
  const [showProfile, setShowProfile] = useState(false);
  const [mintStep, setMintStep] = useState<MintStep>(MintStep.Form);
  const [successData, setSuccessData] = useState<MintSuccessData | null>(null);

  // Minting state
  const [mintState, setMintState] = useState<{
    isWaitingWallet: boolean;
    isWaitingTx: boolean;
    txHash: string;
    txCompleted: boolean;
  }>({
    isWaitingWallet: false,
    isWaitingTx: false,
    txHash: "",
    txCompleted: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [contractError, setContractError] =
    useState<ContractFunctionExecutionError | null>(null);

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

  const [years, setYears] = useState(1);
  const [availability, setAvailability] = useState<{
    isChecking: boolean;
    isAvailable: boolean;
  }>({
    isChecking: false,
    isAvailable: true,
  });

  const [mintDetails, setMintDetails] = useState<{
    isChecking: boolean;
    details: MintDetailsResponse;
  }>({
    isChecking: false,
    details: {
      canMint: true,
      validationErrors: [],
      estimatedFeeEth: 0,
      estimatedPriceEth: 0,
      isStandardFee: false,
    },
  });

  const checkIsAvailable = async (fullName: string, _chainId: number) => {
    const available = isL2
      ? await mintClient.isL2SubnameAvailable(fullName, _chainId)
      : await mintClient.isL1SubnameAvailable(fullName);

    setAvailability({ isAvailable: available, isChecking: false });
  };

  const checkMintDetails = async (
    labelToCheck: string,
    parentNameToCheck: string,
    minter: Address
  ) => {
    const details = await mintClient.getMintDetails({
      minterAddress: minter,
      parentName: parentNameToCheck,
      label: labelToCheck,
      isTestnet: isTestnet
    });
    setMintDetails({ isChecking: false, details: details });
  };

  const debouncedCheckAvailability = useCallback(
    debounce(
      (fullName: string, _chainId: number) =>
        checkIsAvailable(fullName, _chainId),
      500
    ),
    []
  );

  const debouncedCheckMintDetails = useCallback(
    debounce(
      (labelToCheck: string, parentNameToCheck: string, minter: Address) =>
        checkMintDetails(labelToCheck, parentNameToCheck, minter),
      500
    ),
    []
  );

  // Trigger availability/price check on mount if initial label is provided
  // Note: Gas estimation is handled separately in the useEffect that watches isAvailableForMint
  useEffect(() => {
    if (initialLabel && initialLabel.length >= MIN_ENS_LEN && connectedAddress) {
      setAvailability({ isAvailable: false, isChecking: true });
      setMintDetails((prev) => ({ ...prev, isChecking: true }));
      checkIsAvailable(`${initialLabel}.${parentName}`, chainId);
      checkMintDetails(initialLabel, parentName, connectedAddress);
    }
  }, []);

  const [transactionFees, setTransactionFees] = useState<{
    isChecking: boolean;
    estimatedGas: number;
    failed: boolean;
    price: {
      wei: bigint;
      eth: number;
    };
  }>({
    isChecking: false,
    estimatedGas: 0,
    failed: false,
    price: {
      wei: 0n,
      eth: 0,
    },
  });

  const [gasEstimated, setGasEstimated] = useState(false);

  // Fetch gas estimate
  const fetchGasEstimate = async (labelToEstimate: string, recordsToEstimate: EnsRecords) => {
    if (!connectedAddress) return;

    setTransactionFees((prev) => ({ ...prev, isChecking: true, failed: false }));

    try {
      // Convert records to mint format
      const ensMintRecords: EnsMintRecords = {
        addresses: recordsToEstimate.addresses.map((addr) => ({
          chain: addr.coinType,
          value: addr.value,
        })),
        texts: recordsToEstimate.texts.map((text) => ({
          key: text.key,
          value: text.value,
        })),
      };

      // Get mint transaction parameters
      const mintTx = await mintClient.getMintTransactionParameters({
        records: ensMintRecords,
        label: labelToEstimate,
        parentName,
        owner: connectedAddress,
        minterAddress: connectedAddress,
      });

      const result = await estimateTransactionFees({
        mintTx,
        account: connectedAddress,
      });

      if (result) {
        setTransactionFees({
          isChecking: false,
          estimatedGas: Number(result.gasEstimate),
          failed: false,
          price: {
            wei: result.totalFeeWei,
            eth: result.totalFeeEth,
          },
        });
        setGasEstimated(true);
      } else {
        setTransactionFees((prev) => ({ ...prev, isChecking: false, failed: true }));
      }
    } catch (err) {
      console.error("Gas estimation error:", err);
      setTransactionFees((prev) => ({ ...prev, isChecking: false, failed: true }));
    }
  };

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
    setGasEstimated(false); // Reset gas estimation for new name
    setTransactionFees((prev) => ({ ...prev, failed: false })); // Reset failed state

    if (_value.length >= MIN_ENS_LEN) {
      setAvailability({ isAvailable: false, isChecking: true });
      setMintDetails({ ...mintDetails, isChecking: true });
      debouncedCheckAvailability(`${_value}.${parentName}`, chainId);
      debouncedCheckMintDetails(_value, parentName, connectedAddress!);
    }
  };

  // Format ETH value with smart precision for small numbers
  const formatEthDisplay = (value: number): string => {
    if (value === 0) return "0";
    if (value < 0.00001) return ">0.00001";
    return value.toFixed(5);
  };

  const { regPrice, regFees, regTotal, isFree } = useMemo(() => {
    const { estimatedPriceEth, estimatedFeeEth } = mintDetails.details;
    const isFree = estimatedPriceEth === 0;
    const price = isFree ? 0 : estimatedFeeEth + estimatedPriceEth;
    let fees = 0;
    let total = price;

    // If gas estimation failed, show N/A for fees
    if (transactionFees.failed) {
      return {
        regFees: "N/A",
        regPrice: isFree ? "Free" : formatEthDisplay(price),
        regTotal: "N/A",
        isFree,
      };
    }

    if (transactionFees) {
      fees += transactionFees.price.eth;
      total += transactionFees.price.eth;
    }

    return {
      regFees: formatEthDisplay(fees),
      regPrice: isFree ? "Free" : formatEthDisplay(price),
      regTotal: isFree && fees === 0 ? "Free" : formatEthDisplay(total),
      isFree,
    };
  }, [mintDetails, transactionFees]);

  const handleYearsChange = (newYears: number) => {
    if (newYears < 1) {
      return;
    }
    setYears(newYears);
  };

  const totalPriceLoading =
    transactionFees?.isChecking || mintDetails.isChecking;
  const transactionFeesLoading = transactionFees?.isChecking || false;

  // Check for blocking errors that prevent minting entirely
  const blockingError = useMemo<{
    message: string;
    variant: "error" | "warning";
  } | null>(() => {
    const { canMint, validationErrors } = mintDetails.details;
    if (canMint || mintDetails.isChecking) return null;

    const blockingErrors = [
      MintDeniedError.MinterNotTakenOwner,
      MintDeniedError.MinterNotWhitelisted,
      MintDeniedError.ListingExpired,
    ];

    const foundError = validationErrors.find((err) =>
      blockingErrors.includes(err as MintDeniedError)
    );

    if (!foundError) return null;

    const errorConfig: Record<
      string,
      { message: string; variant: "error" | "warning" }
    > = {
      [MintDeniedError.MinterNotTakenOwner]: {
        message: "You don't own required token.",
        variant: "warning",
      },
      [MintDeniedError.MinterNotWhitelisted]: {
        message: "Your are not whitelisted to mint subnames.",
        variant: "warning",
      },
      [MintDeniedError.ListingExpired]: {
        message: "This listing has expired.",
        variant: "warning",
      },
    };

    return (
      errorConfig[foundError] || {
        message: "You cannot mint subnames at this time.",
        variant: "warning",
      }
    );
  }, [mintDetails]);

  // Check if subname is reserved (non-blocking, user can try another name)
  const isSubnameReserved = useMemo(() => {
    const { canMint, validationErrors } = mintDetails.details;
    return (
      !canMint && validationErrors.includes(MintDeniedError.SubnameReserved)
    );
  }, [mintDetails]);

  const isAvailableForMint = useMemo(() => {
    return (
      label.length >= 1 &&
      availability.isAvailable &&
      !availability.isChecking &&
      !blockingError &&
      !isSubnameReserved
    );
  }, [label, availability, blockingError, isSubnameReserved]);

  // Estimate gas when name becomes available for the first time
  useEffect(() => {
    if (isAvailableForMint && !gasEstimated && label.length >= MIN_ENS_LEN) {
      fetchGasEstimate(label, ensRecords);
    }
  }, [isAvailableForMint, gasEstimated, label]);

  const handleSaveRecords = () => {
    const newRecords = deepCopy(ensRecordTemplate);
    setEnsRecords(newRecords);
    setShowProfile(false);
    // Re-estimate gas when records change
    if (label.length >= MIN_ENS_LEN) {
      fetchGasEstimate(label, newRecords);
    }
  };

  const handleCancelRecords = () => {
    setEnsRecordsTemplate(deepCopy(ensRecords));
    setShowProfile(false);
  };

  const handleMint = async () => {
    setError(null);
    setContractError(null);
    setMintStep(MintStep.Minting);

    let tx: Hash | null = null;
    let mintPrice: bigint = 0n;

    // Step 1: Get mint transaction parameters and execute
    try {
      setMintState({
        isWaitingWallet: true,
        isWaitingTx: false,
        txHash: "",
        txCompleted: false,
      });

      // Convert EnsRecords to EnsMintRecords needed by mint client
      const ensMintRecords: EnsMintRecords = {
        addresses: ensRecords.addresses.map((addr) => ({
          chain: addr.coinType,
          value: addr.value,
        })),
        texts: ensRecords.texts.map((text) => ({
          key: text.key,
          value: text.value,
        })),
      };

      const mintTx = await mintClient.getMintTransactionParameters({
        records: ensMintRecords,
        label: label,
        parentName: parentName,
        owner: connectedAddress!,
        minterAddress: connectedAddress!,
      });

      // Step 2: Simulate and execute transaction
      const result = await mintSubname(mintTx);
      tx = result.txHash;
      mintPrice = result.price;

      setMintState({
        isWaitingWallet: false,
        isWaitingTx: true,
        txHash: tx,
        txCompleted: false,
      });
    } catch (err: any) {
      console.error("Mint error:", err);

      // Don't show error if user rejected the transaction
      if (!isUserDeniedError(err)) {
        if (err instanceof ContractFunctionExecutionError) {
          setContractError(err);
        } else {
          setError(err?.shortMessage || err?.message || "Something went wrong");
        }
      }

      setMintState({
        isWaitingWallet: false,
        isWaitingTx: false,
        txHash: "",
        txCompleted: false,
      });
      setMintStep(MintStep.Form);
      return;
    }

    // Step 3: Wait for transaction confirmation
    if (!tx) {
      setMintStep(MintStep.Form);
      return;
    }

    try {
      const receipt = await waitTx({ hash: tx, txConfirmations: txConfirmations || 1 });

      // Calculate gas fees
      const gasUsed = receipt.gasUsed;
      const gasPrice = receipt.effectiveGasPrice || BigInt(0);
      const txFees = gasUsed * gasPrice;
      const transactionFeesEth = formatEther(txFees);

      setMintState({
        isWaitingWallet: false,
        isWaitingTx: false,
        txHash: tx,
        txCompleted: true,
      });

      const data: MintSuccessData = {
        fullName: `${label}.${parentName}`,
        label,
        parentName,
        txHash: tx,
        price: formatEther(mintPrice),
        transactionFees: transactionFeesEth,
        records: ensRecords,
      };

      setSuccessData(data);
      onSuccess?.(data);

      // Call onSubnameMinted callback with minting details
      onSubnameMinted?.({
        label,
        parentName,
        fullSubname: `${label}.${parentName}`,
        records: ensRecords,
        price: formatEther(mintPrice),
        transactionFees: transactionFeesEth,
        ownerAddress: connectedAddress!,
        txHash: tx,
        chainId,
      });

      // Short delay before showing success
      setTimeout(() => {
        setMintStep(MintStep.Success);
      }, 1000);
    } catch (err) {
      console.error("Transaction wait error:", err);
      setError("Failed to confirm transaction. Please check the explorer.");
      setMintState({
        isWaitingWallet: false,
        isWaitingTx: false,
        txHash: "",
        txCompleted: false,
      });
      setMintStep(MintStep.Form);
    }
  };

  const handleMintAnother = () => {
    setLabel("");
    setEnsRecords({ addresses: [], texts: [] });
    setEnsRecordsTemplate({ addresses: [], texts: [] });
    setSuccessData(null);
    setError(null);
    setContractError(null);
    setMintState({
      isWaitingWallet: false,
      isWaitingTx: false,
      txHash: "",
      txCompleted: false,
    });
    setMintStep(MintStep.Form);
  };

  const isMinting = mintState.isWaitingWallet || mintState.isWaitingTx;

  // Show pending transaction screen when tx is sent
  if (mintStep === MintStep.Minting && mintState.txHash) {
    return (
      <div style={{padding: 15}}>
        <Text className="ns-text-center mb-3" weight="bold">
          Minting {label}.{parentName}
        </Text>
        <TransactionPendingScreen
          hash={mintState.txHash as Hash}
          isCompleted={mintState.txCompleted}
          chainId={chainId}
          message="Your subname is being minted!"
        />
      </div>
    );
  }

  // Show MintSuccess after successful mint
  if (mintStep === MintStep.Success && successData) {
    return (
      <MintSuccess
        data={successData}
        chainId={chainId}
        isTestnet={isTestnet}
        onClose={onCancel}
        onMintAnother={handleMintAnother}
      />
    );
  }

  // Show SetSubnameRecords when profile editing is active
  if (showProfile) {
    return (
      <SetSubnameRecords
        records={ensRecordTemplate}
        onRecordsChange={setEnsRecordsTemplate}
        onCancel={handleCancelRecords}
        onSave={handleSaveRecords}
        hasChanges={hasRecordsDifference}
        avatarUpload={label ? {
          ensName: `${label}.${parentName}`,
          isTestnet,
          siweDomain: avatarUploadDomain,
        } : undefined}
      />
    );
  }

  return (
    <div style={{padding: 15}}>
      <Text className="ns-text-center" weight="bold">
        Get Your Web3 Username
      </Text>

      <div className="mt-3">
        <NameAvailabilityInput
          label={label}
          parentName={parentName}
          minLength={MIN_ENS_LEN}
          disabled={!!blockingError || isMinting}
          isChecking={availability.isChecking}
          isAvailable={availability.isAvailable}
          isReserved={isSubnameReserved}
          onNameChange={handleNameChanged}
        />
      </div>

      {/* Blocking error alert */}
      {blockingError && (
        <div className="mt-2">
          <Alert variant={blockingError.variant} position="vertical">
            <Text size="sm">{blockingError.message}</Text>
          </Alert>
        </div>
      )}

      {/* Pricing Component - Only show when name is available */}
      {isAvailableForMint && (
        <>
          <PricingDisplay
            className="mt-2"
            primaryFee={{
              label: "Price",
              amount: regPrice,
              isChecking: mintDetails.isChecking,
            }}
            networkFees={{
              amount: regFees,
              isChecking: transactionFeesLoading,
            }}
            total={{
              amount: regTotal,
              isChecking: totalPriceLoading,
            }}
            expiryPicker={
              isExpirable
                ? {
                    years,
                    onYearsChange: handleYearsChange,
                  }
                : undefined
            }
          />

          <ProfileSelector onSelect={() => setShowProfile(true)} />
        </>
      )}

      {/* Mint error alert - shown above buttons */}
      {error && (
        <div className="mt-2">
          <Alert variant="error" position="vertical">
            <Text size="sm">{error}</Text>
          </Alert>
        </div>
      )}

      <ContractErrorLabel error={contractError} />

      <MintFormActions
        onCancel={() => onCancel?.()}
        onMint={handleMint}
        isMintDisabled={
          !isAvailableForMint ||
          mintDetails.isChecking ||
          !mintDetails.details.canMint
        }
        isWaitingWallet={mintState.isWaitingWallet}
        needsChainSwitch={needsChainSwitch}
        chainName={requiredChainName}
        onSwitchChain={handleSwitchChain}
        isSwitchingChain={isSwitchingChain}
        isConnected={!!connectedAddress}
        onConnectWallet={onConnectWallet}
      />
    </div>
  );
};
