import { useENSResolver } from "@/hooks";
import { EnsRecords } from "@/types";
import { useEffect, useState } from "react";
import { Address, zeroAddress } from "viem";
import { mainnet, sepolia } from "viem/chains";
import { useAccount } from "wagmi";
import { ConnectAndSetChain, Alert } from "@/components/molecules";
import { ShurikenSpinner } from "@/components/atoms";
import "./EnsRecordsForm.css";
import { EnsUpdateRecordsForm } from "./EnsUpdateRecordsForm";

export interface EnsRecordsFormProps {
  // Optional, if not provided
  // the resolver chain will be decided based upon "isTestnet" parameter
  resolverChainId?: number;
  // Optional, if not provided
  // the form will query ens registry
  resolverAddress?: Address;
  isTestnet?: boolean;
  // Full ens name
  name: string;
  existingRecords: EnsRecords;
  noBorder?: boolean;
  className?: string;
}

export const EnsRecordsForm = ({
  name,
  existingRecords,
  resolverChainId,
  isTestnet,
  resolverAddress,
  noBorder,
  className,
}: EnsRecordsFormProps) => {
  const mainnetChainId = isTestnet ? sepolia.id : mainnet.id;
  const resolverChain = resolverChainId ? resolverChainId : mainnetChainId;
  const { chain, isConnected } = useAccount();

  const isConnectedAndOnRequiredChain =
    isConnected && chain?.id === resolverChain;

  const { isResolverSupported, getResolverAddress } = useENSResolver({
    resolverChainId: resolverChain,
    isTestnet,
  });
  const [resolverState, setResolverState] = useState<{
    address?: Address;
    isSupported: boolean;
    isChecking: boolean;
    error?: string;
  }>({
    address: resolverAddress || zeroAddress,
    isSupported: false,
    isChecking: true,
  });

  useEffect(() => {
    checkResolver();
  }, [resolverAddress, resolverChain]);

  const checkResolver = async () => {
    setResolverState({
      ...resolverState,
      isChecking: true,
      error: undefined,
    });
    
    try {
      let currentResolverAddress = resolverAddress;
      if (currentResolverAddress === undefined) {
        currentResolverAddress = await getResolverAddress(name);
      }

      if (!currentResolverAddress || currentResolverAddress === zeroAddress) {
        setResolverState({
          address: undefined,
          isSupported: false,
          isChecking: false,
          error: "Cannot find resolver address for provided name",
        });
        return;
      }

      const isSupported = await isResolverSupported(currentResolverAddress);
      setResolverState({
        isChecking: false,
        isSupported,
        address: currentResolverAddress,
        error: undefined,
      });
    } catch (err) {
      console.error(err);
      setResolverState({
        address: undefined,
        isSupported: false,
        isChecking: false,
        error: "Something went wrong!",
      });
    }
  };

  return (
    <div
      className={`ens-records-form-container ${className || ""} ${noBorder ? "no-boder" : ""}`}
    >
      <ConnectAndSetChain
        currentChainID={chain?.id}
        requiredChainID={resolverChain}
      />
      
      {resolverState.isChecking && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px" }}>
          <ShurikenSpinner size={40} />
        </div>
      )}

      {!resolverState.isChecking && resolverState.error && (
        <Alert variant="error">
          {resolverState.error}
        </Alert>
      )}

      {!resolverState.isChecking && !resolverState.error && isConnectedAndOnRequiredChain && (
        <EnsUpdateRecordsForm
          existingRecords={existingRecords}
          name={name}
          resolverAddress={resolverState.address}
          resolverChainId={resolverChain}
          onRecordsUpdated={() => {}}
        />
      )}
    </div>
  );
};
