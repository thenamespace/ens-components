/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LIST_MANAGER_API?: string;
  readonly VITE_IS_TESTNET?: string;
  readonly VITE_IS_TESTNET_RPC_URL?: string;
  readonly VITE_ALCHEMY_TOKEN?: string;
  readonly VITE_INDEXER_API?: string;
  // Support for Next.js style env vars for compatibility
  readonly NEXT_PUBLIC_LIST_MANAGER_API?: string;
  readonly NEXT_PUBLIC_IS_TESTNET?: string;
  readonly NEXT_PUBLIC_IS_TESTNET_RPC_URL?: string;
  readonly NEXT_PUBLIC_ALCHEMY_TOKEN?: string;
  readonly NEXT_PUBLIC_INDEXER_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

