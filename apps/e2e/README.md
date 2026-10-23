# e2e

Playwright tests that drive the landing page against Sepolia with a real, funded test wallet.

## How it works

- **Wallet**: `test/wallet/TestWallet.ts` is an EIP-1193 wallet backed by a private key. It is
  injected into the page and announced over EIP-6963, so RainbowKit lists it as "E2E Wallet".
  Every prompt is approved automatically; `wallet.rejectNext()` rejects the next one.
- **Batching**: `test.use({ batchMode: "atomic" })` makes the wallet support EIP-5792
  `wallet_sendCalls`, executed as one EIP-7702 transaction through Simple7702Account.
  The default, `"sequential"`, reports no batching, so the components send one transaction per call.
- **Verification**: `test/support/chain.ts` reads prices, owners, expiries and records straight
  from Sepolia contracts, independently of the component library.

## Running

```sh
cp .env.example .env   # set E2E_PRIVATE_KEY (and optionally E2E_MINT_PARENTS)
pnpm e2e               # from the repo root; starts the landing page itself
```

The wallet needs Sepolia ETH and Sepolia USDC. A run registers 3 names (1 ENSv1, 2 ENSv2)
and mints 2 subnames per parent in `E2E_MINT_PARENTS`. On failure, each test's folder in
`test-results/` holds a trace, a video and `wallet-requests.json`: every request the app
made to the wallet and what it got back.
