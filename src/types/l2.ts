import { Layer2Network } from "./networks";

export interface IL2Node {
  label: string;
  namehash: string;
  name: string;
  owner: string;
  addresses: Record<string, string>;
  texts: Record<string, string>;
  contenthash?: string;
  chainId: number;
  expiry?: number
  mintTransaction?: {
    price: number;
    paymentReceiver: string;
  };
}


export interface L2Registry {
  parentControl: number
  label: string
  TLD: string
  network: Layer2Network
  deployment: {
    address: string
  }
  isDeployed: boolean
  expirableType: number
  owner: string
  tokenName: string
  tokenSymbol: string
}

export enum L2ExpirableType {
  Expirable = 1,
  NotExpirable = 0
}

