import { getEnsContracts } from "@/web3";
import { useMainChain } from "../web3/use-main-chain"

export const useEnsContractAddresses = () => {
    const {networkName} = useMainChain();

    return getEnsContracts(networkName);
}