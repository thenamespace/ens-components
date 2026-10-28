---
name: ens-components
description: Use when a developer wants ENS flows in a React app with @thenamespace/ens-components, such as .eth name registration or renewal, editing ENS records, minting or renewing onchain subnames, gasless offchain subnames, ENSv2, avatar upload, theming, or choosing which component fits.
---

# @thenamespace/ens-components

Drop-in React forms for ENS and Namespace, built on wagmi. Each form owns its whole flow: pricing, token choice, wallet prompts, transaction progress and the success screen. Render the form and handle its callbacks. Never rebuild a step (commit, approve, register, mint) with your own wagmi calls, because the forms already sequence them.

## Pick a component

```
What does the user want?
├── Register a new .eth name ............ EnsNameRegistrationForm
├── Extend a .eth name .................. NameRenewForm
├── Edit records on a name they own
│   ├── Ready-made editor ............... EnsRecordsForm
│   └── Inside their own UI and state ... SelectRecordsForm
├── Let people claim subnames under a parent
│   ├── Gasless, stored by Namespace .... OffchainSubnameForm
│   └── Onchain
│       ├── Parent activated for ENSv2 .. SubnameMintForm
│       └── Parent has an old listing ... SubnameMintForm version={1}
├── Extend an onchain subname ........... SubnameRenewForm
└── Show progress for their own tx ...... TransactionProgress / TransactionModal
```

No specific flow named? Start with `EnsNameRegistrationForm`.

## Rules

- Every form runs on ENSv2 by default. Don't pass `version` anywhere except the case below.
- Pass `version={1}` to `SubnameMintForm` only when the user says the parent has an existing Namespace listing. That is the one remaining ENSv1 flow, and those parents can be DNS names imported into ENS. New parents are activated for ENSv2 on app.namespace.ninja.
- Never offer or document ENSv1 registration, renewal or records editing, because those flows are retired.
- Upgrading from 2.x: in 3.0 `version` defaults to 2. Integrations minting under old Namespace listings must add `version={1}`.
- `EnsNameRegistrationForm` registers second-level `.eth` names only. It can't register or import DNS names.
- For offchain subname CRUD or queries without UI, use the `offchain-ens-subname-sdk` skill instead.

## Quickstart

The app needs React 19+, with wagmi 2 and `@tanstack/react-query` providers already wrapping it. The forms read the wallet from wagmi and ship no connect UI.

Use the correct package manager.

```bash
npm install @thenamespace/ens-components
```

Import the stylesheet once at the app root. Without it the forms render unstyled.

```tsx
import "@thenamespace/ens-components/styles.css";
```

```tsx
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

<EnsNameRegistrationForm
  isTestnet={false}
  avatarUploadDomain="app.example.com"
  onConnectWallet={openConnectModal} // the app's wallet modal, e.g. RainbowKit's useConnectModal()
  onRegistrationSuccess={result => {
    // registrationCost is the USDC or DAI price. total only covers ETH network fees.
    console.log(
      result.durationLabel,
      result.expiryDate,
      result.registrationCost
    );
  }}
/>;
```

- Pass `onConnectWallet` to the registration, renewal and subname mint forms. Without it, a disconnected user has no working way to connect from inside the form.
- Set `avatarUploadDomain` to the bare hostname the page is served from (`app.example.com`), with no `https://`, path or trailing slash. It becomes the domain in the SIWE message the user signs to upload an avatar or header. When omitted it falls back to `window.location.hostname`.
- Use `isTestnet={true}` for Sepolia. ENSv2 works on mainnet and Sepolia.

Read `advanced.md` for each component's props and callbacks, ENSv2 payment behavior, offchain subnames, records, renewals, theming and common issues.
