import { Layer2Network, Web3Network } from "@/types";
import {
  getEnsContracts as _getEnsContracts,
  getL2NamespaceContracts as _getL2Contracts,
  getL1NamespaceContracts as _getL1Contracts,
} from "@namespacesdk/addresses";
import { getChain } from "../chains";
import { AppEnv } from "@/environment";

export const getL1NamespaceContracts = () => {
  return _getL1Contracts(AppEnv.isTestnet);
};

export const getEnsContracts = (network: Web3Network) => {
  const isTestnet = network === "sepolia";
  return _getEnsContracts(isTestnet);
};

export const getL2NamespaceContracts = (network: Layer2Network) => {
  return _getL2Contracts(getChain(network)?.id);
};
