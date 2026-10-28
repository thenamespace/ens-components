# `@thenamespace/ens-components`

Production-ready React components for ENS name registration, renewal, record editing, and subname issuance, on ENSv1 and ENSv2.

[![npm](https://img.shields.io/npm/v/@thenamespace/ens-components)](https://www.npmjs.com/package/@thenamespace/ens-components)

On ENSv1, record editing and onchain/offchain subname flows support native `.eth` names and
DNS names imported into ENS, such as `example.com`. Registration and renewal are limited to `.eth` names.

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

---

## ENSv1 and ENSv2

`EnsNameRegistrationForm`, `NameRenewForm`, `EnsRecordsForm`, and `SubnameMintForm` take a `version` prop.
It defaults to `1`, so existing integrations keep the ENSv1 flow. Pass `version={2}` for ENSv2, on
mainnet or on Sepolia with `isTestnet`.

| Flow            | `version={1}` (default)               | `version={2}`                                                            |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------ |
| Registration    | ETH Registrar Controller, paid in ETH | ENSv2 registrar, paid in USDC or DAI. Each owner gets their own resolver |
| Renewal         | Paid in ETH                           | Paid in USDC or DAI                                                      |
| Records         | Resolver looked up through ENSv1      | Resolver looked up through the ENSv2 Universal Resolver                  |
| Subname minting | Parent needs a Namespace listing      | Parent needs a Namespace ENSv2 activation. Paid in ETH, USDC, or DAI     |

`SubnameRenewForm` only exists for ENSv2. Wallets with atomic batching (EIP-5792) confirm an ENSv2
flow in one prompt; other wallets get one transaction per step.

Upgrading from 2.2 needs no code changes. The one API change is that `TransactionPendingScreen`
no longer takes a `message` prop.

---

## Components

### `EnsNameRegistrationForm`

Full `.eth` name registration flow: search → commit → wait → register.

```tsx
<EnsNameRegistrationForm
  isTestnet={false}
  avatarUploadDomain="app.example.com"
  onRegistrationSuccess={result => console.log(result.expiryDate, result.total)}
/>
```

| Prop                    | Type                                        | Description                                         |
| ----------------------- | ------------------------------------------- | --------------------------------------------------- |
| `name`                  | `string`                                    | Pre-fill the name to register                       |
| `isTestnet`             | `boolean`                                   | Use Sepolia instead of mainnet                      |
| `version`               | `1 \| 2`                                    | `2` registers through ENSv2. Defaults to `1`        |
| `referrer`              | `Address`                                   | Registration referrer address (ENSv1 only)          |
| `avatarUploadDomain`    | `string`                                    | Your app's hostname, used for avatar upload signing |
| `onRegistrationStart`   | `(name: string) => void`                    | Called when the first transaction is sent           |
| `onRegistrationSuccess` | `(result: RegistrationSuccessData) => void` | Called after registration                           |
| `onClose`               | `(isSuccess: boolean) => void`              | Called when the user closes the form                |
| `onConnectWallet`       | `() => void`                                | Called when the user needs to connect a wallet      |

Also accepts `title`, `subtitle`, `bannerImage`, `bannerWidth`, `hideBanner`, `noBorder`, and `className`.

---

### `NameRenewForm`

Renews a `.eth` name in one step. Anyone can renew any name; the owner keeps it.

```tsx
<NameRenewForm
  name="alice.eth"
  version={2}
  onRenewalSuccess={data => console.log(data.newExpiry)}
/>
```

| Prop               | Type                                 | Description                                                  |
| ------------------ | ------------------------------------ | ------------------------------------------------------------ |
| `name`             | `string`                             | `alice` or `alice.eth`. Leave empty to let the user type one |
| `isTestnet`        | `boolean`                            | Use Sepolia instead of mainnet                               |
| `version`          | `1 \| 2`                             | `1` renews in ETH, `2` in USDC or DAI. Defaults to `1`       |
| `referrer`         | `Address`                            | Renewal referrer address                                     |
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
  isTestnet={false}
  onRecordsUpdated={diff => console.log(diff)}
/>
```

| Prop                 | Type                             | Description                                               |
| -------------------- | -------------------------------- | --------------------------------------------------------- |
| `name`               | `string`                         | ENS name to edit (`.eth` or a DNS name imported into ENS) |
| `existingRecords`    | `EnsRecords`                     | Current on-chain records to pre-populate                  |
| `isTestnet`          | `boolean`                        | Use Sepolia instead of mainnet                            |
| `version`            | `1 \| 2`                         | `2` looks up the resolver through ENSv2. Defaults to `1`  |
| `resolverAddress`    | `Address`                        | Skip the resolver lookup and use this one                 |
| `avatarUploadDomain` | `string`                         | Your app's hostname, used for avatar upload signing       |
| `onRecordsUpdated`   | `(diff: EnsRecordsDiff) => void` | Called after the records are saved                        |
| `onTransactionSent`  | `(hash: Hash) => void`           | Called when the transaction is sent                       |
| `onCancel`           | `() => void`                     | Called when the user cancels                              |

Also accepts `resolverChainId`, `txConfirmations`, `onGreat`, `noBorder`, and `className`.

---

### `SubnameMintForm`

Mint an onchain subname from a Namespace listing (ENSv1) or under an ENSv2 activation. Activate a name
for ENSv2 subnames on [app.namespace.ninja](https://app.namespace.ninja).

```tsx
<SubnameMintForm
  parentName="alice.eth"
  version={2}
  onSuccess={data => console.log("Minted:", `${data.label}.${data.parentName}`)}
/>
```

| Prop                 | Type                              | Description                                                                  |
| -------------------- | --------------------------------- | ---------------------------------------------------------------------------- |
| `parentName`         | `string`                          | Parent with a listing (`.eth` or ENS-imported DNS) or an activation (`.eth`) |
| `label`              | `string`                          | Pre-fill the subname label                                                   |
| `isTestnet`          | `boolean`                         | Use Sepolia instead of mainnet                                               |
| `version`            | `1 \| 2`                          | `2` mints under the parent's ENSv2 activation. Defaults to `1`               |
| `resolver`           | `Address`                         | ENSv2 only. Resolver for the subname when the activation doesn't set one     |
| `avatarUploadDomain` | `string`                          | Your app's hostname, used for avatar upload signing                          |
| `onSuccess`          | `(data: MintSuccessData) => void` | Called after the mint confirms                                               |
| `onConnectWallet`    | `() => void`                      | Called when the user needs to connect a wallet                               |
| `onCancel`           | `() => void`                      | Called when the user cancels                                                 |

Also accepts `title`, `subtitle`, `txConfirmations`, `onSubnameMinted`, and `noBorder`.

---

### `SubnameRenewForm`

Renew a subname minted under an ENSv2 activation, at the price the parent's owner set. It warns when
the subname would outlive its parent.

```tsx
<SubnameRenewForm
  parentName="alice.eth"
  label="bob"
  onRenewalSuccess={data => console.log(data.newExpiry)}
/>
```

| Prop               | Type                                 | Description                                                        |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| `parentName`       | `string`                             | Parent name with an ENSv2 activation                               |
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
