import {
    createContext,
    PropsWithChildren,
    useContext,
    useMemo,
    useState,
  } from "react";
  
  export type SubnameView = "list" | "grid";
  const NAMES_TO_RENDER = 48;
  
  interface Indicator {
    isAvailable: boolean;
    isChecking: boolean;
  }
  
  interface IProfileFilterContext {
    showSubnamesCount: number;
    setShowSubnamesCount: (val: number) => void;
    searchedSubname: string;
    onSubnameSeach: (val: string) => void;
    mode: SubnameView;
    onModeChange: (view: SubnameView) => void;
    availableIndicator: Indicator;
    onAvailableIndicatorChange: (indicator: Indicator) => void;
  }
  
  const FiltersCtx = createContext<IProfileFilterContext>({
    mode: "grid",
    onModeChange: () => {},
    searchedSubname: "",
    onSubnameSeach: () => {},
    setShowSubnamesCount: () => {},
    showSubnamesCount: NAMES_TO_RENDER,
    availableIndicator: {
      isAvailable: false,
      isChecking: false,
    },
    onAvailableIndicatorChange: () => {},
  });
  
  export const ProfileFiltersContext = ({ children }: PropsWithChildren) => {
    const [view, setView] = useState<SubnameView>("grid");
    const [searchValue, setSearchValue] = useState("");
    const [showSubnamesCount, setShowSubnamesCount] = useState(NAMES_TO_RENDER);
    const [availableIndicator, setAvailableIndicator] = useState<Indicator>({
      isAvailable: false,
      isChecking: false,
    });
  
    const handleSubnameSearch = (value: string) => {
      setSearchValue(value);
    };
  
    const ctx: IProfileFilterContext = useMemo(() => {
      return {
        availableIndicator: availableIndicator,
        mode: view,
        searchedSubname: searchValue,
        showSubnamesCount: showSubnamesCount,
        onSubnameSeach: handleSubnameSearch,
        setShowSubnamesCount: (count: number) => {
          setShowSubnamesCount(count);
        },
        onModeChange: (mode: SubnameView) => {
          setView(mode);
        },
        onAvailableIndicatorChange: (indictor: Indicator) => {
          setAvailableIndicator(indictor);
        },
      };
    }, [
      view,
      searchValue,
      showSubnamesCount,
      availableIndicator,
      handleSubnameSearch,
    ]);
  
    return <FiltersCtx.Provider value={ctx}>{children}</FiltersCtx.Provider>;
  };
  
  export const useProfileFilterCtx = () => useContext(FiltersCtx);
  