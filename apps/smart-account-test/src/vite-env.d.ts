/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MAINNET_RPC_URL?: string;
  readonly VITE_WALLETCONNECT_PROJECT_ID?: string;
  readonly VITE_METADATA_API_URL?: string;
  readonly VITE_OFFCHAIN_PARENT_NAME?: string;
  readonly VITE_OFFCHAIN_API_KEY?: string;
  readonly VITE_PRIVY_APP_ID?: string;
  readonly VITE_PRIVY_CLIENT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
