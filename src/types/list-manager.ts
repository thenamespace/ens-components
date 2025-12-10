import { Address } from "viem";

export enum ListingNetwork {
  Mainnet = "MAINNET",
  Sepolia = "SEPOLIA",
  Optimism = "OPTIMISM",
  Base = "BASE",
  BaseSepolia = "BASE_SEPOLIA",
}

export interface NamespaceListing {
  name: string;
  namehash: string;
  nameNetwork: ListingNetwork;
  type: ListingType;
  currency: ListingCurrency;
  createdAt?: string;
  updatedAt?: string;
  whitelist?: ListingWhitelist;
  deadline?: ListingDeadline;
  prices: ListingPrices;
  isVerified: boolean;
  owner: string;
  paymentWallet: string;
  tokenGatedAccess?: TokenGatedAccess[];
  metadata?: ListingMetadata;
  reservations?: ReservedLabel[];
  l2Metadata?: L2Registry;
}

export interface ListingWhitelist {
  type: WhitelistType;
  wallets: Address[];
}

export interface ListingDeadline {
  type: DeadlineType;
  timestamp: number;
}

export enum ListingType {
  L1 = "L1",
  L2 = "L2",
}

export enum ListingCurrency {
  ETH = "ETH",
  DOLLAR = "DOLLAR",
}

// Whitelisting
export enum WhitelistType {
  ONLY_WHITELISTED = 1,
  FREE_MINT = 2,
}

export interface ListingWhitelist {
  type: WhitelistType;
  wallets: Address[];
}

// Listing Deadline
export enum DeadlineType {
  CANT_MINT_AFTER_EXPIRY = 1,
}

export interface ListingDeadline {
  type: DeadlineType;
  timestamp: number;
}

// Listing prices
export interface SpecialPrices {
  letterOnlyPrice?: number;
  numberOnlyPrice?: number;
  emojiOnlyPrice?: number;
}

export interface LabelPrice {
  numberOfLetters: number;
  price: number;
}

export interface ListingPrices {
  basePrice: number;
  labelPrices?: LabelPrice[];
  specialPrices?: SpecialPrices;
}

// Token Gated Access
export enum ListingTokenType {
  ERC20 = "ERC20",
  ERC721 = "ERC721",
  ERC1155 = "ERC1155",
}

export interface TokenGatedAccess {
  tokenType: ListingTokenType;
  tokenAddress: string;
  tokenId?: string;
  erc20MinTokenBalance?: number;
  erc20TokenDecimals?: number;
  tokenNetwork: ListingNetwork;
}

export interface ListingMetadata {
  description?: string;
  holderBenefits?: string;
}

// Reserved subnames
export interface ReservedLabel {
  label: string;
  price?: number;
  isMintable: boolean;
}

export interface L2Registry {
  isBurnable: boolean;
  isExpirable: boolean;
  registryNetwork: ListingNetwork;
  registryName: string;
  registrySymbol: string;
  isDeployed: boolean;
  registryAddress?: string;
  name: string;
  nameNetwork: ListingNetwork;
  registryOwner: string;
}

export interface CreateL2RegistryRequest {
  tokenName: string;
  tokenSymbol: string;
  isBurnable: boolean;
  isExpirable: boolean;
  tokenOwner?: string;
  tokenNetwork: ListingNetwork;
}

export interface CreateListingRequest {
  name: string;
  nameNetwork: ListingNetwork;
  type: ListingType;
  currency: ListingCurrency;
  whitelist?: ListingWhitelist;
  deadline?: ListingDeadline;
  prices: ListingPrices;
  paymentWallet?: string;
  tokenGatedAccess?: TokenGatedAccess[];
  metadata?: ListingMetadata;
  reservations?: ReservedLabel[];
  l2Registry?: CreateL2RegistryRequest;
}

export interface ListingStatusDTO {
  name: string;
  nameNetwork: ListingNetwork;
  listingCreated: boolean;
  listingVerified: boolean;
  type: ListingType;
  registryDeployed: boolean;
  approvalGiven: boolean;
  nameWrapped: boolean;
  l2Network: ListingNetwork
  resolverSet: boolean
  resolverConfigured: boolean
}

export interface GetRegistryParametersRequest {
  ensName: string;
  isTestnet?: boolean;
  registryNetwork: ListingNetwork;
}

export interface GetRegistryParametersResponse {
  parameters: {
    tokenName: string;
    tokenSymbol: string;
    label: string;
    TLD: string;
    owner: string;
    parentControl: number;
    expirableType: number;
    signatureExpiry: number;
  };
  signature: string
}

export interface ListingSuggestion {
  label: string
  parentName: string
  nameNetwork: ListingNetwork
  listingType: ListingType
  l2Network?: ListingNetwork
  price: number
  fee: number
  isStandardFee: boolean
  totalPrice: number
}

export interface ListingSuggestionRequest {
  label: string
  parentName?: string
  page?: number
  size?: number
  minterAddress: Address
  listingType?: ListingType;
  nameNetwork: ListingNetwork
}