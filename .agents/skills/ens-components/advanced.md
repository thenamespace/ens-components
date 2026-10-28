# Advanced

Read the section for the component you are wiring. Every snippet assumes the stylesheet import and wagmi providers from `SKILL.md`, and leaves out `onConnectWallet` and `avatarUploadDomain` for brevity. Keep both in real code.

## ENSv2 behavior

This applies to registration, renewal, subname minting and subname renewal. The only exception is `SubnameMintForm version={1}`.

- **Networks:** mainnet, or Sepolia with `isTestnet`.
- **Payment:** `.eth` registration and renewal are paid in USDC or DAI. Subname mints and renewals are paid in whatever the parent's activation accepts: ETH, USDC or DAI on mainnet, and ETH or USDC on Sepolia. The user picks the token inside the form, so don't hardcode a token or ask for one up front. Network fees are always ETH.
- **Wallet prompts:** wallets with EIP-5792 atomic batching confirm each step in one prompt. Other wallets get one transaction per call, for example approving the token or deploying a resolver first. Both are expected. Never add your own approve step.
- **Balances:** if the wallet holds too little of the chosen token, or too little ETH for gas, the form shows "Insufficient funds" and blocks the transaction. Don't add your own balance check.

## Registration: `EnsNameRegistrationForm`

```tsx
<EnsNameRegistrationForm
  name="alice" // optional prefill
  title="Register your name"
  onRegistrationSuccess={result => console.log(result.registrationCost)}
/>
```

- Flow: commit, wait, register, success screen. The duration picker switches between years and a calendar date. The minimum is 28 days, enforced by the registrar contract.
- Each owner gets their own PermissionedResolver, which is deployed on their first registration as an extra step in the same flow. Records set during registration go there.
- Registration ignores `referrer`. Don't pass it expecting registration rewards.
- `onRegistrationSuccess` receives `{ durationLabel, expiryDate, registrationCost, transactionFees, total }`, all strings. `registrationCost` is the USDC or DAI amount. `transactionFees` and `total` are both the ETH network fees, so never show `total` as the price.

Props: `name`, `isTestnet`, `title`, `subtitle`, `bannerImage`, `bannerWidth`, `hideBanner`, `noBorder`, `className`, `avatarUploadDomain`, `onRegistrationStart(name)`, `onRegistrationSuccess`, `onClose(isSuccess)`, `onConnectWallet`.

## Renewal: `NameRenewForm`

```tsx
<NameRenewForm
  name="alice.eth"
  onRenewalSuccess={data =>
    console.log(data.newExpiry, data.price, data.priceCurrency)
  }
/>
```

- `name` accepts `alice` or `alice.eth`. Omit it to let the user type a name.
- Anyone can renew any name, and the owner keeps it. Don't gate the form on the connected wallet owning the name.
- `referrer` is passed through to the renewal.

Props: `name`, `isTestnet`, `referrer`, `title`, `subtitle`, `className`, `noBorder`, `onCancel`, `onConnectWallet`, `onRenewalSuccess(RenewalSuccessData)`.

## Records: `EnsRecordsForm` and `SelectRecordsForm`

```tsx
<EnsRecordsForm
  name="alice.eth"
  existingRecords={records} // fetched before render
  onRecordsUpdated={diff => console.log(diff)}
/>
```

- Fetch the name's current records before rendering and pass them as `existingRecords` (the `EnsRecords` shape below). The form edits from that baseline and writes only what changed, so an empty placeholder for a name that has records hides them from the user.
- The form finds the resolver through the ENSv2 Universal Resolver and works with standard resolvers, PermissionedResolvers and Namespace's SimplifiedResolver. Pass `resolverAddress` or `resolverChainId` only to override the lookup.

Props: `name`, `existingRecords`, `isTestnet`, `resolverAddress`, `resolverChainId`, `txConfirmations`, `noBorder`, `className`, `avatarUploadDomain`, `onTransactionSent(hash)`, `onRecordsUpdated(diff)`, `onGreat`, `onCancel`.

Use `SelectRecordsForm` only when the surrounding screen owns the record state or saving, such as a custom save button or a records step inside a larger flow. It sends no transactions.

```tsx
const [records, setRecords] = useState<EnsRecords>({
  addresses: [],
  texts: [],
});

<SelectRecordsForm
  records={records}
  onRecordsUpdated={setRecords}
  avatarUpload={{ ensName: "alice.eth", siweDomain: "app.example.com" }}
  actionButtons={<button onClick={save}>Save</button>}
/>;
```

Props: `records`, `onRecordsUpdated`, `avatarUpload` (`{ ensName, isTestnet?, siweDomain? }`), `actionButtons`, `noBorder`.

## Onchain subnames: `SubnameMintForm`

```tsx
<SubnameMintForm
  parentName="yourname.eth"
  onSuccess={data => console.log(data.fullName, data.price, data.priceCurrency)}
/>
```

- The parent must be a `.eth` name with a Namespace ENSv2 activation, which its owner sets up on app.namespace.ninja. The activation sets price, payment tokens, whitelist and reservations. The form fetches whitelist and reservation proofs itself.
- `resolver` sets the new subname's resolver when the activation doesn't set one. It defaults to Namespace's shared resolver, and `version={1}` ignores it.
- Pass `version={1}` only to mint under an old Namespace listing (`.eth` or a DNS name imported into ENS). That flow pays in ETH. Some of those listings live on Base or Optimism, so the app's wagmi config must include that chain. The form prompts the chain switch.

Props: `version`, `parentName`, `label`, `resolver`, `isTestnet`, `txConfirmations`, `title`, `subtitle`, `noBorder`, `avatarUploadDomain`, `onSuccess`, `onSubnameMinted`, `onCancel`, `onConnectWallet`.

- `onSuccess` receives `{ fullName, label, parentName, txHash, price, priceCurrency?, transactionFees, records }`.
- `onSubnameMinted` receives `{ fullSubname, label, parentName, records, price, transactionFees, ownerAddress, txHash, chainId }`.

## Subname renewal: `SubnameRenewForm`

```tsx
<SubnameRenewForm
  parentName="yourname.eth"
  label="alice"
  onRenewParent={() => setShowParentRenewal(true)}
  onRenewalSuccess={data => console.log(data.newExpiry)}
/>
```

- `parentName` is the ENSv2-activated parent. Omit `label` to let the user type it.
- The price is whatever the parent's owner set. Anyone can renew any subname, and the owner keeps it.
- When the new expiry would outlive the parent, the form warns that the subname stops resolving once the parent expires. Pass `onRenewParent` to add a link in that warning, and wire it to a `NameRenewForm` for the parent.

Props: `parentName`, `label`, `isTestnet`, `title`, `subtitle`, `className`, `noBorder`, `onCancel`, `onConnectWallet`, `onRenewalSuccess(RenewalSuccessData)`, `onRenewParent`.

## Offchain subnames: `OffchainSubnameForm`

The form only reads from Namespace: it checks availability, and if the subname already exists it switches to update mode with the records prefilled. It never writes. A subname exists only once your `onSubnameCreated` or `onSubnameUpdated` callback saves it. Without callbacks, the form shows success and nothing is created.

Keep the API key on a server. It grants write access to every subname under the parent, so it must not ship in client code. Keys come from app.namespace.ninja/offchain.

```tsx
// Client: a keyless client is enough for the form's reads.
import {
  OffchainSubnameForm,
  type OffchainSubnameCreatedData,
} from "@thenamespace/ens-components";
import { createOffchainClient } from "@thenamespace/offchain-manager";

const offchainManager = createOffchainClient({ mode: "mainnet" }); // "sepolia" for testnet

// The form shows success when this resolves and an error when it throws.
async function saveSubname(data: OffchainSubnameCreatedData) {
  const res = await fetch("/api/subnames", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

<OffchainSubnameForm
  name="yourname.eth"
  offchainManager={offchainManager}
  onSubnameCreated={saveSubname}
  onSubnameUpdated={saveSubname}
/>;
```

```ts
// Server: authorize the request (who may create or edit which label) before writing.
const offchain = createOffchainClient({
  mode: "mainnet",
  domainApiKeys: { "yourname.eth": process.env.NAMESPACE_API_KEY! },
});

const existing = await offchain.getSingleSubname(data.fullSubname);
if (existing) {
  await offchain.updateSubname(data.fullSubname, {
    addresses: data.addresses,
    texts: data.texts,
  });
} else {
  const { parentName, label, addresses, texts, owner } = data;
  await offchain.createSubname({ parentName, label, addresses, texts, owner });
}
```

- Install `@thenamespace/offchain-manager` for `createOffchainClient`.
- The parent can be a `.eth` name or a DNS name imported into ENS.
- Both callbacks receive `{ label, parentName, fullSubname, addresses: { chain, value }[], texts: { key, value }[], owner? }`.

Props: `offchainManager`, `name`, `label`, `title`, `subtitle`, `hideTitle`, `isTestnet`, `noBorder`, `avatarUploadDomain`, `onSubnameCreated`, `onSubnameUpdated`, `onCancel`.

## Transaction progress

Every form already uses this screen. Use it directly only for transactions your own code sends.

```tsx
import {
  TransactionProgress,
  TransactionModal,
} from "@thenamespace/ens-components";

<TransactionProgress
  status="pending" // "pending" | "success" | "failed"
  hash={txHash}
  details={[{ label: "Name", value: "alice.eth" }]}
/>;

<TransactionModal
  isOpen={open}
  onClose={() => setOpen(false)}
  status="success"
  hash={txHash}
/>;
```

- `TransactionProgress` props: `status`, `hash`, `chainId`, `isTestnet` (picks the Sepolia explorer when `chainId` isn't set), `title`, `description`, `details` (`{ label, value }[]`), `duration` (ms to reach 90% while pending, default 10000), `className`.
- `TransactionModal` takes the same props plus `isOpen`, `onClose` and `footer`.
- `TransactionPendingScreen` is still exported but no longer accepts `message`. Drop `message` from existing calls.

## Avatar and header upload

Every form with a records step offers image upload. `SelectRecordsForm` offers it only when it gets the `avatarUpload` prop. The user signs a SIWE message for `avatarUploadDomain` (or `avatarUpload.siweDomain`). EOAs and deployed smart-contract wallets can both sign.

- Avatar: 1:1 crop, max 2 MB. Header: rectangular crop, max 5 MB.
- Formats: JPEG, PNG, GIF, WebP, SVG. Users can paste a URL instead.

## Theming

Override `--ns-` tokens in the host CSS. Fonts (DM Sans, DM Mono) load from the stylesheet itself.

```css
:root {
  --ns-ink: #212121; /* accent; the whole accent ramp derives from it */
  --ns-radius: 10px; /* every corner */
  --ns-bg: #fbfaf9; /* page ground */
  --ns-surface: #ffffff; /* card surface */
  --ns-text: #1b1d1e;
  --ns-link: #0080bc;
  --ns-font-family: "DM Sans", system-ui, sans-serif;
  --ns-font-mono: "DM Mono", ui-monospace, monospace;
}
```

- Re-accent with `--ns-ink` and change corners with `--ns-radius`. Older names (`--ns-color-*`, `--ns-blue-*`, `--ns-radius-sm/md/lg`) are aliases, so don't use them as levers.
- The library doesn't set the page background. Add `background: var(--ns-bg)` to the host page to match.
- The design is light-only. `ThemeProvider initialTheme="dark"` and `useTheme()` exist, but the dark palette is unpolished, so don't present dark mode as a feature.
- `noBorder` removes the card border. `className` is supported on the registration, records, renewal and progress components.

## Shared shapes

```ts
interface EnsRecords {
  addresses: { coinType: number; value: string }[];
  texts: { key: string; value: string }[];
  contenthash?: { protocol: string; value: string };
}

interface RenewalSuccessData {
  fullName: string;
  txHash: string;
  price: string;
  priceCurrency: string; // "ETH", "USDC" or "DAI"
  transactionFees: string; // ETH
  newExpiry: string;
}
```

## Common issues

| Symptom                                         | Cause                                       | Fix                                                                            |
| ----------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------ |
| Forms unstyled                                  | Stylesheet not imported                     | Import `@thenamespace/ens-components/styles.css` once at the root              |
| Offchain form shows success, no subname         | No `onSubnameCreated` / `onSubnameUpdated`  | Save the subname in the callbacks (see Offchain subnames)                      |
| Unauthorized or 404 saving an offchain subname  | API key missing or for a different parent   | Use a key issued for the exact parent passed as `name`                         |
| "Insufficient funds"                            | Too little of the token, or of ETH for gas  | Fund the wallet or pick another token in the form                              |
| "Couldn't verify the whitelist"                 | Proof fetch from Namespace failed           | The user presses Try again in the form                                         |
| Chain switch fails in `SubnameMintForm`         | Listing chain missing from the wagmi config | Add the chain (mainnet, Sepolia, Base or Optimism) to the wagmi config         |
| Avatar upload asks for the wrong network        | Target chain missing from the wagmi config  | Include mainnet (or Sepolia) in the wagmi config; the SDK then switches        |
| `window`, `localStorage` or wagmi errors in SSR | Wallet code running on the server           | Render the forms in `"use client"` components and keep wallet code client-only |
