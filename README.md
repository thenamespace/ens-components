<img src="apps/landing/src/assets/logo-wide.png" alt="Namespace" height="36" />

# ENS Components

**Drop-in React components for ENS name registration, renewal, record editing, and subname issuance. Works with ENSv1 and ENSv2.**

[![npm](https://img.shields.io/npm/v/@thenamespace/ens-components)](https://www.npmjs.com/package/@thenamespace/ens-components)
[![license](https://img.shields.io/npm/l/@thenamespace/ens-components)](LICENSE)

<img src="apps/landing/src/assets/preview.png" alt="ENS UI Components for any React app" width="100%" />

---

## Live demo

**[enscomponents.com](https://enscomponents.com)** — interactive playground for all components with live prop editing and generated code snippets.

---

## What's included

| Component | What it does |
|-----------|-------------|
| `EnsNameRegistrationForm` | Full `.eth` registration flow — search, commit, wait, register |
| `NameRenewForm` | Renew a `.eth` name: ETH on ENSv1, USDC or DAI on ENSv2 |
| `EnsRecordsForm` | Edit resolver records (addresses, text, contenthash, avatar) for a name you own |
| `SelectRecordsForm` | Standalone record composer — no wallet or transaction required |
| `SubnameMintForm` | Mint onchain subnames from a Namespace listing (ENSv1) or activation (ENSv2) |
| `SubnameRenewForm` | Renew onchain subnames minted under an ENSv2 activation |
| `OffchainSubnameForm` | Create and update gasless offchain subnames via the Namespace API |
| `TransactionProgress` / `TransactionModal` | The progress screen the forms use, available for your own transactions |

On ENSv1, `EnsRecordsForm`, `SubnameMintForm`, and `OffchainSubnameForm` accept both native
`.eth` names and DNS names that have been imported into ENS, such as `example.com`.
The relevant Namespace listing or API key must already be configured for the parent
name. `EnsNameRegistrationForm` and `NameRenewForm` are `.eth`-only because they go
through the ENS `.eth` registrar; import DNS names into ENS before passing them to the
other components.

---

## Install

```bash
npm install @thenamespace/ens-components
# or
pnpm add @thenamespace/ens-components
```

Install peer dependencies if you don't have them already:

```bash
npm install react react-dom wagmi viem @tanstack/react-query
```

---

## Setup

### 1. Add styles

```tsx
import "@thenamespace/ens-components/styles.css";
```

### 2. Wrap your app with wagmi providers

The components require `WagmiProvider` and `QueryClientProvider`. The example below uses RainbowKit for wallet connection — any wagmi-compatible setup works.

```tsx
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

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

---

## ENSv1 and ENSv2

`EnsNameRegistrationForm`, `NameRenewForm`, `EnsRecordsForm`, and `SubnameMintForm` take a
`version` prop. It defaults to `1`, so existing integrations keep the ENSv1 flow. Pass
`version={2}` for ENSv2, on mainnet or on Sepolia with `isTestnet`.

| Flow | `version={1}` (default) | `version={2}` |
|------|-------------------------|---------------|
| Registration | ETH Registrar Controller, paid in ETH | ENSv2 registrar, paid in USDC or DAI. Each owner gets their own resolver for records |
| Renewal | Paid in ETH | Paid in USDC or DAI |
| Records | Resolver looked up through ENSv1 | Resolver looked up through the ENSv2 Universal Resolver |
| Subname minting | Parent needs a Namespace listing | Parent needs a Namespace ENSv2 activation. Paid in ETH, USDC, or DAI (ETH or USDC on Sepolia) |

`SubnameRenewForm` only exists for ENSv2, so it has no `version` prop.

Wallets that support atomic batching (EIP-5792) confirm an ENSv2 flow in one prompt. Other
wallets get one transaction per step, such as approving the token before registering.

Upgrading from 2.2 needs no code changes. The one API change is that
`TransactionPendingScreen` no longer takes a `message` prop.

---

## Components

### EnsNameRegistrationForm

Guides users through the full `.eth` registration flow: search → commit → wait → register.

```tsx
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

<EnsNameRegistrationForm
  isTestnet={false}
  referrer="0xYourReferrerAddress"
  onConnectWallet={() => openConnectModal()}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `version` | `1 \| 2` | `2` registers through ENSv2 in USDC or DAI. Defaults to `1` |
| `referrer` | `string` | Registration referrer wallet address (ENSv1 only) |
| `noBorder` | `boolean` | Remove the card border |
| `title` | `string` | Override the form heading |
| `subtitle` | `string` | Override the subtitle |
| `bannerImage` | `string` | Custom banner image URL |
| `hideBanner` | `boolean` | Hide the banner entirely |
| `onConnectWallet` | `() => void` | Called when the user needs to connect a wallet |

---

### NameRenewForm

Renews a `.eth` name in one step. It shows the current expiry, prices the extension, and
sends the transaction. Anyone can renew any name; the owner keeps it.

```tsx
import { NameRenewForm } from "@thenamespace/ens-components";

<NameRenewForm
  name="alice.eth"
  version={2}
  onRenewalSuccess={(data) => console.log(data.fullName, data.newExpiry)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | `alice` or `alice.eth`. Leave empty to let the user type a name |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `version` | `1 \| 2` | `1` renews in ETH through ENSv1, `2` in USDC or DAI through ENSv2. Defaults to `1` |
| `referrer` | `string` | Renewal referrer wallet address |
| `noBorder` | `boolean` | Remove the card border |
| `title` | `string` | Override the form heading |
| `subtitle` | `string` | Override the subtitle |
| `onConnectWallet` | `() => void` | Called when the user needs to connect a wallet |
| `onCancel` | `() => void` | Called when the user cancels |
| `onRenewalSuccess` | `(data: RenewalSuccessData) => void` | Called after the renewal confirms |

`RenewalSuccessData` is `{ fullName, txHash, price, priceCurrency, transactionFees, newExpiry }`.

---

### EnsRecordsForm

Edit all resolver records for an ENS name the connected wallet owns.

```tsx
import { EnsRecordsForm } from "@thenamespace/ens-components";

<EnsRecordsForm
  name="alice.eth"
  existingRecords={{ addresses: [], texts: [] }}
  isTestnet={false}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | ENS name to edit (`.eth` or a DNS name imported into ENS) |
| `existingRecords` | `EnsRecords` | Current on-chain records |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `version` | `1 \| 2` | `2` looks up the resolver through ENSv2. Defaults to `1` |
| `noBorder` | `boolean` | Remove the card border |
| `txConfirmations` | `number` | Block confirmations to wait after tx |
| `onCancel` | `() => void` | Called when the user cancels |

---

### SelectRecordsForm

Standalone record editor with no wallet or transaction required. Use it to compose records before passing them to any other form.

```tsx
import { SelectRecordsForm } from "@thenamespace/ens-components";
import { useState } from "react";

const [records, setRecords] = useState({ addresses: [], texts: [] });

<SelectRecordsForm
  records={records}
  onRecordsUpdated={setRecords}
/>
```

---

### SubnameMintForm

Full minting flow for onchain subnames — price lookup, profile records, and the mint transaction.
With `version={2}` the parent must be activated for ENSv2 subnames on
[app.namespace.ninja](https://app.namespace.ninja), and the user picks the payment token.

```tsx
import { SubnameMintForm } from "@thenamespace/ens-components";

<SubnameMintForm
  parentName="yourname.eth"
  isTestnet={false}
  onConnectWallet={() => openConnectModal()}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `parentName` | `string` | ENS parent (`.eth` or ENS-imported DNS) with an active Namespace listing. ENSv2 parents must be `.eth` names |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `version` | `1 \| 2` | `2` mints under the parent's ENSv2 activation. Defaults to `1` |
| `resolver` | `Address` | ENSv2 only. Resolver for the new subname when the activation doesn't set one. Defaults to Namespace's shared resolver |
| `noBorder` | `boolean` | Remove the card border |
| `txConfirmations` | `number` | Block confirmations to wait after tx |
| `onConnectWallet` | `() => void` | Called when the user needs to connect |
| `onCancel` | `() => void` | Called when the user cancels |

---

### SubnameRenewForm

Extends subnames minted under an ENSv2 activation, at the price the parent's owner set. It
checks the subname, the parent, and the issuer before offering a transaction, and warns
when the subname would outlive its parent. Anyone can renew any subname; the renewal
extends it for its owner.

```tsx
import { SubnameRenewForm } from "@thenamespace/ens-components";

<SubnameRenewForm
  parentName="yourname.eth"
  label="alice"
  onRenewalSuccess={(data) => console.log(data.fullName, data.newExpiry)}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `parentName` | `string` | Parent name with an ENSv2 activation, e.g. `yourname.eth` |
| `label` | `string` | Subname label. Leave empty to let the user type one |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `noBorder` | `boolean` | Remove the card border |
| `title` | `string` | Override the form heading |
| `subtitle` | `string` | Override the subtitle |
| `onConnectWallet` | `() => void` | Called when the user needs to connect a wallet |
| `onCancel` | `() => void` | Called when the user cancels |
| `onRenewalSuccess` | `(data: RenewalSuccessData) => void` | Called after the renewal confirms |
| `onRenewParent` | `() => void` | Shows a link to renew the parent when the subname would outlive it |

---

### OffchainSubnameForm

Create and update gasless offchain subnames through the Namespace API. Requires an API key from [app.namespace.ninja/offchain](https://app.namespace.ninja/offchain).

```tsx
import { OffchainSubnameForm } from "@thenamespace/ens-components";
import { createOffchainClient } from "@thenamespace/offchain-manager";

const offchainManager = createOffchainClient({
  domainApiKeys: { "yourname.eth": "your-api-key" },
  mode: "mainnet", // or "sepolia"
});

<OffchainSubnameForm
  name="yourname.eth"
  offchainManager={offchainManager}
  onSubnameCreated={async (data) => {
    await offchainManager.createSubname(data);
  }}
  onSubnameUpdated={async (data) => {
    await offchainManager.updateSubname(data.fullSubname, data);
  }}
/>
```

Install the offchain manager separately:

```bash
npm install @thenamespace/offchain-manager
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Parent ENS name (`.eth` or ENS-imported DNS) |
| `offchainManager` | `OffchainClient` | Client from `createOffchainClient()` |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `label` | `string` | Pre-fill and lock the subname label |
| `title` | `string` | Override the header title |
| `subtitle` | `string` | Show a subtitle below the header |
| `hideTitle` | `boolean` | Hide the header entirely |
| `onSubnameCreated` | `(data) => Promise<void>` | Called after a new subname is submitted |
| `onSubnameUpdated` | `(data) => Promise<void>` | Called after an existing subname is updated |

---

### TransactionProgress and TransactionModal

The progress screen every form shows while a transaction confirms: a rail that holds at 90%
until the receipt arrives, optional detail rows, and an explorer link. Use
`TransactionProgress` inline or `TransactionModal` to show it in a modal for your own
transactions.

```tsx
import { TransactionModal } from "@thenamespace/ens-components";

<TransactionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  status={status} // "pending" | "success" | "failed"
  hash={txHash}
  details={[
    { label: "Name", value: "alice.eth" },
    { label: "Action", value: "Set records" },
  ]}
/>
```

| Prop | Type | Description |
|------|------|-------------|
| `status` | `"pending" \| "success" \| "failed"` | Current state of the transaction |
| `hash` | `Hash` | Transaction hash for the explorer link |
| `chainId` | `number` | Chain used for the explorer link |
| `isTestnet` | `boolean` | Link to the Sepolia explorer when `chainId` isn't set |
| `title` | `ReactNode` | Override the default title for the current status |
| `description` | `ReactNode` | Override the default description for the current status |
| `details` | `{ label, value }[]` | Label and value rows shown under the progress rail |
| `duration` | `number` | Milliseconds the rail takes to reach 90% while pending. Defaults to 10000 |
| `isOpen`, `onClose` | | `TransactionModal` only. Controls the modal |
| `footer` | `ReactNode` | `TransactionModal` only. Replaces the default Close button |

---

## Theming

All colors, radii, and spacing are CSS variables. Override them in your own stylesheet to match your brand:

```css
:root {
  --ns-color-primary: #3b82f6;
  --ns-color-bg: #ffffff;
  --ns-color-bg-secondary: #f9fafb;
  --ns-color-text: #111827;
  --ns-color-text-secondary: #6b7280;
  --ns-color-border: #e5e7eb;
  --ns-radius-md: 8px;
  --ns-radius-lg: 12px;
}
```

---

## Repository structure

```
ui-components/
├── packages/
│   └── components/        # @thenamespace/ens-components  (published to npm)
└── apps/
    ├── storybook/         # Storybook 8 component explorer  (port 6006)
    ├── landing/           # Interactive demo & docs         (port 4000)
    └── e2e/               # Playwright suite against Sepolia
```

## Local development

```bash
# Install all workspace dependencies
pnpm install

# Start the landing page (http://localhost:4000)
pnpm --filter landing dev

# Start Storybook (http://localhost:6006)
pnpm --filter storybook dev

# Build the library
pnpm --filter @thenamespace/ens-components build

# Build everything in dependency order
turbo run build

# Run the Sepolia end-to-end suite (setup in apps/e2e/README.md)
pnpm e2e
```

---

## Links

- **Live demo** — [enscomponents.com](https://enscomponents.com)
- **npm** — [@thenamespace/ens-components](https://www.npmjs.com/package/@thenamespace/ens-components)
- **API keys** — [app.namespace.ninja/offchain](https://app.namespace.ninja/offchain)
- **Namespace** — [namespace.ninja](https://namespace.ninja)
- **Builders Telegram** — [t.me/+u2X1_QbR-CVmMGIy](https://t.me/+u2X1_QbR-CVmMGIy)
