import { Address, Hash } from "viem";
import { Layer2Network, Web3Network } from "./networks";

export type MintDeniedReason =
  | "SUBNAME_TAKEN"
  | "MINTER_NOT_TOKEN_OWNER"
  | "MINTER_NOT_WHITELISTED"
  | "LISTING_EXPIRED"
  | "SUBNAME_RESERVED"
  | "VERIFIED_MINTER_ADDRESS_REQUIRED"
  | "UNKNOWN_REASON"


export const MintDeniedMessage: Record<MintDeniedReason, string> = {
  LISTING_EXPIRED: "Listing has expired.",
  MINTER_NOT_TOKEN_OWNER: "You don't own required token",
  MINTER_NOT_WHITELISTED: "You are not whitelisted",
  SUBNAME_RESERVED: "Subname is reserved",
  SUBNAME_TAKEN: "Subname is already taken",
  VERIFIED_MINTER_ADDRESS_REQUIRED: "Verification required",
  UNKNOWN_REASON: "Unknown reason"
}

export interface SimulateMintRequest {
  label: string;
  parentLabel: string;
  network: Web3Network;
  subnameOwner: Address;
  minter: Address;
}

export interface SimulateMintResponse {
  canMint: boolean;
  estimatedPrice: number;
  estimatedFee: number;
  validationErrors: MintDeniedReason[];
  requiresVerifiedMinter: boolean;
  isStandardFee: boolean;
}

export interface L2MintParametersResponse {
  parameters: L2MintParameters;
  signature: Hash;
}

export interface L2MintParametersRequest {
  mainNetwork: Web3Network;
  tokenNetwork: Layer2Network;
  parentLabel: string;
  label: string;
  owner: string;
  expiry?: number;
}

export interface L2MintParameters {
  label: string;
  parentLabel: string;
  resolver: Address;
  owner: string;
  expiry: number;
  price: string;
  fee: string;
  paymentReceiver: Address;
}

export interface MintParameters {
  subnameLabel: string;
  parentNode: string;
  resolver: string;
  subnameOwner: string;
  fuses: number;
  mintPrice: string;
  mintFee: string;
  expiry: number;
  ttl: number;
}

export interface MintParametersRequest {
  label: string;
  parentLabel: string;
  subnameOwner: string;
  resolver?: string;
  network: Web3Network;
  registrationPeriod?: number;
}

export interface MintParametersResponse {
  parameters: MintParameters;
  signature: Hash;
}

export interface MintedL1SubnameEvent {
  chainId: number
  subnameLabel: string
  mintFee: number
  mintPrice: number
  parentNode: string
  paymentReceiver: string
  sender: string
  subnameOwner: string
  tx: string
}