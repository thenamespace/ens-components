import { writeFileSync } from "node:fs";
import { test as base, expect, type Locator } from "@playwright/test";
import type { Address } from "viem";
import { type BatchMode, TestWallet } from "../wallet/TestWallet";
import { env } from "./env";

export const test = base.extend<{
  /** How the wallet answers EIP-5792 batching; override per describe with `test.use`. */
  batchMode: BatchMode;
  wallet: TestWallet;
  /** Opens the landing page (optionally with a query string) and connects the test wallet. */
  connect: (path?: string) => Promise<Address>;
}>({
  batchMode: ["sequential", { option: true }],
  wallet: async ({ page, batchMode }, use, testInfo) => {
    test.skip(!env.privateKey, "Set E2E_PRIVATE_KEY, see apps/e2e/.env.example");
    const wallet = new TestWallet(env.privateKey!, env.rpcUrl, batchMode);
    await wallet.install(page);
    await use(wallet);
    // What the app asked the wallet for, and what it got back, is the first thing to check on failure.
    if (testInfo.status !== testInfo.expectedStatus) {
      const path = testInfo.outputPath("wallet-requests.json");
      writeFileSync(path, JSON.stringify(wallet.requests, (_, v) => (typeof v === "bigint" ? v.toString() : v), 2));
      await testInfo.attach("wallet-requests", { path, contentType: "application/json" });
    }
  },
  connect: async ({ page, wallet }, use) => {
    await use(async (path = "/") => {
      await page.goto(path);
      // The sticky nav sits over buttons Playwright scrolls to the top edge and swallows their clicks.
      await page.addStyleTag({ content: "nav.nav { position: static !important; }" });
      // The playground opens on mainnet; switch to Sepolia before connecting so the
      // wrong-network prompt never shows.
      const network = page.getByTestId("network-switch");
      if ((await network.getAttribute("aria-checked")) === "true") await network.click();
      await expect(network).toHaveAttribute("aria-checked", "false");
      await page.getByTestId("nav-connect-wallet").click();
      await page.getByRole("dialog").getByRole("button", { name: /E2E Wallet/ }).click();
      await expect(page.getByTestId("nav-wallet-address")).toBeVisible();
      return wallet.address;
    });
  },
});

/**
 * Clicks the button `testId` once it enables. Fails right away, instead of timing
 * out, when the form says the wallet is short of funds or shows an error.
 */
export const clickWhenEnabled = async (scope: Locator, testId: string, timeout = 90_000) => {
  const button = scope.locator(`[data-testid="${testId}"]:enabled`);
  const insufficient = scope.getByTestId("insufficient-funds");
  const error = scope.getByTestId("form-error");
  await expect(button.or(insufficient).or(error).first()).toBeVisible({ timeout });
  if (await insufficient.isVisible()) throw new Error("The test wallet has insufficient funds for this flow.");
  if (await error.isVisible()) throw new Error(`Form error: ${await error.innerText()}`);
  await button.click();
};

/**
 * Waits for a flow to finish: the success element `successTestId` showing `text`, or
 * fails early with the message of the form error that appeared instead.
 */
export const expectOutcome = async (scope: Locator, successTestId: string, text: string, timeout = 4 * 60_000) => {
  const success = scope.getByTestId(successTestId);
  const error = scope.getByTestId("form-error").or(scope.getByTestId("contract-error")).first();
  await expect(success.or(error).first()).toBeVisible({ timeout });
  if (await error.isVisible()) throw new Error(`Form error: ${await error.innerText()}`);
  await expect(success).toHaveText(text);
};

export { expect };
