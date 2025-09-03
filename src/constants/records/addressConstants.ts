import { ChainName } from "@/components";
import { convertEVMChainIdToCoinType } from "@/utils";
import { isAddress } from "viem";
import { base, arbitrum, polygon, optimism, zora, mainnet } from "viem/chains";

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
    placeholder: "7Mi3m...sy7dw"
  },
  {
    isEMV: false,
    label: "Solana",
    coinType: 501,
    chainName: "sol",
    chainId: 501,
    placeholder: "1BH2S...Y3x33"
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
