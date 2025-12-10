import {
  useListingManager,
  useMainChain,
} from "@/hooks";
import {
  ListingNetwork,
  ListingStatusDTO,
  ListingType,
} from "@/types/list-manager";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Address, zeroAddress } from "viem";

interface IListingStatusState {
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  status: ListingStatusDTO;
}

interface IListingContext extends IListingStatusState {
  refetch: () => void;
  handleUnlist: () => void;
  updateStatus: (status: Partial<ListingStatusDTO>) => void;
}

interface ListingStatusCtxProps extends PropsWithChildren {
  ensName: string;
}

const blankListingStatus: ListingStatusDTO = {
  approvalGiven: false,
  listingCreated: false,
  listingVerified: false,
  nameWrapped: false,
  name: "",
  nameNetwork: ListingNetwork.Mainnet,
  registryDeployed: false,
  type: ListingType.L1,
  l2Network: ListingNetwork.Base,
  resolverConfigured: false,
  resolverSet: false
};

const defaultCtx: IListingContext = {
  isRefetching: false,
  isError: false,
  status: { ...blankListingStatus },
  isLoading: true,
  handleUnlist: () => {},
  refetch: () => {},
  updateStatus: () => {},
};

const ListingStatusContext = createContext<IListingContext>({ ...defaultCtx });

export const ListingStatusContextProvider = ({
  ensName,
  children,
}: ListingStatusCtxProps) => {
  const [state, setState] = useState<IListingStatusState>({ ...defaultCtx });

  const manager = useListingManager();
  const { network } = useMainChain();

  useEffect(() => {
    fetchListingStatus();
  }, [network, ensName]);


  const fetchListingStatus = async () => {
    const _apiStatus = await manager.getListingStatus(ensName, network, true);
    setState({
      isError: false,
      isLoading: false,
      isRefetching: false,
      status: _apiStatus,
    });
  };

  const handleUnlist = () => {
    setState({
      ...state,
      status: {
        ...state.status,
        listingCreated: false,
        listingVerified: false,
      },
    });
  };

  const updateStatus = (newStatus: Partial<ListingStatusDTO>) => {
    setState({ ...state, status: { ...state.status, ...newStatus } });
  };

  const ctx: IListingContext = useMemo(() => {
    return {
      isError: state.isError,
      isLoading: state.isLoading,
      isRefetching: state.isRefetching,
      status: state.status,
      refetch: fetchListingStatus,
      handleUnlist,
      updateStatus: updateStatus,
    };
  }, [state]);

  return (
    <ListingStatusContext.Provider value={ctx}>
      {children}
    </ListingStatusContext.Provider>
  );
};

export const useListingStatusContext = () => useContext(ListingStatusContext);
