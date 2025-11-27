import { Layer2Network, SupportedChainName, Web3Network } from "./networks";

export interface INameListing {
  node: string;
  fullName: string;
  basePrice: number;
  label: string;
  whitelist: string[];
  network: Web3Network
  whitelistType: number;
  reservations: IReservedSubname[];
  specialPrices: ILabelPrice[];
  deadline: number;
  tokenGatedAccess?: ITokenGatedAccess[];
  listingOwner: string;
  isListed: boolean;
  isApproved: boolean;
  listingType?: ListingType;
  specialLabelRules?: ISpecialLabelRules;
  registryNetwork?: Layer2Network
}

export type TokenGatedType = "ERC20" | "ERC1155" | "ERC721";

export interface ILabelPrice {
  letters: number;
  price: number;
}

export interface IReservedSubname {
  label: string;
  isMintable: boolean;
  price: number;
}

export interface ITokenGatedAccess {
  tokenAddress: string;
  tokenId?: string;
  tokenType: TokenGatedType;
  erc20TokenAmount?: number;
  tokenNetwork: SupportedChainName
  erc20TokenDecimals?: number
}

export interface CreateListingRequest {
  label: string;
  basePrice: number;
  whitelist?: string[];
  whitelistType: number;
  reservations?: IReservedSubname[];
  specialPrices?: ILabelPrice[];
  deadline?: number;
  tokenGatedAccess?: ITokenGatedAccess[];
  network: Web3Network;
  listingType?: ListingType;
  specialLabelRules?: ISpecialLabelRules;
  l2Token?: L2TokenCreateRequest;
}

export interface L2TokenCreateRequest {
  tokenSymbol: string;
  tokenName: string;
  listingType: L2ListingType;
  parentControl: ParentControl;
  l2Network: Layer2Network;
}

export interface L2TokenParameters {
  token: string;
  listingName: string;
  ensName: string;
  owner: string;
  resolver: string;
  baseUri: string;
  parentControl: ParentControl;
  listingType: L2ListingType;
}

export enum ParentControl {
  NO_CONTROL,
  CONTROLLABLE,
}

export enum L2ListingType {
  BASIC,
  EXPIRABLE,
}

export interface IMintableListing {
  parentLabel: string;
  parentNamehash: string;
  parentName: string;
  subnameLabel: string;
  mintPrice: number;
  listingOwner: string;
  created: number;
  verificationReason?: any;
  listingType: ListingType;
}

export interface IGetMintableListingsParams {
  subnameLabel: string;
  parentLabel?: string;
  owner?: string;
  minterAddress: string;
  currentPage?: number;
  pageSize?: number;
  network: null;
  registrationPerion?: number;
}

export enum ListingType {
  SELL_UNRUGGABLE = "sellUnruggable",
  RENTING = "renting",
  L2 = "l2",
}

export interface ISpecialLabelRules {
  onlyLettersPrice?: number;
  onlyNumbersPrice?: number;
  onlyEmojiPrice?: number;
}

export interface IListingStats {
  subnamesSold: number
  subnameProfile: number
  subnameVolume: number
}

export interface GetMintableListingsParams {
  subnameLabel: string;
  parentLabel?: string;
  owner?: string;
  minterAddress: string;
  currentPage?: number;
  pageSize?: number;
  network: Web3Network;
  showL2Listings: boolean
}

export interface MintableListing {
  parentLabel: string;
  parentNamehash: string;
  parentName: string;
  subnameLabel: string;
  mintPrice: number;
  listingOwner: string;
  created: number;
  verificationReason?: any;
  listingType: ListingType
  network: Web3Network,
  l2Network: Layer2Network
}