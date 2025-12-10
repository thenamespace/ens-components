import { useEFP, useMainChain, useNamespaceAccount } from "@/hooks";
import { PropsWithChildren, createContext, useContext, useMemo } from "react";
import { Address, Chain, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { AuthContextProvider, useAuthContext } from "./auth-context";
import { EnsName, EnsRecords, GenericMintedName, IEnsNameFullProfile } from "@/types";

interface IConnectedAccountContext {
  connectedAddress?: Address;
  isConnected: boolean;
  isAuthenticated: boolean;
  chain?: Chain;
  primaryName: {
    isFetching: boolean;
    isError?: boolean;
    isPresent: boolean;
    data?: IEnsNameFullProfile;
  };
  handleRecordsUpdated?: (records:EnsRecords) => void 
}

const initialContext: IConnectedAccountContext = {
  isConnected: false,
  isAuthenticated: false,
  primaryName: {
    isFetching: true,
    isError: false,
    isPresent: false,
  },
};

const ConnectedPrincipalContext = createContext<IConnectedAccountContext>({
  ...initialContext,
});

export const ConnectedPrincipalProvider = ({ children }: PropsWithChildren) => {
  const { address, chain, isConnected } = useAccount();
  const { primaryName, handleRecordsUpdated } = useNamespaceAccount(address);

  const ctx: IConnectedAccountContext = useMemo(() => {
    return {
      isAuthenticated: false,
      isConnected: isConnected,
      chain: chain,
      connectedAddress: address,
      primaryName: primaryName,
      handleRecordsUpdated: handleRecordsUpdated
    };
  }, [primaryName, address, chain]);

  return (
    <ConnectedPrincipalContext.Provider value={ctx}>
      <AuthContextProvider>{children}</AuthContextProvider>
    </ConnectedPrincipalContext.Provider>
  );
};

export const useConnectedPrincipal = () =>
  useContext(ConnectedPrincipalContext);
