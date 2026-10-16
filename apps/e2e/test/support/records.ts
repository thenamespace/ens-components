import type { Page } from "@playwright/test";
import type { MetaMask } from "@synthetixio/synpress/playwright";
import { expect } from "./fixtures";
import { getText } from "./chain";

/**
 * Loads `name` in the landing page's records editor, sets the given text records
 * through the UI, sends the update and waits until the new values resolve on-chain.
 * `existing` are text records the editor is expected to pre-fill from chain.
 */
export const updateTextRecords = async (
  page: Page,
  wallet: MetaMask,
  name: string,
  records: Record<string, string>,
  existing: Record<string, string> = {},
) => {
  const section = page.locator("#ens-records");
  await section.scrollIntoViewIfNeeded();
  await section.getByTestId("records-lookup-input").fill(name);
  await section.getByTestId("records-lookup-button").click();

  for (const [key, value] of Object.entries(existing)) {
    await expect(section.getByTestId(`text-record-input-${key}`)).toHaveValue(value);
  }

  for (const [key, value] of Object.entries(records)) {
    const input = section.getByTestId(`text-record-input-${key}`);
    if (!(await input.isVisible())) await section.getByTestId(`text-record-add-${key}`).click();
    await input.fill(value);
  }

  await section.getByTestId("records-next").click();
  await section.getByTestId("records-confirm").click();
  await wallet.confirmTransaction();
  await expect(section.getByTestId("records-update-success")).toBeVisible({ timeout: 3 * 60_000 });

  for (const [key, value] of Object.entries(records)) {
    await expect.poll(() => getText(name, key), { timeout: 60_000 }).toBe(value);
  }
};
