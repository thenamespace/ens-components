// import { showErrorModal } from "@/components";
import {
  useENS,
  useListingManager,
  useMainChain,
  useMainPublicClient,
  useNamespaceIndexer,
} from "@/hooks";
import { EnsName, GenericMintedName, IL2Node } from "@/types";
import { NamespaceListing } from "@/types/list-manager";
import { L2SubnameResponse } from "@namespacesdk/indexer";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Address, parseAbi, zeroAddress } from "viem";

interface ISelectNameState {
  selectedName?: string;
  isSelected: boolean;
}

interface IEnsNamesState {
  ensNames: EnsName[];
  subnames: GenericMintedName[];
  isLoading: boolean;
  isError: boolean;
}

interface IListedNamesState {
  isLoading: boolean;
  isError: boolean;
  items: NamespaceListing[];
}

interface IL1ContractApprovalState {
  isLoading: boolean;
  isApproved: boolean;
}

interface IAccountContext {
  // add names here in the future
  listModalOpen: boolean;
  selectedName?: string;
  accountOwner: Address;
  namesState: IEnsNamesState;
  listingState: IListedNamesState;
  selectNameState: ISelectNameState;
  updateSelectNameState: (state: ISelectNameState) => void;
  toggleListModal: (open: boolean, ensName: string) => void;
  setApprovalGiven: (value: boolean) => void;
  handleRemoveListing: (name: string) => void;
  contextWrapped: boolean;
  handleListingCreated: (ensName: string, verified: boolean) => void;
  handleListingVerified: (ensName: string) => void;
}

interface AccountContextProps extends PropsWithChildren {
  accountOwner: Address;
  isConnectedUserAccount?: boolean;
}

const defaultCtx: IAccountContext = {
  listModalOpen: false,
  accountOwner: zeroAddress,
  listingState: {
    isError: false,
    isLoading: false,
    items: [],
  },
  namesState: {
    ensNames: [],
    isError: false,
    isLoading: false,
    subnames: [],
  },
  selectNameState: {
    isSelected: false,
  },
  contextWrapped: false,
  toggleListModal: () => {},
  setApprovalGiven: (val: boolean) => {},
  updateSelectNameState: () => {},
  handleRemoveListing: () => {},
  handleListingCreated: (ensName: string) => {},
  handleListingVerified: (ensName: string) => {},
};

const AccountContext = createContext<IAccountContext>({ ...defaultCtx });

export const AccountContextProvider = ({
  accountOwner,
  children,
  isConnectedUserAccount,
}: AccountContextProps) => {
  const { network, isTestnet, networkName } = useMainChain();
  const [listedNames, setListedNames] = useState<IListedNamesState>({
    ...defaultCtx.listingState,
  });
  const ens = useENS();
  const [l1MinterApprovalGiven, setL1MinterApprovalGiven] =
    useState<IL1ContractApprovalState>({
      isApproved: false,
      isLoading: false,
    });
  const listManager = useListingManager();
  const [ensNames, setEnsNames] = useState<IEnsNamesState>({
    ...defaultCtx.namesState,
  });
  const indexer = useNamespaceIndexer()
  const [listModalOpen, setListModalOpen] = useState<{
    selectedName?: string;
    isOpen: boolean;
  }>({
    isOpen: false,
  });
  const [selectNameState, setSelectNameState] = useState<ISelectNameState>({
    isSelected: false,
  });

  useEffect(() => {
    // fetching ens owner names

    if (!accountOwner || accountOwner === zeroAddress) {
      return;
    }

    const fetchOwnedNames = async () => {
      setEnsNames({
        ensNames: [],
        subnames: [],
        isLoading: true,
        isError: false,
      });

      try {
        const nameOwner = accountOwner;
        const l1NamesPromise = ens.getAllEnsNames(nameOwner);
        // We should Add pagination and separate subnames by l1 and l2
        // add indexer for l2 subnames
        // TODO, separate subnames between l1 and l2 and add pagination
        const l2SubnamesPromise = indexer.getL2Subnames({
          size: 9999,
          owner: nameOwner,
          isTestnet: isTestnet,
        });

        const subnames: GenericMintedName[] = [];
        const result = await Promise.all([l1NamesPromise, l2SubnamesPromise]);

        const [ensNames, l2Subnames] = result;
        addL1SubnameToGenericName(ensNames.subnames, subnames);
        addL2SubnameToGenericNames(l2Subnames.items, subnames);

        setEnsNames({
          ensNames: ensNames.names,
          isError: false,
          isLoading: false,
          subnames: subnames,
        });
      } catch (err) {
        setEnsNames({ ...ensNames, isLoading: false, isError: true });
      }
    };

    fetchOwnedNames();
  }, [accountOwner, network]);

  useEffect(() => {
    if (!isConnectedUserAccount || !accountOwner) {
      // This data is not required if
      // we're not looking at other account/not current user
      return;
    }

    // We fetch all the listed names for an account
    const fetchListings = async () => {
      setListedNames({
        isError: false,
        isLoading: true,
        items: [],
      });
      try {
        const listings = await listManager.getListedNames({
          nameNetwork: listManager.toListingNetwork(network),
          owner: accountOwner,
          page: 1,
          size: 255,
        });
        setListedNames({
          isError: false,
          isLoading: false,
          items: listings.items,
        });
      } catch (err) {
        setListedNames({
          isError: true,
          isLoading: false,
          items: [],
        });
        // showErrorModal(err);
        console.error(err);
      }
    };

    fetchListings();
  }, [accountOwner]);

  const toggleListModal = (open: boolean, ensName?: string) => {
    setListModalOpen({
      isOpen: open,
      selectedName: ensName,
    });
  };

  const setApprovalGiven = (val: boolean) => {
    setL1MinterApprovalGiven({
      isApproved: val,
      isLoading: false,
    });
  };

  const handleRemoveListing = (name: string) => {
    const _listingState = { ...listedNames };
    _listingState.items = _listingState.items.filter((i) => i.name !== name);
    setListedNames(_listingState);
  };

  const handleListingCreated = async (ensName: string, verified: boolean) => {
    try {
      const name = await listManager.getListedName(ensName);

      if (verified) {
        name.isVerified = true;
      }

      const _existingListing = listedNames.items.find(i => i.name === ensName);
      let _updatedListings = [];

      if (_existingListing) {
        _updatedListings = [...listedNames.items];
        for (let i = 0; i < _updatedListings.length; i++) {
          if (_updatedListings[i].name === ensName) {
            _updatedListings[i] = name;
          }
        }
      } else {
        _updatedListings = [...listedNames.items, name];
      }
      
      
      setListedNames({
        isError: false,
        isLoading: false,
        items: _updatedListings,
      });
    } catch (err) {}
  };

  const handleListingVerified = async (ensName: string) => {
    const _listings = [...listedNames.items];
    for (let i = 0; i < _listings.length; i++) {
      if (_listings[i].name === ensName) {
        _listings[i].isVerified = true
      }
    }
    setListedNames({
      isError: false,
      isLoading: false,
      items: _listings,
    });
  }

  return (
    <AccountContext.Provider
      value={{
        listModalOpen: listModalOpen.isOpen,
        toggleListModal: toggleListModal,
        accountOwner: accountOwner,
        selectedName: listModalOpen.selectedName,
        listingState: listedNames,
        namesState: ensNames,
        selectNameState: selectNameState,
        updateSelectNameState: (state: ISelectNameState) =>
          setSelectNameState(state),
        setApprovalGiven: setApprovalGiven,
        contextWrapped: true,
        handleRemoveListing: handleRemoveListing,
        handleListingCreated: handleListingCreated,
        handleListingVerified: handleListingVerified,
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);

export const addL2SubnameToGenericNames = (
  items: L2SubnameResponse[],
  arr: GenericMintedName[]
) => {
  items.forEach((sub) => {
    arr.push({
      addresses: sub.records.addresses,
      chainId: sub.chainId,
      isL2: true,
      label: sub.name.split(".")[0],
      name: sub.name,
      namehash: sub.namehash,
      owner: sub.owner,
      parentName: sub.name,
      texts: sub.records.texts,
      expiry: sub.expiry,
      mintTransaction: sub.metadata,
    });
  });
};

export const addL1SubnameToGenericName = (
  items: EnsName[],
  arr: GenericMintedName[]
) => {
  items.forEach((sub) => {
    arr.push({
      addresses: {},
      chainId: 1,
      isL2: false,
      label: sub.label,
      name: sub.name,
      namehash: sub.namehash,
      owner: sub.owner,
      parentName: sub.parentName,
      texts: {},
      expiry: sub.expiry,
    });
  });
};
