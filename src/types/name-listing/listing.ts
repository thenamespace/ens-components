import { Address } from "viem";
import {
  ListingCurrencyType,
  ListingVersionType,
  WhitelistType,
  DeadlineType,
  ListingTokenType,
} from "./enums";
import { L2NameRegistryDTO } from "./l2-name-registry";
import {SupportedNetwork} from  "../networks";

export interface WhitelistDTO {
  type: WhitelistType;
  wallets: Address[];
}

export interface DeadlineDTO {
  timestamp: number;
  type: DeadlineType;
}

export interface SpecialPriceDTO {
  letterOnlyPrice?: number;
  numberOnlyPrice?: number;
  emojiOnlyPrice?: number;
}

export interface LabelPriceDTO {
  numberOfLetters: number;
  price: number;
}

export interface ListingPricesDTO {
  basePrice: number;
  labelPrices?: LabelPriceDTO[];
  specialPrices?: SpecialPriceDTO;
}

export interface TokenGatedAccessDTO {
  tokenType: ListingTokenType;
  tokenAddress: string;
  tokenId?: string;
  erc20MinTokenBalance?: number;
  erc20TokenDecimals?: number;
  tokenNetwork: SupportedNetwork;
}

export interface ReservedLabelDTO {
    label: string;
    price?: number;
    isMintable: boolean;
}

export class ListingMetadataDTO {
    description?: string
    holderBenefits?: string
}

export interface ListingDTO {
  name: string;
  namehash: string;
  nameNetwork: SupportedNetwork;
  type: ListingVersionType;
  currency: ListingCurrencyType;
  createdAt?: string;
  updatedAt?: string;
  whitelist?: WhitelistDTO;
  deadline?: DeadlineDTO;
  prices: ListingPricesDTO;
  isVerified: boolean;
  owner: string;
  paymentWallet: string;
  tokenGatedAccess?: TokenGatedAccessDTO[];
  metadata?: ListingMetadataDTO;
  reservations?: ReservedLabelDTO[];
}

export interface UpdateListingRequestDTO {
  name: string;
  nameNetwork: SupportedNetwork;
  whitelist?: WhitelistDTO;
  deadline?: DeadlineDTO;
  prices: ListingPricesDTO;
  tokenGatedAccess?: TokenGatedAccessDTO[];
  reservations?: ReservedLabelDTO[];
}

export interface FullListingDTO extends ListingDTO {
  l2Metadata?: L2NameRegistryDTO;
}
