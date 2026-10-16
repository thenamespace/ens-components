import type { Locator } from "@playwright/test";
import type { MetaMask } from "@synthetixio/synpress/playwright";
import { expect, test } from "./support/fixtures";
import {
  formatUsdc,
  getEthAddress,
  getOwner,
  getRegisterPrice,
  getText,
  getUsdcBalance,
  secondsFromYears,
  uniqueLabel,
} from "./support/chain";
import { updateTextRecords } from "./support/records";

/**
 * Resolver deployment and USDC approval only show up when the wallet still needs
 * them, so work through whichever prerequisite screens appear until the commit step.
 */
const completePrerequisites = async (section: Locator, wallet: MetaMask) => {
  const sendPrerequisite = section.locator('[data-testid="prerequisite-send"]:enabled');
  const commit = section.locator('[data-testid="commit-button"]:enabled');
  for (;;) {
    await expect(sendPrerequisite.or(commit)).toBeVisible({ timeout: 3 * 60_000 });
    if (await commit.isVisible()) return;
    const isApproval = await section.getByText("Approve USDC", { exact: true }).isVisible();
    await sendPrerequisite.click();
    if (isApproval) await wallet.approveTokenPermission();
    else await wallet.confirmTransaction();
  }
};

test.describe.serial("ENS registration with USDC", () => {
  const label = uniqueLabel("e2e");
  const name = `${label}.eth`;
  const description = `Registered by e2e run ${label}`;

  test("registers a name and charges the quoted price", async ({ page, wallet, connect }) => {
    const owner = await connect();
    const section = page.locator("#ens-registration");

    await section.getByTestId("ens-name-input").fill(label);
    const price = await getRegisterPrice(label, secondsFromYears(new Date(), 1));
    await expect(section.getByTestId("pricing-primary-fee")).toHaveText(`${formatUsdc(price)} USDC`);

    await section.getByTestId("registration-set-profile").click();
    await section.getByTestId("text-record-add-description").click();
    await section.getByTestId("text-record-input-description").fill(description);
    await section.getByTestId("records-save").click();

    const balanceBefore = await getUsdcBalance(owner);
    await section.getByTestId("registration-next").click();
    await completePrerequisites(section, wallet);

    await section.getByTestId("commit-button").click();
    await wallet.confirmTransaction();

    // The register button unlocks after the registrar's 60s minimum commitment age.
    const register = section.locator('[data-testid="register-button"]:enabled');
    await expect(register).toBeVisible({ timeout: 3 * 60_000 });
    await register.click();
    await wallet.confirmTransaction(); // register
    await wallet.confirmTransaction(); // initial records on the owner's resolver

    await expect(section.getByTestId("registration-success-name")).toHaveText(name, {
      timeout: 3 * 60_000,
    });

    await expect.poll(() => getOwner(name), { timeout: 60_000 }).toBe(owner);
    await expect.poll(() => getEthAddress(name)).toBe(owner);
    await expect.poll(() => getText(name, "description")).toBe(description);
    expect(balanceBefore - (await getUsdcBalance(owner))).toBe(price);
  });

  test("updates the records of the registered name", async ({ page, wallet, connect }) => {
    await connect();
    await updateTextRecords(
      page,
      wallet,
      name,
      { description: `Updated by e2e run ${label}`, url: `https://example.com/${label}` },
      { description },
    );
  });
});
