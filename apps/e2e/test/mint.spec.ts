import { expect, test } from "./support/fixtures";
import { getOwner, uniqueLabel } from "./support/chain";

const parentName = process.env.E2E_MINT_PARENT || "arti.eth";

test("mints a subname under the landing page's activation", async ({ page, wallet, connect }) => {
  const owner = await connect();
  const label = uniqueLabel("e2e");
  const section = page.locator("#subname-mint");
  await section.scrollIntoViewIfNeeded();

  await section.getByTestId("subname-input").fill(label);
  // Enabled once the quote, proofs and fee estimate are in.
  const mint = section.locator('[data-testid="mint-button"]:enabled');
  await expect(mint).toBeVisible({ timeout: 60_000 });
  await expect(section.getByTestId("pricing-primary-fee")).not.toHaveText("N/A");

  // Pays in ETH, the form's default token, so there is no approval prompt.
  await mint.click();
  await wallet.confirmTransaction();

  const fullName = `${label}.${parentName}`;
  await expect(section.getByTestId("mint-success-name")).toHaveText(fullName, {
    timeout: 3 * 60_000,
  });
  await expect.poll(() => getOwner(fullName), { timeout: 60_000 }).toBe(owner);
});
