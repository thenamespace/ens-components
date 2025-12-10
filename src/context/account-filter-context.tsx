import { SupportedChainName } from "@/types";
import {
    createContext,
    Dispatch,
    ReactNode,
    SetStateAction,
    useContext,
    useState,
} from "react";

export type NetworksLabels =
    | "Base"
    | "Base Sepolia"
    | "Ethereum Mainnet"
    | "Optimism"
    | "Ethereum Sepolia";
export type NetworksIcon = "base" | "mainnet" | "op" | "eth";
export type NetworksOptionsType = Partial<
    Record<SupportedChainName, { icon: NetworksIcon; label: NetworksLabels }>
>;

export const networks: NetworksOptionsType = {
    base: {
        icon: "base",
        label: "Base",
    },
    baseSepolia: {
        icon: "base",
        label: "Base Sepolia",
    },
    mainnet: {
        icon: "eth",
        label: "Ethereum Mainnet",
    },
    optimism: {
        icon: "op",
        label: "Optimism",
    },
    sepolia: {
        icon: "eth",
        label: "Ethereum Sepolia",
    },
};

export type NetworksFilterOptions = {
    label: NetworksLabels;
    icon: NetworksIcon;
};

type NetworkFilter = Partial<Record<SupportedChainName, NetworksFilterOptions>>;

type AccountFilterContextType = {
    searchString: string;
    setSearchString: Dispatch<SetStateAction<string>>;
    networksFilterOptions: NetworkFilter;
    setNetworksFilterOptions: Dispatch<SetStateAction<{}>>;
    selectedNetworks: SupportedChainName[];
    setSelectedNetworks: Dispatch<SetStateAction<SupportedChainName[]>>;
    alphabetOrder: "alphabetAsc" | "alphabetDesc" | null;
    setAlphabetOrder: Dispatch<
        SetStateAction<"alphabetAsc" | "alphabetDesc" | null>
    >;
    view: "grid" | "list";
    setView: Dispatch<SetStateAction<"grid" | "list">>;
};

const AccountFilterContext = createContext<AccountFilterContextType>({
    searchString: "",
    setSearchString: () => {},
    networksFilterOptions: {},
    setNetworksFilterOptions: () => {},
    selectedNetworks: [],
    setSelectedNetworks: () => {},
    alphabetOrder: null,
    setAlphabetOrder: () => {},
    view: "grid",
    setView: () => {},
});

type AccountFilterProviderProps = {
    children: ReactNode;
};

export const AccountFilterProvider: React.FC<AccountFilterProviderProps> = ({
    children,
}) => {
    const [searchString, setSearchString] = useState<string>("");
    const [networksFilterOptions, setNetworksFilterOptions] =
        useState<NetworkFilter>({});
    const [selectedNetworks, setSelectedNetworks] = useState<SupportedChainName[]>(
        []
    );
    const [alphabetOrder, setAlphabetOrder] = useState<
        "alphabetAsc" | "alphabetDesc" | null
    >(null);
    const [view, setView] = useState<"grid" | "list">("grid");

    return (
        <AccountFilterContext.Provider
            value={{
                searchString,
                setSearchString,
                networksFilterOptions,
                setNetworksFilterOptions,
                selectedNetworks,
                setSelectedNetworks,
                alphabetOrder,
                setAlphabetOrder,
                view,
                setView,
            }}
        >
            {children}
        </AccountFilterContext.Provider>
    );
};

export const useAccountFilterContext = () => useContext(AccountFilterContext);
