import "dotenv/config";
import { defineWalletSetup } from "@synthetixio/synpress";
import { expect } from "@playwright/test";

const PASSWORD = "E2eTestPassword123!";

// Synpress caches the browser profile keyed on this file's contents, not on env vars.
// After changing E2E_SEED_PHRASE, rebuild with `pnpm wallet:cache --force`.
//
// Onboarding is scripted here instead of `MetaMask.importWallet` because that helper
// clicks Continue before MetaMask 13.13 finishes validating the phrase.
// KNOWN ISSUE: after onboarding, MetaMask 13.13 (pinned by Synpress 4.1.2) shows
// "Background connection unresponsive", and Synpress's `switchNetwork` selectors
// no longer match its UI. The cache does not build yet.
export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const seedPhrase = process.env.E2E_SEED_PHRASE;
  if (!seedPhrase) throw new Error("E2E_SEED_PHRASE is not set, see apps/e2e/.env.example");

  await walletPage.getByTestId("onboarding-import-wallet").click();
  await walletPage.getByTestId("onboarding-import-with-srp-button").click();
  await walletPage.getByTestId("srp-input-import__srp-note").type(seedPhrase, { delay: 10 });
  await expect(walletPage.getByTestId("import-srp-confirm")).toBeEnabled({ timeout: 15_000 });
  await walletPage.getByTestId("import-srp-confirm").click();

  await walletPage.getByTestId("create-password-new-input").fill(PASSWORD);
  await walletPage.getByTestId("create-password-confirm-input").fill(PASSWORD);
  await walletPage.getByTestId("create-password-terms").click();
  await walletPage.getByTestId("create-password-submit").click();

  await walletPage.locator("#metametrics-opt-in").click();
  await walletPage.getByTestId("metametrics-i-agree").click();

  const done = walletPage.getByTestId("onboarding-complete-done");
  await expect(done).toBeEnabled({ timeout: 30_000 });
  await done.click();
});
