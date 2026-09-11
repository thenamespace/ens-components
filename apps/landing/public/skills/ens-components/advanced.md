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

`EnsRecordsForm`, `SubnameMintForm`, and `OffchainSubnameForm` support native
`.eth` names and DNS names already imported into ENS (for example `example.com`).
`EnsNameRegistrationForm` cannot import or register DNS names; it only registers
second-level `.eth` names through the ETH Registrar Controller.

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
- `name` may be a native `.eth` name or a DNS name imported into ENS.
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
- The parent may be a native `.eth` name or a DNS name imported into ENS.
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

- The parent may be a native `.eth` name or a DNS name imported into ENS; the installed offchain SDK validates both.
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

> **v2.0.0 is a visual overhaul** (Namespace Flows design system: new
> token layer, near-black accent, 10px corners, DM Sans/DM Mono). Component
> props, hooks, exports and web3 flows are unchanged — no public API broke.

### ThemeProvider

```tsx
import { ThemeProvider, useTheme } from "@thenamespace/ens-components";

<ThemeProvider initialTheme="dark" useDocument={true}>
  {/* components here */}
</ThemeProvider>;

const { theme, toggleTheme } = useTheme();
```

### CSS variables

The library ships a token layer (`styles/tokens.css`); every token is
`--ns-`-prefixed so it cannot collide with host CSS. The design (v2, the
Namespace Flows system) is light-only: warm off-white ground, a single
near-black accent, 10px corners, no shadows, DM Sans for text and DM Mono for
names, amounts, dates and hashes. Fonts load from Google Fonts inside the
stylesheet itself, so no font setup is needed in the host app.

```css
:root {
  --ns-font-family: "DM Sans", system-ui, sans-serif;
  --ns-font-mono: "DM Mono", ui-monospace, monospace;

  --ns-bg: #fbfaf9;        /* page ground — set it yourself on the host page */
  --ns-surface: #ffffff;   /* card surface */
  --ns-text: #1b1d1e;
  --ns-ink: #212121;       /* the accent — the whole ramp derives from it */
  --ns-radius: 10px;       /* single radius lever */
  --ns-link: #0080bc;      /* links stay blue, separate from the accent */
}
```

Overriding works differently since v2:

- The accent ramp derives from `--ns-ink`. Re-accent by setting `--ns-ink`; the
  legacy `--ns-blue-*` names still resolve because they alias the ink ramp.
- Corners are controlled by the single `--ns-radius` token.
- The legacy `--ns-color-*`, `--ns-radius-sm/md/lg`, and `--ns-alert-*`
  variables remain as aliases, so older overrides keep working — but they are
  no longer the primary levers.

Dark theme: `ThemeProvider` still sets `data-theme="dark"` and legacy dark
values are kept so the API keeps working, but the design ships light-only and
the dark palette is unrefreshed — treat dark mode as best-effort, not polished.

The library no longer forces the host page's `html` background. Consumers that
want the design ground set `background: var(--ns-bg)` themselves.

### Avatar and header upload

All main flows support `avatarUploadDomain`. Pass the app hostname so the SIWE message matches the app the user is interacting with.

- EOAs and deployed smart-contract wallets can authorize uploads
- the SDK enforces the configured network before signing (and switches when the wallet supports it)
- upload results expose a stable `url` field

Constraints:

- avatar: 1:1 crop, max 2 MB
- header: rectangular crop, max 5 MB
- formats: JPEG, PNG, GIF, WebP, SVG
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
  durationLabel: string; // e.g. "1 year" or "6 months, 3 days"
  expiryDate: string; // formatted date string
  registrationCost: string; // ETH
  transactionFees: string; // ETH
  total: string; // ETH
}
```

> **Breaking change (v1.3+):** `expiryInYears: number` was removed. Use `durationLabel: string` instead.

**Duration picker:** The form includes a built-in toggle between a years `+/−` picker (default) and a calendar date picker. Minimum registration is **28 days** — this is enforced by the ENS `ETHRegistrarController` contract and cannot be lowered.

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
| Avatar upload: wrong network          | Wallet chain != mainnet/sepolia for upload | App wagmi config must include the target chain; SDK will try to switch      |
| 404 from `OffchainSubnameForm`        | API key tied to a different parent name    | Verify the API key belongs to the parent name passed as `name`              |
| `useAccount` or storage errors in SSR | Client-only wallet code running during SSR | Guard provider code with `"use client"` and `typeof window !== "undefined"` |
