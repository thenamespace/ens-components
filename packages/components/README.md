# `@thenamespace/ens-components`

Production-ready React components for ENS name registration, record editing, and subname issuance.

[![npm](https://img.shields.io/npm/v/@thenamespace/ens-components)](https://www.npmjs.com/package/@thenamespace/ens-components)

## Install

```bash
npm install @thenamespace/ens-components
# or
pnpm add @thenamespace/ens-components
```

Peer dependencies (you likely already have these):

```bash
npm install react react-dom wagmi viem
```

## Quick start

### 1. Wrap your app with Web3 providers

The library reads wallet state from wagmi. Use your own wagmi setup or RainbowKit:

```tsx
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "My App",
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [mainnet, sepolia],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={new QueryClient()}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

### 2. Import styles

```tsx
import "@thenamespace/ens-components/styles";
```

### 3. Drop in a component

```tsx
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

export default function App() {
  return <EnsNameRegistrationForm isTestnet={false} />;
}
```

---

## Components

### `EnsNameRegistrationForm`

Full `.eth` name registration flow: search → commit → wait → register.

```tsx
<EnsNameRegistrationForm
  isTestnet={false}
  onNameRegistered={(name) => console.log("Registered:", name)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `isTestnet` | `boolean` | Use Sepolia testnet contracts |
| `onNameRegistered` | `(name: string) => void` | Callback after successful registration |

---

### `EnsRecordsForm`

Edit all resolver records for an ENS name — addresses, text records, contenthash, avatar, and header image.

```tsx
<EnsRecordsForm
  name="alice.eth"
  existingRecords={{ texts: [], addresses: [] }}
  isTestnet={false}
  onRecordsSaved={(records) => console.log(records)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | The ENS name to edit |
| `existingRecords` | `EnsRecords` | Current on-chain records to pre-populate |
| `isTestnet` | `boolean` | Use Sepolia testnet contracts |
| `onRecordsSaved` | `(records: EnsRecords) => void` | Callback after records are saved |

---

### `SubnameMintForm`

Mint an onchain subname from a Namespace listing.

```tsx
<SubnameMintForm
  parentName="alice.eth"
  isTestnet={false}
  onSubnameMinted={(subname) => console.log("Minted:", subname)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `parentName` | `string` | Parent ENS name with an active listing |
| `isTestnet` | `boolean` | Use Sepolia testnet contracts |
| `onSubnameMinted` | `(subname: string) => void` | Callback after mint |

---

### `OffchainSubnameForm`

Create or update an offchain subname through the Namespace API.

```tsx
<OffchainSubnameForm
  name="alice.eth"
  apiKeyOrToken="YOUR_NAMESPACE_API_KEY"
  isTestnet={false}
  onSubnameSaved={(subname) => console.log("Saved:", subname)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Parent ENS name |
| `apiKeyOrToken` | `string` | Namespace API key or SIWE token |
| `isTestnet` | `boolean` | Use Sepolia testnet contracts |
| `onSubnameSaved` | `(subname: string) => void` | Callback after save |

---

## Hooks

```tsx
import {
  useRegisterENS,
  useENSResolver,
  useMintSubname,
  useOffchainManager,
  useWaitTransaction,
  useAvatarClient,
} from "@thenamespace/ens-components";
```

## Types

```tsx
import type {
  EnsRecords,
  EnsTextRecord,
  EnsAddressRecord,
  EnsContenthashRecord,
} from "@thenamespace/ens-components";
```

---

## Theming

Components use CSS variables that can be overridden:

```css
:root {
  --ns-color-primary: #5A4BFF;
  --ns-color-bg: #ffffff;
  --ns-color-fg: #111111;
  --ns-radius-md: 12px;
  --ns-font-family: "DM Sans", sans-serif;
}
```

---

## Links

- [Namespace](https://namespace.ninja) — subname issuance platform
- [ENS](https://ens.domains) — Ethereum Name Service
- [Source](https://github.com/thenamespace/ui-components)
- [npm](https://www.npmjs.com/package/@thenamespace/ens-components)
