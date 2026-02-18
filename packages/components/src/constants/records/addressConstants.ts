import { ChainName } from "@/types";
import { convertEVMChainIdToCoinType } from "@/utils";
import { isAddress } from "viem";

import {
  base,
  arbitrum,
  polygon,
  optimism,
  zora,
  mainnet,
  celo,
} from "viem/chains";
import { IconName } from "@/components";

export interface SupportedEnsAddress {
  validateFunc?: (value: string) => boolean;
  isEMV?: boolean;
  label: string;
  coinType: number;
  chainId?: number;
  chainName: ChainName;
  placeholder?: string;
}

const isValidEmvAddress = (value: string): boolean => {
  return isAddress(value);
};

// Simple BTC address validation (P2PKH, P2SH, Bech32, Bech32m)
const isValidBtcAddress = (value: string): boolean => {
  if (!value || value.length < 26 || value.length > 62) return false;
  // P2PKH (starts with 1), P2SH (starts with 3), Bech32/Bech32m (starts with bc1)
  const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$/;
  return btcRegex.test(value);
};

// Simple Solana address validation (base58, 32-44 chars)
const isValidSolAddress = (value: string): boolean => {
  if (!value || value.length < 32 || value.length > 44) return false;
  const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solRegex.test(value);
};

export const supportedAddresses: SupportedEnsAddress[] = [
  {
    isEMV: true,
    label: "Ethereum",
    coinType: 60,
    chainId: mainnet.id,
    chainName: "eth",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
  {
    isEMV: false,
    label: "Bitcoin",
    coinType: 0,
    chainName: "bitcoin",
    chainId: 0,
    placeholder: "7Mi3m...sy7dw",
    validateFunc: isValidBtcAddress,
  },
  {
    isEMV: false,
    label: "Solana",
    coinType: 501,
    chainName: "sol",
    chainId: 501,
    placeholder: "1BH2S...Y3x33",
    validateFunc: isValidSolAddress,
  },
  {
    isEMV: true,
    label: "Base",
    coinType: convertEVMChainIdToCoinType(base.id),
    chainId: base.id,
    chainName: "base",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
  {
    isEMV: true,
    label: "Arbitrum",
    coinType: convertEVMChainIdToCoinType(arbitrum.id),
    chainId: arbitrum.id,
    chainName: "arb",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
  {
    isEMV: true,
    label: "Celo",
    coinType: convertEVMChainIdToCoinType(celo.id),
    chainId: arbitrum.id,
    chainName: "celo",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
  {
    isEMV: true,
    label: "Polygon",
    coinType: convertEVMChainIdToCoinType(polygon.id),
    chainId: polygon.id,
    chainName: "matic",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
  {
    isEMV: true,
    label: "Optimism",
    coinType: convertEVMChainIdToCoinType(optimism.id),
    chainId: optimism.id,
    chainName: "op",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
  {
    isEMV: true,
    label: "Zora",
    coinType: convertEVMChainIdToCoinType(zora.id),
    chainId: zora.id,
    chainName: "zora",
    validateFunc: isValidEmvAddress,
    placeholder: "0x1D8...c19f8",
  },
];

export const getSupportedAddressMap = (): Record<
  number,
  SupportedEnsAddress
> => {
  const map: Record<number, SupportedEnsAddress> = {};

  supportedAddresses.forEach(addr => {
    map[addr.coinType] = addr;
  });

  return map;
};

export const getSupportedAddressByCoin = (
  coin: number
): SupportedEnsAddress | undefined => {
  return supportedAddresses.find(addr => addr.coinType === coin);
};

export const getSupportedAddressByName = (
  name: ChainName
): SupportedEnsAddress | undefined => {
  return supportedAddresses.find(addr => addr.chainName === name);
};

export const getSupportedAddressByChainId = (
  chainId: number
): SupportedEnsAddress | undefined => {
  return supportedAddresses.find(addr => addr.chainId === chainId);
};
export type TextCategory = "profile" | "social";
export interface SupportedText {
  iconUrl: string;
  key: string;
  category: TextCategory;
  label: string;
  placeholder: string;
  iconName?: IconName;
  hidden?: boolean;
}
