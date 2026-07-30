import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { baseAccount, injected, safe, walletConnect } from "wagmi/connectors";

const mainnetRpcUrl = import.meta.env.VITE_MAINNET_RPC_URL?.trim() ?? "";
const walletConnectProjectId =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() ?? "";
const metadataApiUrl =
  import.meta.env.VITE_METADATA_API_URL?.trim() ||
  "https://metadata.namespace.ninja";
const offchainParentName =
  import.meta.env.VITE_OFFCHAIN_PARENT_NAME?.trim() || "pushx.eth";
const offchainApiKey = import.meta.env.VITE_OFFCHAIN_API_KEY?.trim() ?? "";
const privyAppId = import.meta.env.VITE_PRIVY_APP_ID?.trim() ?? "";
const privyClientId = import.meta.env.VITE_PRIVY_CLIENT_ID?.trim() ?? "";

const isSafeFrame = typeof window !== "undefined" && window.parent !== window;

const connectors = [
  baseAccount({
    appName: "Namespace Smart Account Lab",
  }),
  injected({
    shimDisconnect: true,
  }),
  ...(isSafeFrame
    ? [
        safe({
          shimDisconnect: true,
          unstable_getInfoTimeout: 1_000,
        }),
      ]
    : []),
  ...(walletConnectProjectId
    ? [
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: true,
          metadata: {
            name: "Namespace Smart Account Lab",
            description:
              "EIP-1271 and EIP-6492 profile media compatibility lab",
            url:
              typeof window === "undefined"
                ? "https://localhost"
                : window.location.origin,
            icons: [],
          },
        }),
      ]
    : []),
];

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors,
  transports: {
    [mainnet.id]: http(mainnetRpcUrl || undefined),
  },
});

export const labConfig = {
  chain: mainnet,
  domain:
    typeof window === "undefined" ? "localhost" : window.location.hostname,
  isSafeFrame,
  mainnetRpcConfigured: Boolean(mainnetRpcUrl),
  metadataApiUrl,
  offchainApiKey,
  offchainApiKeyConfigured: Boolean(offchainApiKey),
  offchainParentName,
  privyAppId,
  privyClientId,
  privyConfigured: Boolean(privyAppId),
  walletConnectConfigured: Boolean(walletConnectProjectId),
} as const;
