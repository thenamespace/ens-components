import { useListingManager, useMainChain } from "@/hooks";
import {
  L2Registry,
  ListingCurrency,
  ListingDeadline,
  ListingNetwork,
  ListingPrices,
  ListingType,
  ListingWhitelist,
  NamespaceListing,
  ReservedLabel,
  TokenGatedAccess,
  WhitelistType,
} from "@/types/list-manager";
import {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Address, isAddress, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { isEqual } from "lodash";
import { equalsIgnoreCase } from "@/utils";
import { ListingCurrencyType } from "@/types";

export interface IListingFormContent {
  prices: ListingPrices;
  whitelist?: ListingWhitelist;
  tokenGatedAccess?: TokenGatedAccess;
  deadline?: ListingDeadline;
  currency: ListingCurrency;
  reservations: ReservedLabel[];
  listingType: ListingType;
}

export interface IListingFeatures {
  whitelist: boolean;
  deadline: boolean;
  tokenGatedAccess: boolean;
}

export enum ListingInputGroups {
  Setup = "Setup",
  Prices = "Prices",
  Reservations = "Reservations",
  Deadline = "Deadline",
  Whitelist = "Whitelist",
  TokenGatedAccess = "TokenGatedAccess",
}

export interface IListingFormContext extends IListingFormContent {
  setPrices?: (prices: ListingPrices) => void;
  setCurrency?: (currency: ListingCurrency) => void;
  setDeadline?: (deadline: ListingDeadline) => void;
  removeDeadline?: () => void;
  setWhitelist?: (whitelist: ListingWhitelist) => void;
  setReservations?: (reservations: ReservedLabel[]) => void;
  removeWhitelist?: () => void;
  toggleFeature?: (feature: keyof IListingFeatures, toggle: boolean) => void;
  setTokenGatedAccess?: (tga: TokenGatedAccess) => void;
  setListingType?: (type: ListingType) => void;
  setL2Registry?: (registry: Partial<L2Registry>) => void;
  setPaymentWallet?: (val: Address) => void;
  features: IListingFeatures;
  existingListing?: NamespaceListing;
  ensName: string;
  isStateUpdated: boolean;
  l2Registry?: Partial<L2Registry>;
  paymentWallet: Address;
  listingInputsValid: Record<ListingInputGroups, boolean>;
  refetch: () => void;
}

const defaultState: IListingFormContext = {
  prices: {
    basePrice: 0,
  },
  reservations: [],
  currency: ListingCurrency.ETH,
  features: {
    deadline: false,
    whitelist: false,
    tokenGatedAccess: false,
  },
  whitelist: {
    type: WhitelistType.FREE_MINT,
    wallets: [],
  },
  isStateUpdated: false,
  listingType: ListingType.L1,
  ensName: "",
  paymentWallet: zeroAddress,
  refetch: () => {},
  listingInputsValid: {
    Deadline: true,
    Setup: true,
    Prices: true,
    Reservations: true,
    TokenGatedAccess: true,
    Whitelist: true,
  },
};

const ListingFormContext = createContext<IListingFormContext>({
  ...defaultState,
});

export const ListingFormContextProvider = ({
  ensName,
  children,
  selectedListingType,
  selectedL2Chain,
}: {
  ensName: string;
  selectedListingType?: ListingType;
  selectedL2Chain?: ListingNetwork;
  children: ReactElement;
}) => {
  const { isTestnet, network } = useMainChain();
  const { address } = useAccount();
  const listManager = useListingManager();

  const convertListingToFormData = (existingListing: NamespaceListing) => {
    return {
      currency: existingListing.currency,
      prices: existingListing.prices,
      reservations: existingListing.reservations || [],
      deadline: existingListing.deadline ? existingListing.deadline : undefined,
      paymentWallet: existingListing.paymentWallet as Address,
      tokenGatedAccess: existingListing.tokenGatedAccess?.length
        ? existingListing.tokenGatedAccess[0]
        : undefined,
      whitelist: existingListing.whitelist,
      listingType: existingListing.type,
    };
  };

  // TODO, extract this into separate states
  // whitelist, deadline etc and not all at once
  // much less operation when doing updates
  const [formState, setFormState] = useState<IListingFormContent>({
    ...defaultState,
    listingType: selectedListingType || ListingType.L1,
  });

  const defaultRegistryNetwork = isTestnet
    ? ListingNetwork.BaseSepolia
    : ListingNetwork.Base;
  const [l2Registry, setL2Registry] = useState<Partial<L2Registry>>({
    isBurnable: false,
    isDeployed: false,
    isExpirable: false,
    registryName: ensName,
    registrySymbol: "ENS",
    registryNetwork: selectedL2Chain || defaultRegistryNetwork,
  });

  const [paymentWallet, setPaymentWallet] = useState(address);
  const [features, setFeatures] = useState<IListingFeatures>({
    deadline: false,
    whitelist: false,
    tokenGatedAccess: false,
  });
  const [existingListings, setExistingListing] = useState<NamespaceListing>();

  useEffect(() => {
    fetchExistingListing(ensName);
  }, [ensName]);

  const fetchExistingListing = async (_ensName: string) => {
    listManager
      .getListedName(_ensName)
      .then((result) => {
        if (result && result.name) {
          const formData = convertListingToFormData(result);
          setFormState(formData);
          const features: IListingFeatures = {
            deadline: result.deadline ? true : false,
            tokenGatedAccess: (result.tokenGatedAccess?.length || 0) > 0,
            whitelist: result.whitelist ? true : false,
          };

          if (result.l2Metadata) {
            setL2Registry(result.l2Metadata);
          }
          setExistingListing(result);
          setFeatures(features);
        }
      });
  };

  const setPrices = (prices: ListingPrices) => {
    const _state = { ...formState };
    _state.prices = prices;
    setFormState(_state);
  };

  const setCurrency = (currency: ListingCurrency) => {
    const _state = { ...formState };
    _state.currency = currency;
    setFormState(_state);
  };

  const setDeadline = (deadline: ListingDeadline) => {
    const _state = { ...formState };
    const _deadline: ListingDeadline = deadline;
    _state.deadline = _deadline;
    setFormState(_state);
  };

  const removeDeadline = () => {
    const _state = { ...formState };
    delete _state.deadline;
    setFormState(_state);
  };

  const removeWhitelist = () => {
    const _state = { ...formState };
    delete _state.deadline;
    setFormState(_state);
  };

  const setWhitelist = (wl: ListingWhitelist) => {
    const _state = { ...formState };
    const _whitelist: ListingWhitelist = wl;
    _state.whitelist = _whitelist;
    setFormState(_state);
  };

  const toggleFeature = (feature: keyof IListingFeatures, toggle: boolean) => {
    const _features = { ...features };
    _features[feature] = toggle;
    setFeatures(_features);
  };

  const setReservations = (reservations: ReservedLabel[]) => {
    const _state = { ...formState };
    _state.reservations = [...reservations];
    setFormState(_state);
  };

  const setTokenGatedAccess = (tga: TokenGatedAccess) => {
    const _state = { ...formState };
    _state.tokenGatedAccess = tga;
    setFormState(_state);
  };

  const setListingType = (listingType: ListingType) => {
    const _state = { ...formState };
    _state.listingType = listingType;
    setFormState(_state);
  };

  const handleUnlist = () => {
    setExistingListing(undefined);
  };

  const listingInputsValid: Record<ListingInputGroups, boolean> =
    useMemo(() => {
      return {
        Deadline: isDeadlineValid(formState.deadline) || true,
        Setup: isSetupValid(
          formState.listingType,
          l2Registry as L2Registry,
          paymentWallet
        ),
        Prices: true,
        Reservations: true,
        TokenGatedAccess: features.tokenGatedAccess
          ? isTokenGatedAccessValid(formState.tokenGatedAccess)
          : true,
        Whitelist: true,
      };
    }, [formState, paymentWallet, l2Registry]);

    const isStateChanged = useMemo(() => {
      if (!existingListings) {
        return false;
      }

      let _isEqual = true
      const _listingFormData = convertListingToFormData(existingListings)
      _isEqual = _isEqual && isEqual(formState, _listingFormData)
      _isEqual = _isEqual && equalsIgnoreCase(existingListings.paymentWallet, paymentWallet)

      if (formState.listingType === ListingType.L2 && existingListings.l2Metadata) {
        const meta = existingListings.l2Metadata;
        const _existingRegistry: Partial<L2Registry> = {
          isBurnable: meta.isBurnable || false,
          registryName: meta.registryName,
          registrySymbol: meta.registrySymbol,
          isExpirable: meta.isExpirable
        }
        _isEqual = isEqual(_existingRegistry, {
          isBurnable: l2Registry.isBurnable,
          registryName: l2Registry.registryName,
          registrySymbol: l2Registry.registrySymbol,
          isExpirable: l2Registry.isExpirable
        })
      }

      return !_isEqual;

    },[formState, existingListings, l2Registry, paymentWallet])

  const ctx: IListingFormContext = useMemo(() => {
    return {
      currency: formState.currency,
      prices: formState.prices,
      deadline: formState.deadline,
      paymentWallet: paymentWallet!,
      reservations: formState.reservations,
      tokenGatedAccess: formState.tokenGatedAccess,
      whitelist: formState.whitelist,
      features: features,
      setPrices: setPrices,
      setCurrency: setCurrency,
      setDeadline: setDeadline,
      removeDeadline: removeDeadline,
      setWhitelist: setWhitelist,
      removeWhitelist: removeWhitelist,
      toggleFeature: toggleFeature,
      setReservations: setReservations,
      setTokenGatedAccess: setTokenGatedAccess,
      setListingType: setListingType,
      isStateUpdated: isStateChanged,
      listingType: formState.listingType,
      ensName: ensName,
      existingListing: existingListings,
      l2Registry: l2Registry,
      setL2Registry: (val) => setL2Registry(val),
      setPaymentWallet: (val: string) => setPaymentWallet(val as Address),
      refetch: () => fetchExistingListing(ensName),
      listingInputsValid: listingInputsValid,
    };
  }, [formState, features, ensName, l2Registry, paymentWallet]);

  return (
    <ListingFormContext.Provider value={ctx}>
      {children}
    </ListingFormContext.Provider>
  );
};

export const useListingFormContext = () => useContext(ListingFormContext);

const isSetupValid = (
  type: ListingType,
  l2Registry: L2Registry,
  paymentWallet?: Address
): boolean => {
  if (type === ListingType.L1) {
    return paymentWallet !== undefined && isAddress(paymentWallet);
  } else if (type === ListingType.L2 && l2Registry) {
    const { registryName, registrySymbol } = l2Registry;
    return (
      registryName!.length > 0 &&
      registrySymbol!.length > 0 &&
      paymentWallet !== undefined &&
      isAddress(paymentWallet)
    );
  }
  return false;
};

const isDeadlineValid = (deadline: ListingDeadline | undefined): boolean => {
  if (!deadline) {
    // not used
    return true;
  }

  const now = new Date().getTime();
  return deadline.timestamp !== undefined && deadline.timestamp < now;
};

const isTokenGatedAccessValid = (
  tokenGatedAccess?: TokenGatedAccess
): boolean => {
  if (!tokenGatedAccess) {
    return true;
  }
  const { tokenAddress, tokenNetwork } = tokenGatedAccess;
  return isAddress(tokenAddress || "") && tokenNetwork !== undefined;
};

export const getListingCurrencyLabel = (currency: ListingCurrency) => {
  if (currency === ListingCurrency.DOLLAR) {
    return "USD"
  }
  return "ETH";
}