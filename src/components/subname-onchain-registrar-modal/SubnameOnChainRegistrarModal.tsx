import { useState, useEffect, useCallback, useMemo } from "react";
import "./SubnameOnChainRegistrarModal.css";
import { InitialStep } from "./sub-components/InitialStep";
import { RegistrationStep } from "./sub-components/RegistrationStep";
import { OnchainSuccessScreen } from "./sub-components/OnchainSuccessScreen";
import { useAccount, useBalance } from "wagmi";
import { debounce } from "@/utils";
import {
  Address,
  zeroAddress,
  Hash,
  parseEther,
  isAddress,
  namehash,
} from "viem";
import { sepolia, mainnet } from "viem/chains";
// import { useProfileFilterCtx } from "../profile-filter.context";
import { formatFloat } from "@/utils/numbers";
import { TransactionState } from "@/components/pending-transaction/PendingTransaction";
import {
  ContenthashType,
  MintTransactionResponse,
} from "@namespacesdk/mint-manager";
import { EnsRecords as MintENSRecords } from "@namespacesdk/mint-manager";
import { EnsRecords } from "@/types";

const randomLabel = `${Math.floor(Math.random() * 1_000_000_000)}`;

export interface SubnameOnChainRegistrarModalProps {
  step?: number;
  name?: string;
  parentName?: string;
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
  parentName: initialParentName = "celotest.eth",
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
  return <div></div>;
}

// export function SubnameOnChainRegistrarModal({
//   step: initialStep = 0,
//   name: initialName = "",
//   parentName: initialParentName = "celotest.eth",
//   profileComplete = false,
//   domainSuffix = "eth",
//   owner: initialOwner = "0x035eB...24117D3",
//   duration: initialDuration = 1,
//   useAsPrimary: initialUseAsPrimary = false,
//   profileImageUrl,
//   onStepChange,
//   onNameChange,
//   onProfileCompleteChange,
//   onOwnerChange,
//   onDurationChange,
//   onUseAsPrimaryChange,
//   onRegister,
//   onCancel,
//   onClose,
//   onCompleteProfile,
//   onOpenWallet,
//   onCompleteRegistration,
//   onRegisterAnother,
//   onViewName,
//   onFinish,
// }: SubnameOnChainRegistrarModalProps) {
//   // Parent name from prop - user will input label
//   const PARENT_NAME = initialParentName;

//   // const { listing, onSubnameMinted, subnames } = useEnsProfileContext();
//   // const { connectedAddress } = useConnectedPrincipal();
//   // const { address, chain } = useAccount();
//   // const mintClient = useMintClient();
//   // const listManager = useListingManager();
//   // const { networkId, isTestnet, network: envNetwork } = useMainChain();

//   // Determine network based on connected chain, fallback to environment network
//   // const network = useMemo(() => {
//   //   if (chain) {
//   //     if (chain.id === sepolia.id) {
//   //       return SupportedNetwork.Sepolia;
//   //     } else if (chain.id === mainnet.id) {
//   //       return SupportedNetwork.Mainnet;
//   //     }
//   //   }
//   //   return envNetwork;
//   // }, [chain, envNetwork]);
//   const [currentStep, setCurrentStep] = useState(initialStep);
//   const [ensName, setEnsName] = useState(initialName || "");
//   // Extract label from initialName if provided (e.g., "nikku.celotest.eth" -> "nikku")
//   const getLabelFromName = (name: string): string => {
//     if (!name) return "";
//     const parts = name.split(".");
//     return parts[0] || "";
//   };
//   const [subnameLabel, setSubnameLabel] = useState(getLabelFromName(initialName || ""));
//   const [parentName, setParentName] = useState(initialParentName);
//   const [owner, setOwner] = useState(connectedAddress || initialOwner || address || "");
//   const [duration, setDuration] = useState(initialDuration);
//   const [useAsPrimary, setUseAsPrimary] = useState(initialUseAsPrimary);
//   const {
//     searchedSubname,
//     onSubnameSeach,
//     availableIndicator,
//     onAvailableIndicatorChange,
//   } = useProfileFilterCtx();

//   // Mint transaction state
//   const [mintTransaction, setMintTransaction] = useState<{
//     state: TransactionState;
//     showTxScreen: boolean;
//     transactionHash: Hash;
//   }>({
//     showTxScreen: false,
//     state: TransactionState.InProgress,
//     transactionHash: "0x0" as Hash,
//   });

//   const [mintBtnState, setMintBtnState] = useState<{
//     waitingForWallet: boolean;
//   }>({
//     waitingForWallet: false,
//   });

//   // ENS records state (empty by default, can be extended later)
//   const [nameRecords, setNameRecords] = useState<EnsRecords>({
//     addresses: [],
//     texts: [],
//   });

//   const [dynamicListing, setDynamicListing] = useState<NamespaceListing | null>(null);
//   const [isLoadingListing, setIsLoadingListing] = useState(false);
//   const activeListing = useMemo(() => {
//     return dynamicListing || listing.listingData || null;
//   }, [dynamicListing, listing.listingData]);

//   // Get listing chain for minting
//   const listingChain = useMemo(() => {
//     if (activeListing) {
//       return getChainForListingV2(activeListing);
//     }
//     return null;
//   }, [activeListing]);

//   // Get chain name for block explorer
//   const chainName = useMemo(() => {
//     if (listingChain) {
//       return getChainName(listingChain.id);
//     }
//     return null;
//   }, [listingChain]);

//   // Web3 clients for minting
//   const { publicClient, walletClient } = useWeb3Clients({
//     chainId: listingChain?.id || sepolia.id
//   });

//   // Transaction waiting hook
//   const { waitForTransactionReceipt } = useWaitForTransaction({
//     chainId: listingChain?.id || sepolia.id
//   });

//   // Balance checking
//   const { data: currentBalance } = useBalance({ address: connectedAddress });

//   const [initialCheck, setInitialCheck] = useState<{
//     canMint: boolean;
//     isFetching: boolean;
//     errorMessage?: string;
//   }>({
//     canMint: false,
//     isFetching: true,
//   });

//   const [availabilityStatus, setAvailabilityStatus] = useState<{
//     isAvailable: boolean | undefined;
//     isChecking: boolean;
//     status?: "free" | "available";
//   }>({
//     isAvailable: undefined,
//     isChecking: false,
//   });

//   // Mint details state
//   const [mintDetails, setMintDetails] = useState<{
//     isChecking: boolean;
//     price: number;
//     canMint: boolean;
//     isFreeMint?: boolean;
//   }>({
//     isChecking: false,
//     canMint: false,
//     price: 0,
//     isFreeMint: false,
//   });

//   // Mint validation state with full details
//   const [mintValidation, setMintValidation] = useState<{
//     isFetching: boolean;
//     result?: {
//       estimatedFeeEth: number;
//       estimatedPriceEth: number;
//       isStandardFee: boolean;
//       canMint: boolean;
//     };
//   }>({
//     isFetching: true,
//   });

//   // Parse input like "nikku.bighead.eth" to label and parent name
//   const parseInput = useCallback((value: string): { label: string; parentName: string } => {
//     const parts = value.split(".");
//     if (parts.length >= 2) {
//       const labelPart = parts[0];
//       const parentParts = parts.slice(1);
//       const parent = parentParts.join(".");
//       return { label: labelPart, parentName: parent };
//     }
//     return { label: value, parentName: "" };
//   }, []);

//   // Helper function to split subname input - improved version
//   const handleSearch = useCallback((value: string): { label: string; parent: string; isValid: boolean } => {
//     const parsed = parseInput(value);
//     setSubnameLabel(parsed.label);
//     setParentName(parsed.parentName);
//     return { label: parsed.label, parent: parsed.parentName, isValid: true };
//   }, [parseInput]);

//   const [pendingLabel, setPendingLabel] = useState<string | null>(null);

//   const fetchListing = useCallback(
//     async (parent: string, label?: string) => {
//       if (!parent || parent.length < 3) {
//         setDynamicListing(null);
//         setPendingLabel(null);
//         return;
//       }

//       setIsLoadingListing(true);
//       if (label) {
//         setPendingLabel(label);
//       }
//       try {
//         const fetchedListing = await listManager.getListedName(parent);
//         setDynamicListing(fetchedListing);
//       } catch (err) {
//         showErrorModal(err);
//         setDynamicListing(null);
//         setPendingLabel(null);
//       } finally {
//         setIsLoadingListing(false);
//       }
//     },
//     [listManager, network, isTestnet, networkId]
//   );

//   const fetchMintDetails = useCallback(async (label: string, minter: Address, expiryYears: number = 1) => {
//     const parent = activeListing?.name || parentName || ensName;
//     return mintClient.getMintDetails({
//       label: label,
//       minterAddress: minter,
//       parentName: parent,
//       isTestnet: isTestnet,
//       expiryInYears: expiryYears,
//     });
//   }, [mintClient, activeListing?.name, parentName, ensName, isTestnet]);

//   // Debounced listing fetch
//   const debouncedFetchListing = useCallback(
//     debounce((parent: string, label?: string) => {
//       fetchListing(parent, label);
//     }, 500),
//     [fetchListing]
//   );

//   // Initialize parent name on mount and when prop changes
//   useEffect(() => {
//     setParentName(initialParentName);
//     // Fetch listing for the parent name on mount
//     if (initialParentName && initialParentName.length >= 3) {
//       debouncedFetchListing(initialParentName);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [initialParentName]); // Run when parentName prop changes

//   useEffect(() => {
//     if (activeListing) {
//       fetchMintDetails(randomLabel, address || zeroAddress, duration)
//         .then((result) => {
//           setInitialCheck({
//             canMint: result.canMint,
//             isFetching: false,
//             errorMessage: result.validationErrors?.[0],
//           });
//         })
//         .catch((err) => {
//           showErrorModal(err);
//           setInitialCheck({
//             canMint: false,
//             errorMessage: "Unknown issue occurred",
//             isFetching: false,
//           });
//         });
//     } else {
//       setInitialCheck({
//         canMint: false,
//         isFetching: false,
//       });
//     }
//   }, [activeListing, address, fetchMintDetails, duration]);

//   // Check if subname is available
//   const checkAvailability = useCallback(
//     async (label: string, parent: string, listingData: NamespaceListing) => {
//       if (!label || !parent || !listingData) {
//         setAvailabilityStatus({ isChecking: false, isAvailable: false });
//         onAvailableIndicatorChange({ isChecking: false, isAvailable: false });
//         return;
//       }

//       setAvailabilityStatus({ isChecking: true, isAvailable: false });
//       onAvailableIndicatorChange({ isChecking: true, isAvailable: false });

//       try {
//         const fullName = `${label}.${parent}`;
//         const listingChain = getChainForListingV2(listingData);
//         const isL2Type = listingData.type === ListingType.L2;

//         let available: boolean;
//         if (isL2Type) {
//           if (!listingChain || !listingChain.id) {
//             throw new Error(`Invalid chain for L2 listing: ${listingData.l2Metadata?.registryNetwork}`);
//           }
//           available = await mintClient.isL2SubnameAvailable(fullName, listingChain.id);
//         } else {
//           available = await mintClient.isL1SubnameAvailable(fullName);
//         }
//         let _available = available;
//         if (subnames && subnames.length > 0) {
//           const existingSubname = subnames.find((s) => s.label === label);
//           _available = available && existingSubname === undefined;
//         }

//         setAvailabilityStatus({ isChecking: false, isAvailable: _available });
//         onAvailableIndicatorChange({ isChecking: false, isAvailable: _available });
//       } catch (err) {
//         showErrorModal(err);
//         setAvailabilityStatus({ isChecking: false, isAvailable: false });
//         onAvailableIndicatorChange({ isChecking: false, isAvailable: false });
//       }
//     },
//     [mintClient, subnames, onAvailableIndicatorChange]
//   );

//   const debouncedCheckAvailability = useCallback(
//     debounce(
//       (label: string, parent: string, listingData: NamespaceListing) => {
//         checkAvailability(label, parent, listingData);
//       },
//       300
//     ),
//     [checkAvailability]
//   );
//   const fetchMintDetailsDebounced = useCallback(
//     debounce(
//       (label: string, parent: string, listingData: NamespaceListing, minterAddress: Address, expiryYears: number = 1) => {
//         if (!label || !parent || !listingData || !minterAddress) {
//           setMintDetails({
//             isChecking: false,
//             price: 0,
//             canMint: false,
//             isFreeMint: false,
//           });
//           setMintValidation({ isFetching: false });
//           return;
//         }

//         setMintDetails((prev) => ({ ...prev, isChecking: true }));
//         setMintValidation({ isFetching: true });

//         fetchMintDetails(label, minterAddress, expiryYears)
//           .then((result) => {
//             const isFreeMint = result.estimatedPriceEth === 0;
//             const totalPrice = result.estimatedPriceEth + result.estimatedFeeEth;
//             setMintDetails({
//               isChecking: false,
//               price: totalPrice,
//               canMint: result.canMint,
//               isFreeMint,
//             });
//             // Also update mintValidation with full result
//             setMintValidation({
//               isFetching: false,
//               result: {
//                 estimatedFeeEth: result.estimatedFeeEth,
//                 estimatedPriceEth: result.estimatedPriceEth,
//                 isStandardFee: result.isStandardFee || false,
//                 canMint: result.canMint,
//               },
//             });
//           })
//           .catch((err) => {
//             showErrorModal(err);
//             setMintDetails({
//               isChecking: false,
//               price: 0,
//               canMint: false,
//               isFreeMint: false,
//             });
//             setMintValidation({ isFetching: false });
//           });
//       },
//       300
//     ),
//     [fetchMintDetails]
//   );

//   // Helper wrapper for fetchMintDetailsDebounced
//   const debouncedFetchMintDetails = useCallback(
//     (label: string, parent: string, listingData: NamespaceListing, minterAddress: Address, expiryYears: number = 1) => {
//       fetchMintDetailsDebounced(label, parent, listingData, minterAddress, expiryYears);
//     },
//     [fetchMintDetailsDebounced]
//   );

//   // When listing is loaded and we have a label, check availability and fetch price
//   useEffect(() => {
//     if (activeListing && subnameLabel && subnameLabel.length > 0) {
//       const parent = activeListing.name || parentName;
//       if (parent) {
//         debouncedCheckAvailability(subnameLabel, parent, activeListing);
//         debouncedFetchMintDetails(
//           subnameLabel,
//           parent,
//           activeListing,
//           connectedAddress || address || zeroAddress,
//           duration
//         );
//       }
//     }
//   }, [activeListing, subnameLabel, parentName, connectedAddress, address, duration, debouncedCheckAvailability, debouncedFetchMintDetails]);

//   // Handle input change - user inputs just the label
//   const handleMintableSubnameChange = async (val: string) => {
//     const _val = val.toLowerCase().trim();

//     // Validate label format (alphanumeric and hyphens only)
//     if (_val.length > 0) {
//       // Check for invalid characters
//       if (!/^[a-z0-9-]+$/i.test(_val)) {
//         return; // Invalid character, don't update
//       }

//       // Validate ENS name format
//       try {
//         normalise(_val);
//       } catch (err) {
//         // Invalid character, don't update
//         return;
//       }
//     }

//     // User inputs just the label, parent comes from prop
//     const label = _val;
//     const currentParent = parentName || initialParentName;
//     const fullName = label ? `${label}.${currentParent}` : "";

//     // Set state
//     setSubnameLabel(label);
//     setParentName(currentParent);
//     setEnsName(fullName);
//     onSubnameSeach(fullName);
//     onNameChange?.(fullName);

//     // Reset states
//     setAvailabilityStatus({ isChecking: false, isAvailable: false });
//     setMintDetails({
//       isChecking: false,
//       price: 0,
//       canMint: false,
//       isFreeMint: false,
//     });

//     // If we have a label, fetch listing and process it
//     if (label && label.length > 0 && currentParent && currentParent.length >= 3) {
//       debouncedFetchListing(currentParent, label);
//     } else {
//       setDynamicListing(null);
//     }
//   };

//   const handleNameChange = (value: string) => {
//     handleMintableSubnameChange(value);
//   };

//   const handleOwnerChange = (value: string) => {
//     setOwner(value);
//     onOwnerChange?.(value);
//   };

//   useEffect(() => {
//     if (connectedAddress) {
//       setOwner(connectedAddress);
//       onOwnerChange?.(connectedAddress);
//     } else if (address) {
//       setOwner(address);
//       onOwnerChange?.(address);
//     } else if (!address && initialOwner) {
//       // Only use initialOwner if no address is connected
//       setOwner(initialOwner);
//     }
//   }, [connectedAddress, address, initialOwner]);

//   const handleDurationChange = (value: number) => {
//     setDuration(value);
//     onDurationChange?.(value);

//     // Fetch price when duration changes
//     // Use the extracted subnameLabel, or extract from ensName if not set
//     const labelToUse = subnameLabel || (ensName ? ensName.split(".")[0].toLowerCase() : "");
//     const parentToUse = activeListing?.name || parentName;
//     if (labelToUse && labelToUse.length > 0 && parentToUse && activeListing && (connectedAddress || address) && initialCheck.canMint) {
//       setMintValidation({ isFetching: true });
//       fetchMintDetailsDebounced(
//         labelToUse,
//         parentToUse,
//         activeListing,
//         connectedAddress || address || zeroAddress,
//         value
//       );
//     }
//   };

//   const handleUseAsPrimaryChange = (value: boolean) => {
//     setUseAsPrimary(value);
//     onUseAsPrimaryChange?.(value);
//   };

//   const handleInitialRegister = () => {
//     setCurrentStep(1);
//     onStepChange?.(1);
//     onRegister?.();
//   };

//   const handleFinish = () => {
//     onFinish?.();
//     onClose?.();
//   };

//   const handleRegister = async () => {
//     if (!connectedAddress || !activeListing || !listingChain || !subnameLabel) {
//       showErrorModal(new Error("Missing required information for minting"));
//       return;
//     }

//     // Validate owner address
//     if (!isAddress(owner)) {
//       showErrorModal(new Error("Invalid owner address"));
//       return;
//     }

//     // Check balance
//     const estimatedPriceEth = mintValidation.result?.estimatedPriceEth || 0;
//     const estimatedFeeEth = mintValidation.result?.estimatedFeeEth || 0;
//     const isStandardFee = mintValidation.result?.isStandardFee || false;
//     const mintPrice = isStandardFee ? estimatedPriceEth : estimatedPriceEth + estimatedFeeEth;
//     const totalPrice = mintPrice * duration;
//     const currentPriceWei = parseEther(totalPrice.toString(), "wei");

//     if ((currentBalance?.value || BigInt(0)) < currentPriceWei) {
//       showErrorModal(new Error("Insufficient balance to complete the transaction"));
//       return;
//     }

//     let mintParameters: MintTransactionResponse;

//     try {
//       // Prepare ENS records
//       const records: MintENSRecords = {
//         addresses: (nameRecords.addresses || []).map((addr) => ({
//           chain: addr.coinType,
//           value: addr.value,
//         })),
//         texts: nameRecords.texts || [],
//       };

//       if (nameRecords.contenthash) {
//         // Map ContenthashProtocol to ContenthashType
//         const protocolMap: Record<string, ContenthashType> = {
//           ipfs: ContenthashType.Ipfs,
//           onion3: ContenthashType.Onion,
//           arweave: ContenthashType.Arweave,
//           skynet: ContenthashType.Skynet,
//           swarm: ContenthashType.Swarm,
//         };
//         const contentType = protocolMap[nameRecords.contenthash.protocol.toLowerCase()] || ContenthashType.Ipfs;
//         records.contenthash = {
//           type: contentType as unknown as ContenthashType,
//           value: nameRecords.contenthash.value,
//         };
//       }

//       // Ensure addresses array exists
//       if (!records.addresses) {
//         records.addresses = [];
//       }

//       // Add connected address as ETH address if not already present
//       const hasEthAddress = records.addresses.some(addr => addr.chain === 60);
//       if (!hasEthAddress && connectedAddress) {
//         records.addresses.push({
//           chain: 60,
//           value: connectedAddress,
//         });
//       }

//       setMintBtnState({ waitingForWallet: true });

//       // Get mint transaction parameters from backend
//       mintParameters = await mintClient.getMintTransactionParameters({
//         label: subnameLabel,
//         minterAddress: connectedAddress,
//         parentName: activeListing.name,
//         expiryInYears: duration,
//         owner: owner,
//         records: records,
//       });
//     } catch (err) {
//       showErrorModal(err);
//       setMintBtnState({ waitingForWallet: false });
//       return;
//     }

//     let tx: Hash = "0x0" as Hash;

//     try {
//       if (!publicClient || !walletClient) {
//         throw new Error("Wallet not connected");
//       }
//       const { request } = await publicClient.simulateContract({
//         abi: mintParameters.abi,
//         address: mintParameters.contractAddress,
//         functionName: mintParameters.functionName,
//         args: mintParameters.args,
//         account: connectedAddress,
//         value: mintParameters.value,
//       });

//       // Send mint transaction
//       tx = await walletClient.writeContract(request);
//     } catch (err) {
//       showErrorModal(err);
//       setMintBtnState({ waitingForWallet: false });
//       return;
//     }

//     try {
//       setMintTransaction({
//         showTxScreen: true,
//         state: TransactionState.InProgress,
//         transactionHash: tx,
//       });

//       // Wait for transaction receipt
//       await waitForTransactionReceipt(tx, 1);

//       // Callback for successful mint
//       const fullName = `${subnameLabel}.${activeListing.name}`;
//       const nameChainId = listingChain.id;

//       if (onSubnameMinted) {
//         const addrs: Record<string, string> = {};
//         const txts: Record<string, string> = {};

//         nameRecords.addresses.forEach((addr) => {
//           addrs[addr.coinType.toString()] = addr.value;
//         });
//         nameRecords.texts.forEach((txt) => {
//           txts[txt.key] = txt.value;
//         });

//         onSubnameMinted({
//           addresses: addrs,
//           texts: txts,
//           chainId: nameChainId,
//           isL2: listingChain.id !== mainnet.id && listingChain.id !== sepolia.id,
//           label: subnameLabel,
//           owner: owner,
//           name: fullName,
//           namehash: namehash(fullName),
//           parentName: activeListing.name,
//           expiry: 0,
//         });
//       }

//       // Reset states and move to success screen
//       setMintTransaction({
//         showTxScreen: false,
//         state: TransactionState.Completed,
//         transactionHash: tx,
//       });
//       setMintBtnState({ waitingForWallet: false });

//       // Move to success screen
//       setCurrentStep(2);
//       onStepChange?.(2);
//       onCompleteRegistration?.();
//     } catch (err) {
//       showErrorModal(err);
//       setMintTransaction({
//         showTxScreen: false,
//         state: TransactionState.Failed,
//         transactionHash: tx,
//       });
//       setMintBtnState({ waitingForWallet: false });
//     }
//   };

//   const handleBack = () => {
//     setCurrentStep(0);
//     onStepChange?.(0);
//   };

//   const handleCancel = () => {
//     onCancel?.();
//   };

//   const handleListingSelected = useCallback(async (suggestion: ListingSuggestion) => {
//     try {

//       console.log("[DEBUG] handleListingSelected called with suggestion:", suggestion);
//       const { label, parentName } = suggestion;
//       const fullName = `${label}.${parentName}`;

//       // Set state variables
//       setSubnameLabel(label);
//       setParentName(parentName);
//       setEnsName(fullName);
//       onNameChange?.(fullName);
//       onSubnameSeach?.(fullName);

//       // Reset states
//       setAvailabilityStatus({ isChecking: true, isAvailable: false });
//       setMintDetails({
//         isChecking: true,
//         price: 0,
//         canMint: false,
//         isFreeMint: false,
//       });
//       setMintValidation({ isFetching: true });

//       // Get the listing (should already be fetched, but fetch again to be sure)
//       const listing = dynamicListing || await listManager.getListedName(parentName);
//       if (!listing) {
//         throw new Error("Listing not found");
//       }
//       setDynamicListing(listing);

//       // Check availability and fetch mint details
//       if (listing && (connectedAddress || address)) {
//         const minterAddress = connectedAddress || address || zeroAddress;

//         // Check availability
//         const fullNameForCheck = `${label}.${parentName}`;
//         const listingChain = getChainForListingV2(listing);
//         const isL2Type = listing.type === ListingType.L2;

//         let available: boolean;
//         try {
//           if (isL2Type) {
//             if (!listingChain || !listingChain.id) {
//               throw new Error(`Invalid chain for L2 listing: ${listing.l2Metadata?.registryNetwork}`);
//             }
//             available = await mintClient.isL2SubnameAvailable(fullNameForCheck, listingChain.id);
//           } else {
//             available = await mintClient.isL1SubnameAvailable(fullNameForCheck);
//           }

//           // Check against existing subnames
//           let _available = available;
//           if (subnames && subnames.length > 0) {
//             const existingSubname = subnames.find((s) => s.label === label);
//             _available = available && existingSubname === undefined;
//           }

//           const basePrice = listing.prices?.basePrice || 0;
//           const statusText = basePrice === 0 ? "free" : "available";

//           setAvailabilityStatus({
//             isChecking: false,
//             isAvailable: _available,
//             status: statusText
//           });
//           onAvailableIndicatorChange({
//             isChecking: false,
//             isAvailable: _available
//           });
//         } catch (err) {
//           showErrorModal(err);
//           setAvailabilityStatus({ isChecking: false, isAvailable: false });
//           onAvailableIndicatorChange({ isChecking: false, isAvailable: false });
//         }

//         try {
//           const mintResult = await mintClient.getMintDetails({
//             label: label,
//             minterAddress: minterAddress,
//             parentName: listing.name || parentName,
//             isTestnet: isTestnet,
//             expiryInYears: duration,
//           });

//           const isFreeMint = mintResult.estimatedPriceEth === 0;
//           const totalPrice = mintResult.estimatedPriceEth + mintResult.estimatedFeeEth;

//           // Update suggestion with actual fee and total price
//           suggestion.fee = mintResult.estimatedFeeEth;
//           suggestion.isStandardFee = mintResult.isStandardFee || false;
//           suggestion.totalPrice = totalPrice;

//           setMintDetails({
//             isChecking: false,
//             price: totalPrice,
//             canMint: mintResult.canMint,
//             isFreeMint,
//           });

//           setMintValidation({
//             isFetching: false,
//             result: {
//               estimatedFeeEth: mintResult.estimatedFeeEth,
//               estimatedPriceEth: mintResult.estimatedPriceEth,
//               isStandardFee: mintResult.isStandardFee || false,
//               canMint: mintResult.canMint,
//             },
//           });

//           // Update initial check
//           setInitialCheck({
//             canMint: mintResult.canMint,
//             isFetching: false,
//             errorMessage: mintResult.validationErrors?.[0],
//           });
//         } catch (err) {
//           showErrorModal(err);
//           setMintDetails({
//             isChecking: false,
//             price: 0,
//             canMint: false,
//             isFreeMint: false,
//           });
//           setMintValidation({ isFetching: false });
//         }
//       }
//     } catch (err) {
//       showErrorModal(err);
//       setDynamicListing(null);
//       setAvailabilityStatus({ isChecking: false, isAvailable: false });
//       setMintDetails({
//         isChecking: false,
//         price: 0,
//         canMint: false,
//         isFreeMint: false,
//       });
//       setMintValidation({ isFetching: false });
//     }
//   }, [
//     listManager,
//     mintClient,
//     connectedAddress,
//     address,
//     subnames,
//     duration,
//     isTestnet,
//     onNameChange,
//     onSubnameSeach,
//     onAvailableIndicatorChange,
//     dynamicListing,
//   ]);

//   // Map listing response to ListingSuggestion format
//   const mapListingToSuggestion = useCallback(
//     (listing: NamespaceListing, label: string): ListingSuggestion => {
//       const basePrice = listing.prices?.basePrice || 0;
//       const l2Network = listing.l2Metadata?.registryNetwork
//         ? (listing.l2Metadata.registryNetwork as ListingNetwork)
//         : undefined;

//       return {
//         label: label,
//         parentName: listing.name,
//         nameNetwork: listing.nameNetwork,
//         listingType: listing.type as ListingType,
//         l2Network: l2Network,
//         price: basePrice,
//         fee: 0, // Will be calculated from mint details
//         isStandardFee: true, // Will be determined from mint details
//         totalPrice: basePrice, // Will be updated with fee
//       };
//     },
//     []
//   );

//   // Process listing when it's fetched and we have a pending label
//   useEffect(() => {
//     if (dynamicListing && pendingLabel && pendingLabel.length > 0) {
//       const suggestion = mapListingToSuggestion(dynamicListing, pendingLabel);
//       handleListingSelected(suggestion).catch((err) => {
//         showErrorModal(err);
//       });
//       setPendingLabel(null);
//     }
//   }, [dynamicListing, pendingLabel, mapListingToSuggestion, handleListingSelected]);

//   // Initial step (first screen)
//   if (currentStep === 0) {
//     return (
//       <div className="ns-onchain-register-container">
//         <InitialStep
//           name={subnameLabel || ""}
//           onNameChange={handleNameChange}
//           onCancel={handleCancel}
//           onRegister={handleInitialRegister}
//           onClose={onClose}
//           domainSuffix={domainSuffix}
//           parentName={parentName || initialParentName}
//           isNameAvailable={
//             availabilityStatus.isChecking
//               ? undefined
//               : availabilityStatus.isAvailable
//           }
//         />
//       </div>
//     );
//   }

//   // Registration step (second screen)
//   if (currentStep === 1) {
//     // Calculate dynamic values based on validation result
//     const estimatedPriceEth = mintValidation.result?.estimatedPriceEth || 0;
//     const estimatedFeeEth = mintValidation.result?.estimatedFeeEth || 0;
//     const isStandardFee = mintValidation.result?.isStandardFee || false;
//     const registrationFeePerYear = isStandardFee
//       ? estimatedPriceEth
//       : estimatedPriceEth + estimatedFeeEth;
//     const registrationFee = registrationFeePerYear * duration;
//     const networkFee = isStandardFee ? 0 : estimatedFeeEth;
//     const totalCost = registrationFee + networkFee;
//     const mintPrice = registrationFeePerYear;
//     const isExpirable = duration > 1;
//     const isMinting = mintBtnState.waitingForWallet || mintTransaction.showTxScreen;

//     return (
//       <div className="ns-onchain-register-container">
//         <RegistrationStep
//           name={subnameLabel || ensName.split(".")[0]}
//           domainSuffix={activeListing?.name || parentName || domainSuffix}
//           owner={owner}
//           duration={duration}
//           registrationFee={mintValidation.result ? formatFloat(registrationFee, 6).toString() : null}
//           networkFee={mintValidation.result ? formatFloat(networkFee, 6).toString() : null}
//           totalCost={mintValidation.result ? formatFloat(totalCost, 6).toString() : null}
//           useAsPrimary={useAsPrimary}
//           profileComplete={profileComplete}
//           profileImageUrl={profileImageUrl}
//           onBack={handleBack}
//           onCancel={handleCancel}
//           onRegister={handleRegister}
//           onClose={onClose}
//           onOwnerChange={handleOwnerChange}
//           onDurationChange={handleDurationChange}
//           onUseAsPrimaryChange={handleUseAsPrimaryChange}
//           onCompleteProfile={onCompleteProfile}
//           mintPrice={mintPrice}
//           isFetchingPrice={mintValidation.isFetching}
//           expiryYears={duration}
//           isExpirable={isExpirable}
//           isRegistering={isMinting}
//         />
//       </div>
//     );
//   }

//   if (currentStep === 2) {
//     const label = subnameLabel || ensName.split(".")[0];
//     const parent = activeListing?.name || parentName || domainSuffix;
//     const fullName = `${label}.${parent}`;

//     return (
//       <div className="ns-onchain-register-container">
//         <OnchainSuccessScreen
//           name={fullName}
//           onClose={onClose}
//           onFinish={handleFinish}
//         />
//       </div>
//     );
//   }
//   return (
//     <div className="ns-onchain-register-container">
//       <InitialStep
//         name={subnameLabel || ""}
//         onNameChange={handleNameChange}
//         onCancel={handleCancel}
//         onRegister={handleInitialRegister}
//         onClose={onClose}
//         domainSuffix={domainSuffix}
//         parentName={parentName || initialParentName}
//         isNameAvailable={
//           availabilityStatus.isChecking
//             ? undefined
//             : availabilityStatus.isAvailable
//         }
//       />
//     </div>
//   );
// }
