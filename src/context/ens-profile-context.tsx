"use client";
// import { showErrorModal } from "@/components";
import { useListingManager, useMainChain, useNamespaceIndexer } from "@/hooks";
import { useEnsFullNameProfile } from "@/hooks/ens/use-ens-name-profile";
import {
  EnsAddressRecord,
  EnsContenthashRecord,
  EnsContenthashRecordDecoded,
  EnsNameOwner,
  EnsRecords,
  EnsRecordsDecoded,
  EnsTextRecord,
  GenericMintedName,
  IEnsNameFullProfile,
  Layer2Network,
  Web3Network,
} from "@/types";
import { NamespaceListing } from "@/types/list-manager";
import { isSecondLevelDomain } from "@/utils/ens";
import {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Address, zeroAddress } from "viem";


// data name
// texts
// addresses
// contenthash
// ownership
// expiry
// resolver

export interface SubnamesFilter {
  view: "grid" | "list";
  searchString: string;
}

export interface NameProfileStats {
  subnamesMinted: number
  totalSubnames: number
  totalVolume: number
  totalProfit: number
}

const defaultFilter: SubnamesFilter = {
  searchString: "",
  view: "grid",
};

interface EnsProfileState {
  ensName: string;
  ensRecords: EnsRecordsDecoded;
  ownership: EnsNameOwner;
  isFetching: boolean;
  subnames: GenericMintedName[];
  resolver: Address;
  expiryUnix: number;
  isL2: boolean;
  listing: {
    isListed: boolean
    listingData?: NamespaceListing
    isFetching: boolean
  }
  stats: {
    isLoading: boolean
    data: NameProfileStats
  },
  isError?: boolean;
  l2Metadata?: {
    network: Layer2Network;
    resolver: Address;
  };
  isListed: boolean;
}

interface EnsProfileContext extends EnsProfileState {
  onRecordsUpdated?: (records: EnsRecords) => void;
  onSubnameMinted?: (name: GenericMintedName) => void;
  onL2SubnameBurned?: (subname: string | string[]) => void;
  subnameFilter: SubnamesFilter;
  onFilterChanged?: (filter: SubnamesFilter) => void;
}

const defaultContext: EnsProfileContext = {
  ensName: "",
  ensRecords: {
    addresses: [],
    texts: [],
  } as EnsRecordsDecoded,
  isFetching: true,
  ownership: {
    address: zeroAddress,
    isWrapped: false,
  },
  listing: {
    isFetching: true,
    isListed: false
  },
  subnames: [],
  resolver: zeroAddress,
  isL2: false,
  expiryUnix: 0,
  isListed: false,
  subnameFilter: defaultFilter,
  stats: {
    isLoading: true,
    data: {
      subnamesMinted: 0,
      totalProfit: 0,
      totalSubnames: 0,
      totalVolume: 0
    }
  }
};

export const EnsProfileContext = createContext<EnsProfileContext>({
  ...defaultContext,
});

export const EnsProfileContextProvider = ({
  ensName,
  children,
  isSubname
}: {
  ensName: string;
  isSubname: boolean
  children: ReactElement;
}) => {
  const { getFullEnsNameProfileCached, setProfileToCache, getAllSubnames } =
    useEnsFullNameProfile();  


  const [ensProfile, setEnsProfile] = useState<IEnsNameFullProfile>({
    ensName: "",
    expiry: 0,
    records: { addresses: [], texts: [] },
    ownership: { address: zeroAddress, isWrapped: false },
    resolver: zeroAddress,
    subnames: [],
  });
  const [subnames, setSubnames] = useState<GenericMintedName[]>([])
  const [subnameFilter, setSubnameFilter] = useState<SubnamesFilter>({
    ...defaultFilter,
  });
  const indexer = useNamespaceIndexer();
  const { networkName } = useMainChain();
  const [contextLoading, setContextLoading] = useState(true);
  const [contextError, setContextError] = useState(false);
  const [listing, setListing] = useState<{
    isFetching: boolean
    isListed: boolean
    listingData?: NamespaceListing
  }>({
    isFetching: true,
    isListed: false
  })
  const listManager = useListingManager()
  const [stats, setStats] = useState<{
    isLoading: boolean
    data: NameProfileStats
  }>({
    isLoading: true,
    data: {
      subnamesMinted: 0,
      totalProfit: 0,
      totalSubnames: 0,
      totalVolume: 0
    }
  })

  useEffect(() => {

    if (isSubname) {
      // dont fetch stats for subnames
      setStats({...stats, isLoading: false})
      return;
    }

    indexer.getNameStats(ensName).then(res => {
      setStats({
        isLoading: false,
        data: {
          totalVolume: res.totalVolume,
          totalProfit: res.totalPrice,
          totalSubnames: res.totalL1Subnames + res.totalL1Subnames,
          subnamesMinted: res.totalL1Subnames + res.totalL2Subnames
        }
      })
    }).catch(err => {
      // showErrorModal(err);
      console.error(err);
      setStats({
        isLoading: false,
        data: {
          totalProfit: 0,
          totalVolume: 0,
          totalSubnames:0,
          subnamesMinted: 0
        }
      })
    })

  },[subnames])

  useEffect(() => {
    setContextLoading(true);
    getFullEnsNameProfileCached(ensName, networkName, {
      listing: !isSubname,
      subnames: !isSubname,
    })
      .then((res) => {
        setEnsProfile(res);
        setContextLoading(false);
      })
      .catch((err) => {
        setContextError(true);
      });
  }, [networkName, ensName]);

  useEffect(() => {
    if (isSubname) {
      // do not fetch subnames for subnames
      return;
    }
    getAllSubnames(ensName, networkName).then(res => {
      setSubnames(res);
    })

  },[networkName, ensName]);

  useEffect(() => {
    if (isSecondLevelDomain(ensName)) {
      refreshListing(ensName, networkName)
    }
  }, [networkName, ensName])

  const convertRecordsToDecoded = (records: EnsRecords): EnsRecordsDecoded => {
    return {
      texts: records.texts,
      addresses: records.addresses,
      contenthash: records.contenthash
        ? {
            decoded: records.contenthash.value,
            protocolType: records.contenthash.protocol,
          }
        : undefined,
    };
  };

  const handleRecordsUpdated = (ensRecords: EnsRecords) => {
    const _ctx = { ...ensProfile };
    _ctx.records = convertRecordsToDecoded(ensRecords);
    setProfileToCache(ensName, networkName, _ctx);
    setEnsProfile(_ctx);
  };

  const handleSubnameBurned = (name: string | string[]) => {

    if (typeof name === "string") {
      setSubnames(subnames.filter(sub => sub.name !== name))
    } else {
      setSubnames(subnames.filter(sub => !name.includes(sub.name)))
    }
  };

  const handleNameMinted = (name: GenericMintedName) => {
    setSubnames([name, ...subnames]);
  };

  const handleSubnameFilterChange = (filter: SubnamesFilter) => {
    setSubnameFilter(filter);
  };

  const refreshListing = async (ensName: string, network: Web3Network) => {
    setListing({ isFetching: true, isListed: false })
    try {
      const listing = await listManager.getListedName(ensName)
      setListing({
        isFetching: false,
        isListed: listing?.name !== undefined,
        listingData: listing
      })
    } catch(err) {
      setListing({
        isFetching: false,
        isListed: false,
      })
    }
  }

  const context: EnsProfileContext = useMemo(() => {
    return {
      ensName: ensName,
      ensRecords: ensProfile.records,
      expiryUnix: ensProfile.expiry,
      isFetching: contextLoading,
      isL2: ensProfile.l2Metadata !== undefined,
      isListed: listing?.isListed || false,
      ownership: ensProfile.ownership,
      resolver: ensProfile.resolver,
      subnames: subnames,
      isError: contextError,
      listing: listing,
      l2Metadata: ensProfile.l2Metadata!!,
      onRecordsUpdated: handleRecordsUpdated,
      onL2SubnameBurned: handleSubnameBurned,
      onSubnameMinted: handleNameMinted,
      onFilterChanged: handleSubnameFilterChange,
      subnameFilter: subnameFilter,
      stats: stats
    };
  },[ensProfile, subnames, contextError, contextLoading, subnameFilter, listing, stats])
  
  return (
    <EnsProfileContext.Provider value={context}>
      {children}
    </EnsProfileContext.Provider>
  );
};

export const useEnsProfileContext = () => useContext(EnsProfileContext);