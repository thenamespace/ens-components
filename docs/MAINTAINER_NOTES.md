# Maintainer Notes

Internal reference for how this UI kit works today.

---

## 1) Product surface

The package is a reusable React ENS UI kit exposing five core components:

1. **ENS name registration** — `EnsNameRegistrationForm`
2. **ENS record editing** — `EnsRecordsForm`
3. **Record composer** — `SelectRecordsForm` (no wallet required)
4. **Onchain subname minting** — `SubnameMintForm`
5. **Offchain subname create/update** — `OffchainSubnameForm`

It also exports reusable atoms/molecules and low-level hooks/utilities.

---

## 2) End-to-end flow mapping

### A) ENS name registration (`EnsNameRegistrationForm`)

Step flow:

1. User enters label (no dots, normalized with `viem/ens normalize`)
2. Availability and rent price fetched via `useRegisterENS`
3. Optional profile records built via `SelectRecordsForm`
4. Commitment tx (`commit`) sent
5. UI waits fixed 60 s timer
6. Register tx (`register`) sent with resolver multicall payload
7. Success screen shows total and explorer links

Contract / SDK dependencies:

- `@thenamespace/addresses` — ENS contract addresses
- `useRegisterENS` — `rentPrice`, `commit`, `register`
- `useWaitTransaction` — receipt polling with retry/timeout

Important assumptions:

- Second-level labels only (`{label}.eth`)
- Wallet connected on expected chain (mainnet / sepolia)
- Resolver supports required methods

---

### B) Onchain subname mint (`SubnameMintForm`)

Step flow:

1. Listing config fetched via list-manager API
2. Chain determined from listing metadata (L1 / L2)
3. User enters label; availability + mint permissions checked
4. Gas fee estimated for current records
5. Mint tx params requested via mint-manager client
6. Transaction simulated / sent using viem
7. Receipt awaited, success data emitted

Dependencies:

- `@thenamespace/mint-manager`
- list-manager endpoints:
  - `https://list-manager.namespace.ninja`
  - `https://staging.list-manager.namespace.ninja`

Important assumptions:

- User must switch to listing chain before minting
- Listing must be verified
- Validation errors from mint-manager drive blocking/non-blocking UI states

---

### C) Offchain subname create/update (`OffchainSubnameForm`)

#### Architecture

The form is a **pure UI component** — it does not call the offchain API itself.
The caller creates an `OffchainClient` externally and passes it as a prop.
API calls (`createSubname` / `updateSubname`) are delegated to the
`onSubnameCreated` / `onSubnameUpdated` callbacks, which the caller must
implement.

```
Caller
  └── creates OffchainClient via createOffchainClient()
  └── passes it as offchainManager prop
  └── implements onSubnameCreated / onSubnameUpdated callbacks
         └── calls offchainManager.createSubname() / .updateSubname()

OffchainSubnameForm (internal)
  └── uses offchainManager for READ-ONLY operations:
        getSingleSubname()  — availability / update-mode detection
  └── on submit: builds OffchainSubnameCreatedData and awaits callback
  └── shows success screen if callback resolves, error if it throws
```

Step flow:

1. Caller creates `OffchainClient` with `createOffchainClient({ domainApiKeys, mode })`
2. User enters label
3. Form calls `getSingleSubname`:
   - not found → create mode (available)
   - found → update mode with prefilled records + owner
4. Optional owner validation + records validation
5. On submit: form builds `OffchainSubnameCreatedData` (matching create/update request shape)
6. Form awaits `onSubnameCreated(data)` or `onSubnameUpdated(data)`
7. Caller is responsible for calling `offchainManager.createSubname()` / `updateSubname()` inside the callback
8. Success screen shown if callback resolves; error shown if it throws

#### `OffchainSubnameCreatedData` shape

Deliberately mirrors the offchain-manager request payload so callbacks can
forward it directly:

```ts
interface OffchainSubnameCreatedData {
  label: string;
  parentName: string;
  fullSubname: string;                            // "{label}.{parentName}"
  addresses: Array<{ chain: ChainName; value: string }>;
  texts: Array<{ key: string; value: string }>;
  owner?: string;
}
```

Note: `owner` is only valid for `createSubname` — `UpdateSubnameRequest` has
no `owner` field.

#### Dependencies

- `@thenamespace/offchain-manager` — externalized peer dep (not bundled)

#### Important assumptions

- Caller provides a valid `OffchainClient` with correct API credentials
- Owner validation is regex-based EVM address format check
- Existence checks treat 404 as "does not exist"
- Avatar/header upload uses full subname (`{label}.{parent}`) in both create
  and update editing flows

---

### C.1) Avatar + header upload integration

Avatar/header upload is integrated into the shared records editor
(`SelectRecordsForm`) and reused by both onchain/offchain profile editing views.

Wiring path:

1. `OffchainSubnameForm` passes `avatarUpload` context to `SetSubnameRecords`
2. `SetSubnameRecords` forwards `avatarUpload` into `SelectRecordsForm`
3. `SelectRecordsForm` opens `ImageUploadModal` with `imageType`
4. `ImageUploadModal` uses:
   - `useAvatarClient().uploadAvatar(...)` for avatar
   - `useAvatarClient().uploadHeader(...)` for header
5. Upload result written back to matching text record (`avatar` or `header`)

Related files:

- `src/components/offchain-subname-form/OffchainSubnameForm.tsx`
- `src/components/subname-mint-form/SetSubnameRecords.tsx`
- `src/components/select-records-form/SelectRecordsForm.tsx`
- `src/components/select-records-form/image-upload/ImageUploadModal.tsx`
- `src/hooks/useAvatarClient.tsx`

---

### C.2) Avatar SDK v2 upload results

`@thenamespace/avatar` v2 normalizes upload responses to a stable `url`
field (plus `avatarUrl` / `headerUrl`). `useAvatarClient` relies on that
and only guards against a missing `url`.

v2 also enforces wallet network before SIWE (via `getChainId` /
`switchChain` on the provider) and supports SIWE v4 for smart-contract
wallets. Header mutations use the compact Metadata Service `/h` route.

Debug logs (filter by `imageType: avatar | header`):

- `[ImageUploadModal] sign+upload started`
- `[ImageUploadModal] cropped file ready`
- `[ImageUpload] starting` / `upload result`
- `[ImageUploadModal] upload result`
- Error paths: `[ImageUpload] failed` / `[ImageUploadModal] upload error`

Validation defaults:

- Avatar max upload size: 2 MB (`AVATAR_MAX_SIZE`)
- Header max upload size: 5 MB (`HEADER_MAX_SIZE`)

---

### D) Record update flow (`EnsRecordsForm`)

Step flow:

1. Resolve resolver address (or use provided resolver)
2. Validate resolver support (currently permissive)
3. Edit record set with `SelectRecordsForm`
4. Compute diff (`getEnsRecordsDiff`)
5. Convert diff to resolver multicall payload
6. Send `multicall` tx and wait for receipt
7. Show pending / success / failure state UI

Dependencies:

- `useENSResolver`
- `convertToMulticallResolverData`

---

## 3) Core data model

All main flows share:

```ts
interface EnsRecords {
  addresses: { coinType: number; value: string }[];
  texts: { key: string; value: string }[];
  contenthash?: { protocol: string; value: string };
}
```

Internal utilities:

- `getEnsRecordsDiff` — diff two `EnsRecords` objects
- `validateEnsRecords` — validate before submit
- `convertToMulticallResolverData` — build resolver call payload

---

## 4) Stack and packaging

| Concern | Decision |
|---------|----------|
| Build output | ESM only (`dist/index.js`), type declarations (`dist/index.d.ts`) |
| Main entry | `src/index.tsx` |
| CSS | Shipped with package, imported via `@thenamespace/ens-components/styles.css` |
| Peer deps externalized | `react`, `react-dom`, `wagmi`, `viem`, `@tanstack/react-query`, **`@thenamespace/offchain-manager`** |
| Build tool | Rollup + esbuild + rollup-plugin-dts |
| Type generation | `tsc -p tsconfig.types.json` → `dist/types/` → bundled by `rollup-plugin-dts` |
| Monorepo | pnpm workspaces + Turborepo |

### Why `@thenamespace/offchain-manager` is external

The offchain manager is externalized in `rollup.config.mjs` so that `ChainName`
and other types resolve to the **same module instance** in both the library and
the consumer. If it were bundled, rollup would rename the type (e.g.
`ChainName$1`), causing structural type incompatibilities when consumers pass
`OffchainSubnameCreatedData.addresses` to `offchainManager.createSubname()`.

Consumers must therefore install `@thenamespace/offchain-manager` separately.

---

## 5) Known caveats

1. Registration timer is fixed to 60 s in UI.
2. Resolver support check returns `true` (placeholder logic).
3. Several localStorage caches are used — SSR environments need guards.
4. No automated tests (`npm test` is a placeholder).
5. `OffchainSubnameForm` does not call the API internally — if the caller
   omits `onSubnameCreated` / `onSubnameUpdated`, the submit button will
   appear to succeed (callback is optional) but no subname will be created.

---

## 6) Developer workflow assumptions

Consumers are expected to provide:

1. Wallet/provider context (`wagmi` + compatible connector UX)
2. Chain-switching capability
3. Style import (`@thenamespace/ens-components/styles.css`)
4. For offchain flow: an `OffchainClient` instance created with `createOffchainClient()`, and callback implementations that call the API
5. For production: handle `onSubnameCreated`, `onSubnameUpdated`, `onRecordsUpdated`, `onTransactionSent` to persist app state

---

## 7) Useful local commands

```bash
# Install all workspace deps
pnpm install

# Start landing page dev server (http://localhost:4000)
pnpm --filter landing dev

# Start Storybook (http://localhost:6006)
pnpm --filter storybook dev

# Build the library only
pnpm --filter @thenamespace/ens-components build

# Build everything in dependency order
turbo run build

# Type-check the landing page
pnpm --filter landing exec tsc --noEmit
```

---

## 8) Dependency versions (current)

| Package | Version |
|---------|---------|
| `viem` | `^2.46.3` |
| `wagmi` | `^2.19.5` |
| `@rainbow-me/rainbowkit` | `^2.2.10` |
| `@thenamespace/offchain-manager` | `^1.0.10` |
| `@thenamespace/mint-manager` | `^1.1.1` |

> **wagmi v3 hold**: rainbowkit `^2.x` requires `wagmi ^2.x`. Do not upgrade
> wagmi to v3 until rainbowkit releases a compatible version.
