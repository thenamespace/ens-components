import { EnsName, EnsRecords, GenericMintedName, IEnsNameFullProfile, isTestnet } from "@/types";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useENS } from "../ens/use-ens";
import {
  useEnsFullNameProfile,
} from "../ens/use-ens-name-profile";
import { useMainPublicClient } from "../web3/use-main-public-client";
import { useMainChain } from "../web3/use-main-chain";
import { useAccount } from "wagmi";

export interface INamespaceAccount {
  primaryName: PrimaryNameState
  handleRecordsUpdated: (ensRecords:EnsRecords) => void
}

export interface PrimaryNameState {
  isPresent: boolean;
  isError?: boolean
  isFetching: boolean;
  data?: IEnsNameFullProfile;
}

export interface AccountNamesState {
    isFetching: boolean;
    isError: boolean;
    ensNames: EnsName[];
    subnames: GenericMintedName[];
}

export interface AccountEFPState {
    isFetching: boolean
    isError: boolean
    followers: number
    following: number
}


export const useNamespaceAccount = (
  ownerAddress?: Address
): INamespaceAccount => {
  const pc = useMainPublicClient();
  const { getFullEnsNameProfileCached, setProfileToCache } = useEnsFullNameProfile();
  const { networkName } = useMainChain()
  const [primaryName, setPrimaryName] = useState<PrimaryNameState>({
    isFetching: true,
    isPresent: false,
    isError: false,
  });

  useEffect(() => {
    
    if (!ownerAddress) {
      return;
    }

    const fetchProfile = async () => {
      try {
        const name = await pc!.getEnsName({address: ownerAddress})
        let ensProfile: IEnsNameFullProfile | undefined = undefined;
        if (name) {
          const profile = await getFullEnsNameProfileCached(name, networkName, {
            listing: false,
            subnames: false,
          });
          ensProfile = profile;
        }
        setPrimaryName({
          isFetching: false,
          isPresent: ensProfile !== undefined,
          data: ensProfile,
          isError: false,
        });
      } catch (err) {
        setPrimaryName({
          isError: true,
          isFetching: false,
          isPresent: false,
        });
      }
    };

    fetchProfile();
  }, [ownerAddress, networkName]);

  const handleRecordsUpdated = (newRecords: EnsRecords) => {
    if (primaryName.data !== undefined) {
        const _primaryName = {...primaryName};
        _primaryName.data!.records = newRecords;

        if (_primaryName.data !== undefined) {
          setPrimaryName(_primaryName);
          setProfileToCache(_primaryName.data.ensName, networkName, _primaryName.data);
        }
    }
  }

  return {
    primaryName,
    handleRecordsUpdated
  };
};
