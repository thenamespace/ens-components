# Advanced Flows

Read this file when the user asks for anything beyond the default ENS registration quickstart:

- ENS record editing
- controlled record UIs
- onchain subname minting
- offchain Namespace subnames
- theming, banners, callbacks, or custom behavior

## Prerequisites

Base App should have this installed

- `wagmi`
- `viem`
- `@tanstack/react-query`
- `@thenamespace/ens-components`
- `@thenamespace/ens-components/styles.css` imported once at the app root

Assume the caller can already provide:

- the ENS name or parent name for the flow
- the app hostname for `avatarUploadDomain`

Additional flow-specific prerequisites:

- `EnsRecordsForm`: existing ENS records must be fetched before render
- `SubnameMintForm`: the parent name must already have an active Namespace listing
- `OffchainSubnameForm`: `@thenamespace/offchain-manager`, a configured `OffchainClient`, and a valid API key for the parent name

## ENS Records

Use `EnsRecordsForm` when the user already owns the ENS name and wants a ready-made record editor.

```tsx
import { EnsRecordsForm } from "@thenamespace/ens-components";

<EnsRecordsForm
  name="yourname.eth"
  existingRecords={fetchedRecords}
  avatarUploadDomain="app.example.com"
  onRecordsUpdated={diff => {
    console.log(diff);
  }}
/>;
```

Important:

- The caller must fetch `existingRecords` before rendering.
- Use this instead of `SelectRecordsForm` unless the user explicitly needs a controlled or embedded UI.

## Controlled Records UI

Use `SelectRecordsForm` when the user wants to manage record state themselves or embed the records editor inside a larger flow.

```tsx
import { SelectRecordsForm } from "@thenamespace/ens-components";

const [records, setRecords] = useState({
  addresses: [],
  texts: [],
});

<SelectRecordsForm
  records={records}
  onRecordsUpdated={setRecords}
  avatarUpload={{
    ensName: "yourname.eth",
    siweDomain: "app.example.com",
  }}
  actionButtons={<button onClick={handleSave}>Save</button>}
/>;
```

Use this when:

- the user wants custom save buttons
- the editor must live inside a custom registration flow
- the surrounding screen owns the records state

## Onchain Subnames

Use `SubnameMintForm` when the parent ENS name has an active Namespace onchain listing and users should mint subnames onchain.

```tsx
import { SubnameMintForm } from "@thenamespace/ens-components";

<SubnameMintForm
  parentName="yourname.eth"
  avatarUploadDomain="app.example.com"
  onSuccess={data => {
    console.log("Minted:", `${data.label}.${data.parentName}`);
  }}
/>;
```

Important:

- The parent name must already have an active Namespace listing.
- The component handles chain-switch prompts.
- `referrer` belongs to `EnsNameRegistrationForm`, not `SubnameMintForm`.

## Offchain Subnames

Use `OffchainSubnameForm` for gasless Namespace subnames.

```tsx
import { OffchainSubnameForm } from "@thenamespace/ens-components";
import { createOffchainClient } from "@thenamespace/offchain-manager";

const offchainManager = createOffchainClient({
  mode: "mainnet",
  domainApiKeys: {
    "yourname.eth": "your-api-key",
  },
});

<OffchainSubnameForm
  offchainManager={offchainManager}
  name="yourname.eth"
  avatarUploadDomain="app.example.com"
/>;
```

Important behavior:

- The component uses `offchainManager.getSingleSubname()` for availability and update-mode detection.
- If the subname already exists, it enters update mode with prefilled records.
- If the user wants direct SDK CRUD, filtering, or record queries, use the `offchain-ens-subname-sdk` skill instead of this UI skill.

### Offchain persistence callbacks

Use callbacks only when the user wants custom behavior around submit, for example persistence control, analytics, or parent state refresh.

```tsx
<OffchainSubnameForm
  name="yourname.eth"
  offchainManager={offchainManager}
  onSubnameCreated={async data => {
    await offchainManager.createSubname({
      parentName: data.parentName,
      label: data.label,
      addresses: data.addresses,
      texts: data.texts,
      owner: data.owner,
    });
  }}
  onSubnameUpdated={async data => {
    await offchainManager.updateSubname(data.fullSubname, {
      addresses: data.addresses,
      texts: data.texts,
    });
  }}
/>
```

Note the current contract:

- `onSubnameCreated` receives create-shaped data, including `owner`
- `onSubnameUpdated` receives update-shaped data, without `owner`

## Theming And Presentation

### ThemeProvider

```tsx
import { ThemeProvider, useTheme } from "@thenamespace/ens-components";

<ThemeProvider initialTheme="dark" useDocument={true}>
  {/* components here */}
</ThemeProvider>;

const { theme, toggleTheme } = useTheme();
```

### CSS variables

```css
:root {
  --ns-font-family: "Inter", sans-serif;
  --ns-radius-sm: 4px;
  --ns-radius-md: 8px;
  --ns-radius-lg: 12px;
  --ns-color-bg: #ffffff;
  --ns-color-fg: #111827;
  --ns-color-muted: #6b7280;
  --ns-color-primary: #1f1f1f;
  --ns-color-border: #e5e7eb;
}

[data-theme="dark"] {
  --ns-color-bg: #0b0f19;
  --ns-color-fg: #e5e7eb;
  --ns-color-muted: #9ca3af;
  --ns-color-border: #1f2937;
}
```

### Avatar and header upload

All main flows support `avatarUploadDomain`. Pass the app hostname so the SIWE message matches the app the user is interacting with.

Constraints:

- avatar: 1:1 crop, max 2 MB
- header: rectangular crop, max 5 MB
- manual URL entry is available as fallback

### Banners and titles

Use banner props on `EnsNameRegistrationForm`:

```tsx
<EnsNameRegistrationForm
  title="Register your name"
  subtitle="Secure your ENS identity"
  bannerImage="/my-banner.png"
  bannerWidth={400}
  hideBanner={false}
/>
```

Use title props on `SubnameMintForm` or `OffchainSubnameForm`:

```tsx
<SubnameMintForm title="Claim your subname" subtitle="Powered by yourproject.eth" />
<OffchainSubnameForm title="Join our community" hideTitle={false} />
```

## Testnet

Use `isTestnet={true}` for Sepolia and staging APIs:

```tsx
<EnsNameRegistrationForm isTestnet={true} avatarUploadDomain="app.example.com" />
<EnsRecordsForm name="test.eth" existingRecords={records} isTestnet={true} />
<SubnameMintForm parentName="yourname.eth" isTestnet={true} />
```

## Exact Props To Check

Use this section when the user asks for exact prop names or the main examples are not enough.

### `EnsNameRegistrationForm`

Key props:

- `name`
- `isTestnet`
- `referrer`
- `bannerImage`, `hideBanner`, `title`, `subtitle`, `bannerWidth`
- `avatarUploadDomain`
- `onRegistrationStart`, `onRegistrationSuccess`, `onClose`, `onConnectWallet`

`onRegistrationSuccess` callback shape:

```ts
{
  durationLabel: string;      // e.g. "1 year" or "6 months, 3 days"
  expiryDate: string;         // formatted date string
  registrationCost: string;   // ETH
  transactionFees: string;    // ETH
  total: string;              // ETH
}
```

> **Breaking change (v1.3+):** `expiryInYears: number` was removed. Use `durationLabel: string` instead.

### `EnsRecordsForm`

Key props:

- `name`
- `existingRecords`
- `resolverChainId`, `resolverAddress`
- `isTestnet`, `txConfirmations`
- `avatarUploadDomain`
- `onTransactionSent`, `onRecordsUpdated`, `onGreat`, `onCancel`

### `SelectRecordsForm`

Key props:

- `records`
- `onRecordsUpdated`
- `avatarUpload`
- `actionButtons`

### `SubnameMintForm`

Key props:

- `parentName`
- `label`
- `isTestnet`, `txConfirmations`
- `title`, `subtitle`
- `avatarUploadDomain`
- `onSubnameMinted`, `onSuccess`, `onCancel`, `onConnectWallet`

### `OffchainSubnameForm`

Key props:

- `offchainManager`
- `name`
- `label`
- `title`, `subtitle`, `hideTitle`
- `isTestnet`
- `avatarUploadDomain`
- `onSubnameCreated`, `onSubnameUpdated`, `onCancel`

## Shared Shapes

```ts
interface EnsRecords {
  addresses: { coinType: number; value: string }[];
  texts: { key: string; value: string }[];
  contenthash?: { protocol: string; value: string };
}
```

```ts
interface OffchainSubnameCreatedData {
  label: string;
  parentName: string;
  fullSubname: string;
  addresses: Array<{ chain: ChainName; value: string }>;
  texts: Array<{ key: string; value: string }>;
  owner?: string;
}
```

## Dependencies

Consumers must install:

- `react`
- `react-dom`
- `wagmi`
- `viem`
- `@tanstack/react-query`
- `@thenamespace/offchain-manager` for Offchain Subnames

## Common Issues

| Symptom                               | Likely cause                               | Fix                                                                         |
| ------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| Styles not applying                   | CSS not imported                           | Import `@thenamespace/ens-components/styles.css` once at the root           |
| `CommitmentTooNew` error              | Register step called too quickly           | Wait the full 60s; the form handles this automatically                      |
| Chain mismatch in `SubnameMintForm`   | Wallet on wrong network                    | Ensure the app's wagmi config includes the listing chain                    |
| 404 from `OffchainSubnameForm`        | API key tied to a different parent name    | Verify the API key belongs to the parent name passed as `name`              |
| `useAccount` or storage errors in SSR | Client-only wallet code running during SSR | Guard provider code with `"use client"` and `typeof window !== "undefined"` |
