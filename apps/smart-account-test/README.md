# Smart Account Compatibility Lab

A private, mainnet-only browser lab for testing Namespace avatar/header
authentication with:

- [Safe](https://docs.safe.global/sdk/protocol-kit/guides/signatures/messages)
  as a deployed EIP-1271 account
- [Base Account](https://docs.base.org/base-account/guides/authenticate-users)
  as a counterfactual EIP-6492 account
- an injected EOA as the control

The app has three paths:

1. **Diagnostic SDK** — request the real Metadata Service nonce, sign the exact
   SIWE message, classify the signature/account, verify it through Viem, then
   optionally upload with the same signed payload.
2. **Production component** — mount the workspace `SelectRecordsForm`, perform
   its normal sign-and-upload interaction, and show the returned avatar/header
   URL in controlled local record state.
3. **Offchain subname** — log in through Privy, derive a counterfactual Kernel
   account from the embedded signer, then create or update a gasless Namespace
   subname under `pushx.eth` with that smart account as owner.

Neither path sends an ENS resolver transaction. Both upload actions write to the
Metadata Service and may replace media already hosted for the entered name.

## Configure

Copy the tracked example:

```sh
cp apps/smart-account-test/.env.example apps/smart-account-test/.env.local
```

Set:

```dotenv
VITE_MAINNET_RPC_URL=https://your-public-mainnet-rpc
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Optional; the production endpoint is the default.
# VITE_METADATA_API_URL=https://metadata.namespace.ninja

# Namespace offchain subname configuration.
VITE_OFFCHAIN_PARENT_NAME=pushx.eth
VITE_OFFCHAIN_API_KEY=your_namespace_domain_api_key

# Privy embedded signer for the pushx.eth flow.
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id
```

All `VITE_*` values ship to the browser. Do not use a secret RPC credential.
The optional Metadata API override affects the diagnostic SDK path only; the
workspace component intentionally uses the Avatar SDK's production default.
The offchain domain API key is intentionally loaded from ignored `.env.local`;
never commit the real value. Like every `VITE_*` value, it is available to the
browser at runtime.

## Offchain subname

Create a Privy application, allow `http://localhost:4001`, and enable email
and/or Google login. Add the public Privy app ID and optional client ID to
`.env.local`; never add a Privy client secret to a Vite application.

Open **Offchain subname** and log in. Privy creates an embedded Ethereum signer
in the browser, and the lab derives a Kernel v0.3.1 counterfactual account from
that signer. This does not depend on Privy's dashboard-managed smart-wallet
feature and does not deploy the Kernel.

After the Kernel owner appears, acknowledge the production write and enter only
the child label (for example, `privy-lab`, not the full name). The owner field is
prefilled with the Kernel address. Creation uses the Namespace domain API key,
not a wallet signature, and sends no wallet transaction.

To test signed profile media, create the name first, continue, and reopen the
existing label. Avatar/header upload then requests the real Namespace SIWE
message and signs it through the same Privy-controlled Kernel. While undeployed,
the account emits the ERC-6492 form needed for counterfactual verification.

## Run

From the repository root:

```sh
pnpm install
pnpm smart-accounts
```

Open [http://localhost:4001](http://localhost:4001).

## Prepare the accounts

Use disposable mainnet ENS names or subnames. The entered name must be owned by
the connected smart-account address when the upload is submitted.

### Safe / EIP-1271

- Prefer a current **1-of-1 Safe** for the first pass.
- Connect it from Safe{Wallet} through the lab's WalletConnect button, or add
  the lab URL as a Safe custom app and use the Safe iframe connector.
- The diagnostic result should report non-empty account bytecode and
  `Deployed smart account · EIP-1271`.
- Higher-threshold Safes can work, but the signed-message request must collect
  the Safe's required confirmations before it can return.

### Base Account / EIP-6492

- Use a fresh Base Account that has not been deployed on Ethereum mainnet.
- Transfer/create the disposable ENS name for the predicted Base Account
  address without first sending a transaction from that account.
- Before and after local verification, account bytecode should remain
  `not deployed`.
- The signature must report an EIP-6492 wrapper and classification
  `Counterfactual smart account · EIP-6492`.
- If account bytecode already exists, that account can test deployed
  smart-account verification but no longer proves the counterfactual case.

### EOA control

- Connect an injected wallet.
- Expect no deployed code and no EIP-6492 wrapper.
- Local verification and the explicit upload should still succeed.

## Manual acceptance matrix

| Case                    | Bytecode before | 6492 wrapper | Local result              | Mainnet upload            |
| ----------------------- | --------------- | ------------ | ------------------------- | ------------------------- |
| Safe                    | Deployed        | Usually no   | Pass via EIP-1271         | Accepted for owned name   |
| Fresh Base Account      | Not deployed    | Yes          | Pass; code remains absent | Accepted for owned name   |
| EOA                     | Not deployed    | No           | Pass via ECDSA            | Accepted for owned name   |
| Non-owner name          | Any             | Any          | Signature can pass        | Service rejects ownership |
| Rejected wallet request | Unchanged       | N/A          | No signed payload         | No upload available       |
| Expired nonce           | Unchanged       | Preserved    | Previous result shown     | Upload rejected; re-sign  |

Test both `avatar` and `header`. A successful upload returns a stable HTTPS URL.
In the production component pane, that URL appears under the matching local text
record.

## Safety and diagnostics

- Generating and verifying a signature is read-only.
- Upload is a separate action gated by a mainnet acknowledgement.
- Full SIWE messages and signatures exist only in transient memory long enough
  to submit the chosen upload. They are never rendered, logged, or persisted.
- The diagnostic error console retains sanitized Avatar SDK fields:
  `code`, `status`, `serviceCode`, and `details`.
- ERC-6492 verification uses an `eth_call`; the lab compares code before and
  after to prove simulated deployment did not persist.

The app deliberately does not include automated fixtures, a bundler, paymaster,
or vendor SDK coverage beyond Safe and Base Account.
