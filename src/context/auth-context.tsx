import { Address, toHex } from "viem";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useConnectedPrincipal } from "./current-user-context";
import {
  createSiweMessage,
  generateSiweNonce,
  parseSiweMessage,
} from "viem/siwe";
import { useMainChain, useWeb3Clients } from "@/hooks";

export interface AccessTokens {
  accessToken: string;
  refreshToken: string;
}

interface IAuthContext {
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: Record<Address, AccessTokens>;
  siweTokens: Record<Address, string>;
  authenticate?: () => void;
  checkAuthenticationForAddr?: (principal: Address) => Promise<boolean>;
  getAccessToken?: (principal: Address) => Promise<string>;
  denyAuth?: (principal: Address) => void;
  getSiweToken?: (principal: Address) => void;
  hasValidSiweToken?: (principal: Address) => boolean
}

export const AUTH_TOKEN_KEY = "auth-tokens";
const TOKEN_EXPIRY_24HOURS = 24 * 60 * 60 * 1000;

const AuthContext = createContext<IAuthContext>({
  isAuthenticated: false,
  isLoading: true,
  tokens: {},
  siweTokens: {},
});

export const useAuthContext = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }: PropsWithChildren) => {
  const [tokens, setTokens] = useState<Record<Address, AccessTokens>>({});
  const [siweTokens, setSiweTokens] = useState<Record<Address, string>>({});
  const [isLoading, setLoading] = useState(true);
  const { connectedAddress } = useConnectedPrincipal();
  const { networkId } = useMainChain();
  const { walletClient } = useWeb3Clients({ chainId: networkId });

  useEffect(() => {
    try {
      loadSiweTokens();
    } catch (err) {}
    setLoading(false);
  }, []);
  const isSiweTokenValid = (siweToken: string) => {
    const split = siweToken.split(".");

    if (split.length !== 2) {
      return false;
    }

    const siweMessage = parseSiweMessage(atob(split[0]));

    const now = new Date();
    const tokenExpiry = siweMessage.expirationTime
      ? siweMessage.expirationTime.getTime()
      : 0;

    if (now.getTime() > tokenExpiry) {
      return false;
    }

    return true;
  };

  const performAuthentication = async () => {
    const nonce = generateSiweNonce();
    const currentAddress = connectedAddress as Address;
    const now = new Date();
    const siweMessage = await createSiweMessage({
      address: currentAddress,
      chainId: networkId,
      domain: window.location.hostname,
      nonce: nonce,
      uri: window.location.origin,
      version: "1",
      expirationTime: new Date(now.getTime() + TOKEN_EXPIRY_24HOURS),
    });

    const signature = await walletClient!.signMessage({ message: siweMessage });

    const messageB64 = btoa(siweMessage);
    const signatureB64 = btoa(signature);

    const token = `${messageB64}.${signatureB64}`;
    setSiweToken(currentAddress, token);
  };

  let currentUserAuthenticated = useMemo(() => {
    if (connectedAddress) {
      const token = siweTokens[connectedAddress];
      if (token) {
        return isSiweTokenValid(token);
      }
    }

    return false;
  }, [connectedAddress, siweTokens]);

  const setSiweToken = (wallet: Address, siweToken: string) => {
    const _siweTokens = { ...siweTokens };
    _siweTokens[wallet] = siweToken;
    localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(_siweTokens));
    setSiweTokens(_siweTokens);
  };


  const loadSiweTokens = () => {
    const authTokensString = localStorage.getItem(AUTH_TOKEN_KEY) || "{}";
    const authTokens = JSON.parse(authTokensString) as Record<Address, string>;
    const unexpiredTokens: Record<Address, string> = {};
    Object.keys(authTokens).forEach((key) => {
      const addr = key as Address;
      const siweToken = authTokens[addr];
      if (isSiweTokenValid(siweToken)) {
        unexpiredTokens[addr] = siweToken;
      }
    });
    setSiweTokens(authTokens);
  };

  const checkAuthenticationForAddr = async (principal: Address) => {
    const tkns = tokens[principal];
    if (!tkns) {
      return false;
    }
    const { accessToken } = tkns;
    if (isTokenExpired(accessToken)) {
      return false;
    }

    return true;
  };

  const getAccessToken = async (principal: Address) => {
    if (tokens[principal]) {
      return tokens[principal].accessToken;
    }
    return "";
  };

  const hasValidSiweToken = (wallet: Address) => {
    const siweToken = getSiweToken(wallet);
    return siweToken !== "" && isSiweTokenValid(siweToken);
  }

  const getSiweToken = (principal: Address): string => {
    return siweTokens[principal] || "";
  };

  return (
    <AuthContext.Provider
      value={{
        isLoading: isLoading,
        isAuthenticated: currentUserAuthenticated,
        tokens,
        siweTokens,
        authenticate: performAuthentication,
        getAccessToken,
        checkAuthenticationForAddr,
        getSiweToken,
        hasValidSiweToken: hasValidSiweToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const isTokenExpired = (jwt: string) => {
  const split = jwt.split(".");
  if (split.length !== 3) {
    return false;
  }

  const claimsBase64 = split[1];
  const claimsJSON = atob(claimsBase64);
  const claims = JSON.parse(claimsJSON) as { principal: Address; exp: number };

  const now = Math.floor(new Date().getTime() / 1000);

  return now > claims.exp;
};
