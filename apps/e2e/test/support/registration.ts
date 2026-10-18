import type { Locator, Page } from "@playwright/test";
import { clickWhenEnabled, expect, expectOutcome, useEnsVersion } from "./fixtures";
import { formatAmount, formatEth4, getV1RentPrice, getV2RegisterPrice, secondsFromYears, USDC_DECIMALS } from "./chain";
import { fillRecords, type RecordsInput } from "./records";

/** Waits until a registration step is current, failing early with the form's error if a transaction fails. */
const waitForStep = async (section: Locator, step: "commit" | "timer" | "register", timeout: number) => {
  const current = section.locator(`[data-testid="registration-step-${step}"][data-status="current"]`);
  const error = section.getByTestId("contract-error");
  await expect(current.or(error).first()).toBeVisible({ timeout });
  if (await error.isVisible()) throw new Error(`Registration failed: ${await error.innerText()}`);
};

/**
 * Registers `<label>.eth` through the landing page's registration form and waits
 * for the success screen. Asserts the quoted price against the controller first
 * and returns it (wei for ENSv1, USDC units for ENSv2).
 */
export const registerName = async (
  page: Page,
  { version, label, records }: { version: 1 | 2; label: string; records?: RecordsInput },
): Promise<bigint> => {
  await useEnsVersion(page, version);
  const section = page.locator("#ens-registration");
  await section.scrollIntoViewIfNeeded();
  await section.getByTestId("ens-name-input").fill(label);

  const duration = secondsFromYears(new Date(), 1);
  const price = version === 1 ? await getV1RentPrice(label, duration) : await getV2RegisterPrice(label, duration);
  const quoted = version === 1 ? `${formatEth4(price)} ETH` : `${formatAmount(price, USDC_DECIMALS, "USDC")} USDC`;
  await expect(section.getByTestId("pricing-primary-fee")).toHaveText(quoted);

  if (records) {
    await section.getByTestId("registration-set-profile").click();
    await fillRecords(section, records);
    await section.getByTestId("records-save").click();
  }

  await clickWhenEnabled(section, "registration-next");

  // ENSv2 without batching first asks for whatever the wallet still lacks (its
  // resolver, the USDC allowance), one screen each; the wallet approves each prompt.
  const prerequisite = section.locator('[data-testid="prerequisite-send"]:enabled');
  const commit = section.locator('[data-testid="commit-button"]:enabled');
  const error = section.getByTestId("contract-error");
  for (;;) {
    await expect(prerequisite.or(commit)).toBeVisible({ timeout: 3 * 60_000 });
    if (await error.isVisible()) throw new Error(`Registration failed: ${await error.innerText()}`);
    if (await commit.isVisible()) break;
    await prerequisite.click();
  }
  await commit.click();

  // The register step opens once the commitment is mined and has aged past the
  // controller's minimum (60s on Sepolia).
  await waitForStep(section, "register", 4 * 60_000);
  await section.getByTestId("register-button").click();

  await expectOutcome(section, "registration-success-name", `${label}.eth`);
  return price;
};
