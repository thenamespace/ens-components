<img src="apps/landing/src/assets/logo-wide.png" alt="Namespace" height="36" />

# ENS Components

**Drop-in React components for ENS name registration, renewal, record editing, and subname issuance on ENSv2.**

[![npm](https://img.shields.io/npm/v/@thenamespace/ens-components)](https://www.npmjs.com/package/@thenamespace/ens-components)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Package checks](https://github.com/thenamespace/ens-components/actions/workflows/checks.yaml/badge.svg?branch=main)](https://github.com/thenamespace/ens-components/actions/workflows/checks.yaml)

[npm](https://www.npmjs.com/package/@thenamespace/ens-components) · [Playground](https://enscomponents.com) · [Releases](https://github.com/thenamespace/ens-components/releases)

<img src="apps/landing/src/assets/preview.png" alt="ENS UI Components for any React app" width="100%" />

---

## Live demo

**[enscomponents.com](https://enscomponents.com)** — interactive playground for all components with live prop editing and generated code snippets.

---

## What's included

| Component                                  | What it does                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `EnsNameRegistrationForm`                  | Register a `.eth` name — search, commit, wait, register. Paid in USDC or DAI    |
| `NameRenewForm`                            | Renew a `.eth` name in USDC or DAI                                              |
| `EnsRecordsForm`                           | Edit resolver records (addresses, text, contenthash, avatar) for a name you own |
| `SelectRecordsForm`                        | Standalone record composer — no wallet or transaction required                  |
| `SubnameMintForm`                          | Mint onchain subnames under a name activated on Namespace                       |
| `SubnameRenewForm`                         | Renew onchain subnames                                                          |
| `OffchainSubnameForm`                      | Create and update gasless offchain subnames via the Namespace API               |
| `TransactionProgress` / `TransactionModal` | The progress screen the forms use, available for your own transactions          |

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

## ENSv2

Registration, renewal, records, and onchain subnames all run on ENSv2, on mainnet or on Sepolia
with `isTestnet`. The one ENSv1 flow still in use is minting under an old Namespace listing:
pass `version={1}` to `SubnameMintForm` for those parents.

Wallets that support atomic batching (EIP-5792) sign the token approval, resolver deployment,
and main transaction in one prompt; other wallets send them one at a time.

### Upgrading to 3.0

`version` now defaults to `2` on `EnsNameRegistrationForm`, `NameRenewForm`, `EnsRecordsForm`,
and `SubnameMintForm`. If you mint under an old Namespace listing, pass `version={1}` to
`SubnameMintForm`. `TransactionPendingScreen` no longer takes a `message` prop.

---

## Components

### EnsNameRegistrationForm

Guides users through registering a `.eth` name: search → commit → wait → register. Paid in
USDC or DAI. Each owner gets their own resolver for their records, deployed with their first
registration.

```tsx
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

<EnsNameRegistrationForm
  isTestnet={false}
  referrer="0xYourReferrerAddress"
  onConnectWallet={() => openConnectModal()}
/>;
```

| Prop              | Type         | Description                                                            |
| ----------------- | ------------ | ---------------------------------------------------------------------- |
| `isTestnet`       | `boolean`    | Use Sepolia instead of mainnet                                         |
| `referrer`        | `string`     | Registration referrer wallet address. Defaults to Namespace's referrer |
| `noBorder`        | `boolean`    | Remove the card border                                                 |
| `title`           | `string`     | Override the form heading                                              |
| `subtitle`        | `string`     | Override the subtitle                                                  |
| `bannerImage`     | `string`     | Custom banner image URL                                                |
| `hideBanner`      | `boolean`    | Hide the banner entirely                                               |
| `onConnectWallet` | `() => void` | Called when the user needs to connect a wallet                         |

---

### NameRenewForm

Renews a `.eth` name in one step, paid in USDC or DAI. It shows the current expiry, prices the
extension, and sends the transaction. Anyone can renew any name; the owner keeps it.

```tsx
import { NameRenewForm } from "@thenamespace/ens-components";

<NameRenewForm
  name="alice.eth"
  onRenewalSuccess={data => console.log(data.fullName, data.newExpiry)}
/>;
```

| Prop               | Type                                 | Description                                                       |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------- |
| `name`             | `string`                             | `alice` or `alice.eth`. Leave empty to let the user type a name   |
| `isTestnet`        | `boolean`                            | Use Sepolia instead of mainnet                                    |
| `referrer`         | `string`                             | Renewal referrer wallet address. Defaults to Namespace's referrer |
| `noBorder`         | `boolean`                            | Remove the card border                                            |
| `title`            | `string`                             | Override the form heading                                         |
| `subtitle`         | `string`                             | Override the subtitle                                             |
| `onConnectWallet`  | `() => void`                         | Called when the user needs to connect a wallet                    |
| `onCancel`         | `() => void`                         | Called when the user cancels                                      |
| `onRenewalSuccess` | `(data: RenewalSuccessData) => void` | Called after the renewal confirms                                 |

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
/>;
```

| Prop              | Type         | Description                          |
| ----------------- | ------------ | ------------------------------------ |
| `name`            | `string`     | ENS name to edit                     |
| `existingRecords` | `EnsRecords` | Current on-chain records             |
| `isTestnet`       | `boolean`    | Use Sepolia instead of mainnet       |
| `noBorder`        | `boolean`    | Remove the card border               |
| `txConfirmations` | `number`     | Block confirmations to wait after tx |
| `onCancel`        | `() => void` | Called when the user cancels         |

---

### SelectRecordsForm

Standalone record editor with no wallet or transaction required. Use it to compose records before passing them to any other form.

```tsx
import { SelectRecordsForm } from "@thenamespace/ens-components";
import { useState } from "react";

const [records, setRecords] = useState({ addresses: [], texts: [] });

<SelectRecordsForm records={records} onRecordsUpdated={setRecords} />;
```

---

### SubnameMintForm

Full minting flow for onchain subnames — price lookup, profile records, and the mint
transaction. The parent must be a `.eth` name activated for subnames on
[app.namespace.ninja](https://app.namespace.ninja). The user picks the payment token: ETH,
USDC, or DAI (ETH or USDC on Sepolia).

```tsx
import { SubnameMintForm } from "@thenamespace/ens-components";

<SubnameMintForm
  parentName="yourname.eth"
  isTestnet={false}
  onConnectWallet={() => openConnectModal()}
/>;
```

| Prop              | Type         | Description                                                                                               |
| ----------------- | ------------ | --------------------------------------------------------------------------------------------------------- |
| `version`         | `1 \| 2`     | `1` for a parent on an old Namespace listing. Defaults to `2`                                             |
| `parentName`      | `string`     | Activated parent name. Old listings may also be DNS names imported into ENS                               |
| `isTestnet`       | `boolean`    | Use Sepolia instead of mainnet                                                                            |
| `resolver`        | `Address`    | Resolver for the new subname when the activation doesn't set one. Defaults to Namespace's shared resolver |
| `noBorder`        | `boolean`    | Remove the card border                                                                                    |
| `txConfirmations` | `number`     | Block confirmations to wait after tx                                                                      |
| `onConnectWallet` | `() => void` | Called when the user needs to connect                                                                     |
| `onCancel`        | `() => void` | Called when the user cancels                                                                              |

---

### SubnameRenewForm

Extends subnames minted under an activated name, at the price the parent's owner set. It
checks the subname, the parent, and the issuer before offering a transaction, and warns
when the subname would outlive its parent. Anyone can renew any subname; the renewal
extends it for its owner.

```tsx
import { SubnameRenewForm } from "@thenamespace/ens-components";

<SubnameRenewForm
  parentName="yourname.eth"
  label="alice"
  onRenewalSuccess={data => console.log(data.fullName, data.newExpiry)}
/>;
```

| Prop               | Type                                 | Description                                                        |
| ------------------ | ------------------------------------ | ------------------------------------------------------------------ |
| `parentName`       | `string`                             | Activated parent name, e.g. `yourname.eth`                         |
| `label`            | `string`                             | Subname label. Leave empty to let the user type one                |
| `isTestnet`        | `boolean`                            | Use Sepolia instead of mainnet                                     |
| `noBorder`         | `boolean`                            | Remove the card border                                             |
| `title`            | `string`                             | Override the form heading                                          |
| `subtitle`         | `string`                             | Override the subtitle                                              |
| `onConnectWallet`  | `() => void`                         | Called when the user needs to connect a wallet                     |
| `onCancel`         | `() => void`                         | Called when the user cancels                                       |
| `onRenewalSuccess` | `(data: RenewalSuccessData) => void` | Called after the renewal confirms                                  |
| `onRenewParent`    | `() => void`                         | Shows a link to renew the parent when the subname would outlive it |

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
  onSubnameCreated={async data => {
    await offchainManager.createSubname(data);
  }}
  onSubnameUpdated={async data => {
    await offchainManager.updateSubname(data.fullSubname, data);
  }}
/>;
```

Install the offchain manager separately:

```bash
npm install @thenamespace/offchain-manager
```

| Prop               | Type                      | Description                                  |
| ------------------ | ------------------------- | -------------------------------------------- |
| `name`             | `string`                  | Parent ENS name (`.eth` or ENS-imported DNS) |
| `offchainManager`  | `OffchainClient`          | Client from `createOffchainClient()`         |
| `isTestnet`        | `boolean`                 | Use Sepolia instead of mainnet               |
| `label`            | `string`                  | Pre-fill and lock the subname label          |
| `title`            | `string`                  | Override the header title                    |
| `subtitle`         | `string`                  | Show a subtitle below the header             |
| `hideTitle`        | `boolean`                 | Hide the header entirely                     |
| `onSubnameCreated` | `(data) => Promise<void>` | Called after a new subname is submitted      |
| `onSubnameUpdated` | `(data) => Promise<void>` | Called after an existing subname is updated  |

---

### TransactionProgress and TransactionModal

The progress screen every form shows while a transaction confirms, available for your own
transactions. Use `TransactionProgress` inline or `TransactionModal` in a modal.

```tsx
import { TransactionModal } from "@thenamespace/ens-components";

<TransactionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  status={status} // "pending" | "success" | "failed"
  hash={txHash}
  details={[{ label: "Name", value: "alice.eth" }]}
/>;
```

Props: `status`, `hash`, `chainId`, `isTestnet`, `title`, `description`, `details`, `duration`
(milliseconds the rail takes to reach 90% while pending), and `className`. `TransactionModal`
adds `isOpen`, `onClose`, and `footer`.

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

## Formatting and package checks

Prettier is configured at the repository root. Format the files you edit with
`pnpm exec prettier --write path/to/file`. Run `pnpm format:changed origin/main`
to check changed files before opening a PR. `pnpm format:check` checks the whole
repository, including existing formatting issues.

PR checks build the library, landing page, and Storybook, then pack the library
and verify its imports, exports, styles, declarations, README, and MIT license.
Run `pnpm build` followed by `pnpm check:package` to run those checks locally.
The Sepolia end-to-end suite remains a separate check that needs its documented
wallet and RPC setup. ESLint is installed but has no configuration yet; these
checks use Prettier and the TypeScript checks included in the builds.

## Publishing a release

1. In a PR, bump `packages/components/package.json` to an unpublished stable
   version. Move the relevant entries from `Unreleased` in [CHANGELOG.md](CHANGELOG.md)
   under a heading such as `## [3.0.1]`. Include migration instructions for breaking changes.
2. After review, approval, and merge, run **Publish npm package and GitHub release**
   from `main` in GitHub Actions. It validates the selected commit and publishes
   the checked tarball using the existing `NPM_TOKEN` secret, with npm provenance.
3. The workflow creates `v<version>` at that commit and a GitHub Release containing
   the reviewed notes and an npm link. It never commits or pushes to `main`.

To recover a failed run, rerun it at the same commit. It skips npm publishing only
if the existing version's tarball has the same integrity hash, and refuses to move
an existing tag. An existing completed release stays unchanged. This workflow
does not backfill releases for older packages or publish prereleases.

Keep the root and package `LICENSE` files identical; the package check verifies
this. To require PR checks before merging, a repository admin must make
**Format, build, and package** a required check in GitHub's branch rules.

## Links

- **Live demo** — [enscomponents.com](https://enscomponents.com)
- **npm** — [@thenamespace/ens-components](https://www.npmjs.com/package/@thenamespace/ens-components)
- **API keys** — [app.namespace.ninja/offchain](https://app.namespace.ninja/offchain)
- **Namespace** — [namespace.ninja](https://namespace.ninja)
- **Builders Telegram** — [t.me/+u2X1_QbR-CVmMGIy](https://t.me/+u2X1_QbR-CVmMGIy)
