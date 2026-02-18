# Maintainer Notes

Internal reference for how this UI kit works today.

## 1) Product surface (what we are building)

The package is a reusable React ENS UI kit that powers four core flows:

1. ENS name registration (`.eth`)
2. Onchain subname minting
3. Offchain subname create/update
4. ENS record editing

It also exports reusable atoms/molecules and low-level hooks/utilities.

## 2) End-to-end flow mapping

### A) ENS name registration (`EnsNameRegistrationForm`)

Step flow:

1. User enters label (no dots, normalized with `viem/ens normalize`)
2. Availability and rent price are fetched via `useRegisterENS`
3. Optional profile records are built via `SelectRecordsForm`
4. Commitment tx (`commit`) is sent
5. UI waits fixed 60s timer
6. Register tx (`register`) is sent with resolver multicall payload
7. Success screen displays total and explorer links

Contract/SDK dependencies:

- `@thenamespace/addresses` for ENS contract addresses
- `useRegisterENS` for `rentPrice`, `commit`, `register`
- `useWaitTransaction` for receipt polling with retry/timeout

Important assumptions:

- Second-level labels only (`{label}.eth`)
- Wallet is connected and on expected chain (mainnet/sepolia)
- Resolver supports required methods

### B) Onchain subname mint (`SubnameMintForm`)

Step flow:

1. Listing config is fetched via list-manager API
2. Determine chain from listing metadata (L1/L2)
3. User enters label; availability + mint permissions are checked
4. Gas fee is estimated for current records
5. Mint tx params are requested via mint-manager client
6. Transaction is simulated/sent using `viem`
7. Receipt is awaited, then success data is emitted

Dependencies:

- `@thenamespace/mint-manager`
- list-manager endpoints:
  - `https://list-manager.namespace.ninja`
  - `https://staging.list-manager.namespace.ninja`

Important assumptions:

- User must switch to listing chain before minting
- Listing must be verified
- Validation errors from mint-manager drive blocking/non-blocking UI states

### C) Offchain subname create/update (`OffchainSubnameForm`)

Step flow:

1. Build offchain client with `domainApiKeys` map
2. User enters label
3. Query `getSingleSubname`:
   - not found -> create mode
   - found -> update mode with prefilled records/owner
4. Optional owner validation + records validation
5. Call `createSubname` or `updateSubname`
6. Re-fetch latest subname and show success

Dependencies:

- `@thenamespace/offchain-manager`

Important assumptions:

- Caller provides valid API key/token for the parent name
- Owner validation is regex-based EVM address format check
- Existence checks treat 404 as "does not exist"
- Avatar/header upload uses full subname (`{label}.{parent}`) in both create and
  update editing flows

### C.1) Avatar + header upload integration details

Avatar/header upload is integrated into the shared records editor
(`SelectRecordsForm`) and is reused by both onchain/offchain profile editing
views.

Wiring path:

1. `OffchainSubnameForm` passes `avatarUpload` context to
   `SetSubnameRecords`
2. `SetSubnameRecords` forwards `avatarUpload` into `SelectRecordsForm`
3. `SelectRecordsForm` opens `ImageUploadModal` with `imageType`
4. `ImageUploadModal` uses:
   - `useAvatarClient().uploadAvatar(...)` for avatar
   - `useAvatarClient().uploadHeader(...)` for header
5. Upload result is written back to the matching text record (`avatar` or `header`)

Related files:

- `src/components/offchain-subname-form/OffchainSubnameForm.tsx`
- `src/components/subname-mint-form/SetSubnameRecords.tsx`
- `src/components/select-records-form/SelectRecordsForm.tsx`
- `src/components/select-records-form/image-upload/ImageUploadModal.tsx`
- `src/components/select-records-form/avatar-upload/AvatarUploadModal.tsx`
- `src/components/select-records-form/header-upload/HeaderUploadModal.tsx`
- `src/hooks/useAvatarClient.tsx`

### C.2) Upload response normalization + logs

The avatar SDK may return payloads in slightly different shapes depending on
transport/wrapping. `useAvatarClient` normalizes common variants for both avatar
and header uploads before passing data into UI:

- root: `url`, `uploadedAt`, etc.
- nested: `data.url`, `result.url`, `data.data.url`, `result.data.url`
- alternate URL keys: `avatarUrl`, `imageUrl`, `fileUrl`

Browser logs were added to make debugging deterministic. Each log contains
`imageType` (`avatar` or `header`) to simplify filtering:

- `[ImageUploadModal] sign+upload started`
- `[ImageUploadModal] cropped file ready`
- `[ImageUpload] starting`
- `[ImageUpload] raw result`
- `[ImageUpload] normalized result`
- `[ImageUploadModal] upload result`
- error paths log `[ImageUpload] failed` / `[ImageUploadModal] upload error`

Validation defaults:

- avatar max upload size: 2MB (`AVATAR_MAX_SIZE`)
- header max upload size: 5MB (`HEADER_MAX_SIZE`)

### D) Record update flow (`EnsRecordsForm` + `EnsUpdateRecordsForm`)

Step flow:

1. Resolve resolver address (or use provided resolver)
2. Validate resolver support (currently permissive)
3. Edit record set with `SelectRecordsForm`
4. Compute diff (`getEnsRecordsDiff`)
5. Convert diff to resolver multicall payload
6. Send `multicall` tx and wait for receipt
7. Show pending/success/failure state UI

Dependencies:

- `useENSResolver`
- `convertToMulticallResolverData`

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

- diffing: `getEnsRecordsDiff`
- validation: `validateEnsRecords`
- resolver call data: `convertToMulticallResolverData`

## 4) Stack and packaging decisions

- Build output: ESM + CJS + d.ts
- Main entry: `src/index.tsx`
- CSS is shipped with package and imported at entrypoint
- Peer deps externalized: `react`, `react-dom`, `wagmi`, `viem`
- Storybook is source-of-truth for visual component examples

## 5) Known implementation caveats

1. Registration timer is fixed to 60s in UI.
3. Resolver support check currently returns `true` (placeholder logic).
4. Several local-storage caches are used; SSR environments need guards.
5. No automated tests in scripts (`npm test` is placeholder).
6. `EnsNameRegistrationForm` accepts `referrer` prop but does not currently
   forward it into `RegistrationProcess`.

## 6) Developer workflow assumptions

Consumers are expected to provide:

1. Wallet/provider context (wagmi + compatible connector UX)
2. Chain switching capability
3. Style import (`@thenamespace/ens-components/styles.css`)
4. For offchain flow: per-domain API credentials
5. For production: handling of callbacks like `onSuccess`, `onRecordsUpdated`,
   `onTransactionSent` to persist app state

## 7) Debugging image uploads

1. Run `npm run test-app`
2. Open browser DevTools console
3. Trigger an avatar or header upload from the records editor
4. Check logs:
   - `[ImageUploadModal] sign+upload started` / `cropped file ready` / `upload result`
   - `[ImageUpload] starting` / `raw result` / `normalized result`
   - Error paths: `[ImageUpload] failed` / `[ImageUploadModal] upload error`

Each log includes `imageType` (`avatar` or `header`) for filtering.

## 8) Useful local commands

```bash
npm run dev
npm run storybook
npm run test-app
npm run build
npm run lint
```
