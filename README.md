<img src="apps/landing/src/assets/logo-full.jpeg" alt="Namespace" height="36" />

# ENS Components

**Drop-in React components for ENS name registration, record editing, and subname issuance.**

[![npm](https://img.shields.io/npm/v/@thenamespace/ens-components)](https://www.npmjs.com/package/@thenamespace/ens-components)
[![license](https://img.shields.io/npm/l/@thenamespace/ens-components)](LICENSE)

<img src="apps/landing/src/assets/preview.png" alt="ENS UI Components for any React app" width="100%" />

---

## Live demo

**[uikit.namespace.ninja](https://enscomponents.com)** — interactive playground for all components with live prop editing and generated code snippets.

---

## What's included

| Component | What it does |
|-----------|-------------|
| `EnsNameRegistrationForm` | Full `.eth` registration flow — search, commit, wait, register |
| `EnsRecordsForm` | Edit resolver records (addresses, text, contenthash, avatar) for a name you own |
| `SelectRecordsForm` | Standalone record composer — no wallet or transaction required |
| `SubnameMintForm` | Mint onchain subnames from a Namespace listing |
| `OffchainSubnameForm` | Create and update gasless offchain subnames via the Namespace API |

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
| `referrer` | `string` | Registration referrer wallet address |
| `noBorder` | `boolean` | Remove the card border |
| `title` | `string` | Override the form heading |
| `subtitle` | `string` | Override the subtitle |
| `bannerImage` | `string` | Custom banner image URL |
| `hideBanner` | `boolean` | Hide the banner entirely |
| `onConnectWallet` | `() => void` | Called when the user needs to connect a wallet |

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
| `name` | `string` | ENS name to edit |
| `existingRecords` | `EnsRecords` | Current on-chain records |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
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
| `parentName` | `string` | ENS name users will mint subnames under |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `txConfirmations` | `number` | Block confirmations to wait after tx |
| `onConnectWallet` | `() => void` | Called when the user needs to connect |
| `onCancel` | `() => void` | Called when the user cancels |

---

### OffchainSubnameForm

Create and update gasless offchain subnames through the Namespace API. Requires an API key from [dev.namespace.ninja](https://dev.namespace.ninja).

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
| `name` | `string` | Parent ENS name |
| `offchainManager` | `OffchainClient` | Client from `createOffchainClient()` |
| `isTestnet` | `boolean` | Use Sepolia instead of mainnet |
| `label` | `string` | Pre-fill and lock the subname label |
| `title` | `string` | Override the header title |
| `subtitle` | `string` | Show a subtitle below the header |
| `hideTitle` | `boolean` | Hide the header entirely |
| `onSubnameCreated` | `(data) => Promise<void>` | Called after a new subname is submitted |
| `onSubnameUpdated` | `(data) => Promise<void>` | Called after an existing subname is updated |

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
    └── landing/           # Interactive demo & docs         (port 4000)
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
```

---

## Links

- **Live demo** — [uikit.namespace.ninja](https://uikit.namespace.ninja)
- **npm** — [@thenamespace/ens-components](https://www.npmjs.com/package/@thenamespace/ens-components)
- **API keys** — [dev.namespace.ninja](https://dev.namespace.ninja)
- **Namespace** — [namespace.ninja](https://namespace.ninja)
- **Builders Telegram** — [t.me/+u2X1_QbR-CVmMGIy](https://t.me/+u2X1_QbR-CVmMGIy)
