import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

export type MintSubnameContextType = {
  fullSubname: string | null;
  setFullSubname: Dispatch<SetStateAction<string | null>>;
};

export const MintSubnameContext = createContext<MintSubnameContextType>({
  fullSubname: null,
  setFullSubname: () => {},
});

type MintSubnameProviderProps = {
  children: ReactNode;
};

export const MintSubnameProvider: React.FC<MintSubnameProviderProps> = ({
  children,
}) => {
  const [fullSubname, setFullSubname] = useState<string | null>(null);

  return (
    <MintSubnameContext.Provider value={{ fullSubname, setFullSubname }}>
      {children}
    </MintSubnameContext.Provider>
  );
};

export const useMintSubnameContext = () => useContext(MintSubnameContext);
