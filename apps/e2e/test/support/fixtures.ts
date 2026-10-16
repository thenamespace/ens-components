import { testWithSynpress } from "@synthetixio/synpress";
import { MetaMask, metaMaskFixtures } from "@synthetixio/synpress/playwright";
import { type Address, getAddress } from "viem";
import walletSetup from "../wallet-setup/basic.setup";

/**
 * MetaMask reports EIP-5792 atomic batching for EOAs and answers `wallet_sendCalls`
 * with a smart-account upgrade screen that Synpress has no helper for. Hiding the
 * capability makes the components fall back to one transaction per wallet prompt,
 * which keeps the prompt sequence deterministic. The atomic path is not covered.
 */
const disableAtomicBatching = () => {
  const patched = new WeakSet<object>();
  const patch = (provider: any) => {
    if (!provider || patched.has(provider)) return;
    patched.add(provider);
    const request = provider.request.bind(provider);
    provider.request = (args: { method: string }) =>
      args?.method === "wallet_getCapabilities"
        ? Promise.reject(Object.assign(new Error("Method not supported"), { code: 4200 }))
        : request(args);
  };
  window.addEventListener("eip6963:announceProvider", (e: any) => patch(e.detail?.provider));
  window.addEventListener("ethereum#initialized", () => patch((window as any).ethereum));
  patch((window as any).ethereum);
};

export const test = testWithSynpress(metaMaskFixtures(walletSetup)).extend<{
  wallet: MetaMask;
  /** Opens the landing page with MetaMask connected and returns the wallet address. */
  connect: () => Promise<Address>;
}>({
  wallet: async ({ context, metamaskPage, extensionId }, use) => {
    await use(new MetaMask(context, metamaskPage, walletSetup.walletPassword, extensionId));
  },
  connect: async ({ page, wallet }, use) => {
    await use(async () => {
      await page.addInitScript(disableAtomicBatching);
      await page.goto("/");
      await page.getByTestId("nav-connect-wallet").click();
      await page.getByRole("dialog").getByRole("button", { name: /metamask/i }).first().click();
      await wallet.connectToDapp();
      await page.getByTestId("nav-wallet-address").waitFor();
      return getAddress(await wallet.getAccountAddress());
    });
  },
});

export { expect } from "@playwright/test";
