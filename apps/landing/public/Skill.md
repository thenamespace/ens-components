---
name: ens-components
description: Use when a developer asks how to choose, integrate, or customize @thenamespace/ens-components in a React app, especially for ENS registration, ENS record editing, onchain subname minting, offchain subnames, avatar upload, theming, or deciding which ENS component fits their flow.
---

# @thenamespace/ens-components

React UI kit for ENS and Namespace flows. Built on wagmi; no wallet UI library is required.

## Which One To Use

| Need                                                | Use                       |
| --------------------------------------------------- | ------------------------- |
| Register a `.eth` name                              | `EnsNameRegistrationForm` |
| Edit records on an ENS name the user already owns   | `EnsRecordsForm`          |
| Embed the records UI inside a custom flow           | `SelectRecordsForm`       |
| Mint a subname from a Namespace onchain listing     | `SubnameMintForm`         |
| Create or update gasless subnames through Namespace | `OffchainSubnameForm`     |

Routing rules:

- Default to `EnsNameRegistrationForm` when the user asks for a general quickstart.
- Use `EnsRecordsForm` only when the user already has an ENS name and wants to edit records.
- Use `SelectRecordsForm` only for custom or controlled UIs.
- Use `SubnameMintForm` for onchain subname listings.
- Use `OffchainSubnameForm` for gasless Namespace subnames.
- If the user wants direct offchain-manager SDK CRUD, filtering, or record queries instead of the UI component, use the `offchain-ens-subname-sdk` skill.

## Read Next

- Read `advanced.md` for records flows, onchain subnames, offchain subnames, theming, callback-driven customization, exact props, and common issues.

## ENS Quickstart

Use this as the default first answer unless the user clearly asked for records or subnames.

### 0. Prerequisites

Assume these are already present in the app:

- `wagmi`
- `viem`
- `@tanstack/react-query`

### 1. Install

```bash
npm install @thenamespace/ens-components
```

Import the stylesheet once at the app root:

```tsx
import "@thenamespace/ens-components/styles.css";
```

### 2. Render The ENS Form

In the default quickstart, include `avatarUploadDomain`. Treat it as required for the quickstart because image upload and SIWE signing should use the app's own hostname, not the fallback Namespace domain.

```tsx
import { EnsNameRegistrationForm } from "@thenamespace/ens-components";

<EnsNameRegistrationForm
  isTestnet={false}
  avatarUploadDomain="app.example.com"
  onRegistrationSuccess={result => {
    // result.durationLabel  — human-readable duration, e.g. "1 year" or "6 months, 3 days"
    // result.expiryDate     — formatted expiry date string
    // result.registrationCost, result.transactionFees, result.total — ETH strings
    console.log(result.durationLabel, result.expiryDate, result.total);
  }}
/>;
```

Rules for `avatarUploadDomain`:

- Pass the bare hostname only, for example `app.example.com`.
- Do not include `https://` or a trailing slash.

### 3. Explain What The Component Handles

Call out that `EnsNameRegistrationForm` already handles the normal ENS flow:

- commit transaction
- wait period
- register transaction
- success screen
- duration picker — years `+/−` by default, toggleable to a calendar date picker; minimum 28 days (contract-enforced)

### 4. Add Extras Only When Asked

Common follow-ups:

- `referrer` if they want reward attribution
- `isTestnet={true}` for Sepolia
- custom connect flow through `onConnectWallet`
- banner copy and styling tweaks
