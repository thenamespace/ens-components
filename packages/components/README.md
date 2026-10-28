# `@thenamespace/ens-components`

Production-ready React components for ENS name registration, renewal, record editing, and subname issuance on ENSv2.

[![npm](https://img.shields.io/npm/v/@thenamespace/ens-components)](https://www.npmjs.com/package/@thenamespace/ens-components)

Try every component live at [enscomponents.com](https://enscomponents.com).

## Install

```bash
npm install @thenamespace/ens-components
# or
pnpm add @thenamespace/ens-components
```

Peer dependencies (you likely already have these):

```bash
npm install react react-dom wagmi viem @tanstack/react-query
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

Every onchain flow runs on ENSv2, on mainnet or on Sepolia with `isTestnet`. The one ENSv1 flow still in use is
minting under an old Namespace listing: pass `version={1}` to `SubnameMintForm` for those parents.

### Upgrading to 3.0

`version` now defaults to `2` on `EnsNameRegistrationForm`, `NameRenewForm`, `EnsRecordsForm`, and `SubnameMintForm`.
If you mint under an old Namespace listing, pass `version={1}` to `SubnameMintForm`. `TransactionPendingScreen` no
longer takes a `message` prop.

---

## Components

### `EnsNameRegistrationForm`

Registers a `.eth` name: search → commit → wait → register. Paid in USDC or DAI.

```tsx
<EnsNameRegistrationForm
  avatarUploadDomain="app.example.com"
  onRegistrationSuccess={result => console.log(result.expiryDate)}
/>
```

| Prop                    | Type                                        | Description                                                     |
| ----------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| `name`                  | `string`                                    | Pre-fill the name to register                                   |
| `isTestnet`             | `boolean`                                   | Use Sepolia instead of mainnet                                  |
| `referrer`              | `Address`                                   | Registration referrer address. Defaults to Namespace's referrer |
| `avatarUploadDomain`    | `string`                                    | Your app's hostname, used for avatar upload signing             |
| `onRegistrationStart`   | `(name: string) => void`                    | Called when the first transaction is sent                       |
| `onRegistrationSuccess` | `(result: RegistrationSuccessData) => void` | Called after registration                                       |
| `onClose`               | `(isSuccess: boolean) => void`              | Called when the user closes the form                            |
| `onConnectWallet`       | `() => void`                                | Called when the user needs to connect a wallet                  |

Also accepts `title`, `subtitle`, `bannerImage`, `bannerWidth`, `hideBanner`, `noBorder`, and `className`.

---

### `NameRenewForm`

Renews a `.eth` name in one step, paid in USDC or DAI. Anyone can renew any name; the owner keeps it.

```tsx
<NameRenewForm
  name="alice.eth"
  onRenewalSuccess={data => console.log(data.newExpiry)}
/>
```

| Prop               | Type                                 | Description                                                  |
| ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| `name`             | `string`                             | `alice` or `alice.eth`. Leave empty to let the user type one |
| `isTestnet`        | `boolean`                            | Use Sepolia instead of mainnet                               |
| `referrer`         | `Address`                            | Renewal referrer. Defaults to Namespace's                    |
| `onRenewalSuccess` | `(data: RenewalSuccessData) => void` | Called after the renewal confirms                            |
| `onConnectWallet`  | `() => void`                         | Called when the user needs to connect a wallet               |
| `onCancel`         | `() => void`                         | Called when the user cancels                                 |

Also accepts `title`, `subtitle`, `noBorder`, and `className`.

---

### `EnsRecordsForm`

Edit all resolver records for an ENS name: addresses, text records, contenthash, avatar, and header image.

```tsx
<EnsRecordsForm
  name="alice.eth"
  existingRecords={{ texts: [], addresses: [] }}
  onRecordsUpdated={diff => console.log(diff)}
/>
```

| Prop                 | Type                             | Description                                         |
| -------------------- | -------------------------------- | --------------------------------------------------- |
| `name`               | `string`                         | ENS name to edit                                    |
| `existingRecords`    | `EnsRecords`                     | Current on-chain records to pre-populate            |
| `isTestnet`          | `boolean`                        | Use Sepolia instead of mainnet                      |
| `resolverAddress`    | `Address`                        | Skip the resolver lookup and use this one           |
| `avatarUploadDomain` | `string`                         | Your app's hostname, used for avatar upload signing |
| `onRecordsUpdated`   | `(diff: EnsRecordsDiff) => void` | Called after the records are saved                  |
| `onTransactionSent`  | `(hash: Hash) => void`           | Called when the transaction is sent                 |
| `onCancel`           | `() => void`                     | Called when the user cancels                        |

Also accepts `resolverChainId`, `txConfirmations`, `onGreat`, `noBorder`, and `className`.

---

### `SubnameMintForm`

Mint an onchain subname under a `.eth` name activated on [app.namespace.ninja](https://app.namespace.ninja).
The user picks the payment token: ETH, USDC, or DAI (ETH or USDC on Sepolia).

```tsx
<SubnameMintForm
  parentName="alice.eth"
  onSuccess={data => console.log("Minted:", `${data.label}.${data.parentName}`)}
/>
```

| Prop                 | Type                              | Description                                                            |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------- |
| `version`            | `1 \| 2`                          | `1` for a parent on an old Namespace listing. Defaults to `2`          |
| `parentName`         | `string`                          | Activated parent. Old listings may also be DNS names imported into ENS |
| `label`              | `string`                          | Pre-fill the subname label                                             |
| `isTestnet`          | `boolean`                         | Use Sepolia instead of mainnet                                         |
| `resolver`           | `Address`                         | Resolver for the subname when the activation doesn't set one           |
| `avatarUploadDomain` | `string`                          | Your app's hostname, used for avatar upload signing                    |
| `onSuccess`          | `(data: MintSuccessData) => void` | Called after the mint confirms                                         |
| `onConnectWallet`    | `() => void`                      | Called when the user needs to connect a wallet                         |
| `onCancel`           | `() => void`                      | Called when the user cancels                                           |

Also accepts `title`, `subtitle`, `txConfirmations`, `onSubnameMinted`, and `noBorder`.

---

### `SubnameRenewForm`

Renew a subname minted under an activated name, at the price the parent's owner set. It warns when the subname
would outlive its parent.

```tsx
<SubnameRenewForm
  parentName="alice.eth"
  label="bob"
  onRenewalSuccess={data => console.log(data.newExpiry)}
/>
```

| Prop               | Type                                 | Description                                                        |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| `parentName`       | `string`                             | Activated parent name                                              |
| `label`            | `string`                             | Subname label. Leave empty to let the user type one                |
| `isTestnet`        | `boolean`                            | Use Sepolia instead of mainnet                                     |
| `onRenewalSuccess` | `(data: RenewalSuccessData) => void` | Called after the renewal confirms                                  |
| `onRenewParent`    | `() => void`                         | Shows a link to renew the parent when the subname would outlive it |
| `onConnectWallet`  | `() => void`                         | Called when the user needs to connect a wallet                     |
| `onCancel`         | `() => void`                         | Called when the user cancels                                       |

Also accepts `title`, `subtitle`, `noBorder`, and `className`.

---

### `OffchainSubnameForm`

Create or update a gasless offchain subname through the Namespace API. Get an API key for the parent
name on [app.namespace.ninja/offchain](https://app.namespace.ninja/offchain).

```tsx
import { createOffchainClient } from "@thenamespace/offchain-manager";

const offchainManager = createOffchainClient({
  mode: "mainnet",
  domainApiKeys: { "alice.eth": "YOUR_NAMESPACE_API_KEY" },
});

<OffchainSubnameForm name="alice.eth" offchainManager={offchainManager} />;
```

| Prop               | Type                      | Description                                  |
| ------------------ | ------------------------- | -------------------------------------------- |
| `name`             | `string`                  | Parent ENS name (`.eth` or ENS-imported DNS) |
| `offchainManager`  | `OffchainClient`          | Client from `createOffchainClient()`         |
| `label`            | `string`                  | Pre-fill and lock the subname label          |
| `isTestnet`        | `boolean`                 | Use Sepolia instead of mainnet               |
| `onSubnameCreated` | `(data) => Promise<void>` | Called after a new subname is submitted      |
| `onSubnameUpdated` | `(data) => Promise<void>` | Called after an existing subname is updated  |

Also accepts `title`, `subtitle`, `hideTitle`, `avatarUploadDomain`, `onCancel`, and `noBorder`.

---

### `TransactionProgress` and `TransactionModal`

The progress screen the forms show while a transaction confirms, available for your own transactions.

```tsx
<TransactionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  status="pending" // "pending" | "success" | "failed"
  hash={txHash}
  details={[{ label: "Name", value: "alice.eth" }]}
/>
```

Props: `status`, `hash`, `chainId`, `isTestnet`, `title`, `description`, `details`, `duration`, and
`className`. `TransactionModal` adds `isOpen`, `onClose`, and `footer`.

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
  RenewalSuccessData,
} from "@thenamespace/ens-components";
```

---

## Theming

Components use `--ns-` prefixed CSS variables. The accent ramp derives from `--ns-ink`, and `--ns-radius`
sets every corner:

```css
:root {
  --ns-ink: #212121;
  --ns-radius: 10px;
  --ns-text: #1b1d1e;
  --ns-surface: #ffffff;
  --ns-font-family: "DM Sans", sans-serif;
}
```

---

## Links

- [Namespace](https://namespace.ninja) — subname issuance platform
- [ENS](https://ens.domains) — Ethereum Name Service
- [Source](https://github.com/thenamespace/ens-components)
- [npm](https://www.npmjs.com/package/@thenamespace/ens-components)
