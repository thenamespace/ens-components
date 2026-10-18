import { type Address, zeroAddress } from "viem";
import { clickWhenEnabled, expect, expectOutcome, test } from "./support/fixtures";
import { env } from "./support/env";
import {
  activationNeedsProofs,
  formatAmount,
  getUsdcBalance,
  getV2Expiry,
  getV2Owner,
  quoteMint,
  quotePayment,
  quoteRenewal,
  secondsFromYears,
  uniqueLabel,
  USDC,
  USDC_DECIMALS,
} from "./support/chain";
import { BASE_COIN_TYPE, expectRecordsOnChain, fillRecords, type RecordsInput, SAMPLE_IPFS_CID } from "./support/records";

const TOKENS = {
  ETH: { address: zeroAddress as Address, decimals: 18 },
  USDC: { address: USDC, decimals: USDC_DECIMALS },
} as const;
type Token = keyof typeof TOKENS;

/** The forms' price cell for a USD price paid in `token`: "Free", or the amount and symbol. */
const priceText = async (priceUsdRaw: bigint, token: Token) => {
  if (priceUsdRaw === 0n) return { amount: 0n, text: "Free" };
  const amount = await quotePayment(priceUsdRaw, TOKENS[token].address);
  return { amount, text: `${formatAmount(amount, TOKENS[token].decimals, token)} ${token}` };
};

// Per activation: mint with each payment token, sent one prompt per transaction and
// as one batch. The first combination then renews its subname if the activation
// issues expiring subnames.
for (const parent of env.mintParents) {
  for (const token of ["ETH", "USDC"] as const) {
    for (const batchMode of ["sequential", "atomic"] as const) {
      test.describe.serial(`${parent} subnames, ${token}, ${batchMode}`, () => {
        test.use({ batchMode });
        const label = uniqueLabel(`e2e${token === "ETH" ? "e" : "u"}${batchMode === "atomic" ? "b" : "s"}`);
        const fullName = `${label}.${parent}`;
        let expirable = false;

        test("mints a subname with records at the activation's price", async ({ page, wallet, connect }) => {
          const owner = await connect(`/?parent=${parent}`);
          const section = page.locator("#subname-mint");
          await section.scrollIntoViewIfNeeded();
          await section.getByTestId("subname-input").fill(label);

          const fee = section.getByTestId("pricing-primary-fee");
          await expect(fee).not.toHaveText(/^(N\/A)?$/, { timeout: 90_000 });
          if (token !== "ETH") {
            await section.getByTestId("token-select").click();
            await section.getByTestId(`token-option-${token}`).click();
            await expect(section.getByTestId("token-select")).toHaveAttribute("data-value", token);
          }

          const quote = await quoteMint(parent, label, owner, secondsFromYears(new Date(), 1));
          expirable = quote.expiration === 0;
          // Whitelist and reservation pricing depend on proofs from the manager API.
          const exactPrice = !(await activationNeedsProofs(parent));
          const expected = await priceText(quote.price, token);
          if (exactPrice) await expect(fee).toHaveText(expected.text);

          const records: RecordsInput = {
            texts: { description: `Minted by e2e run ${label}` },
            addresses: { 60: owner, [BASE_COIN_TYPE]: owner },
            ipfs: SAMPLE_IPFS_CID,
          };
          // Shown once the form has confirmed the activation's resolver accepts records at mint.
          const profile = section.getByTestId("mint-set-profile");
          const canSetRecords = await profile.waitFor({ timeout: 20_000 }).then(() => true, () => false);
          if (!canSetRecords)
            test.info().annotations.push({ type: "no-records", description: `${parent}'s resolver doesn't accept records at mint` });
          if (canSetRecords) {
            await profile.click();
            await fillRecords(section, records);
            await section.getByTestId("records-save").click();
          }

          const usdcBefore = await getUsdcBalance(owner);
          await clickWhenEnabled(section, "mint-button");
          await expectOutcome(section, "mint-success-name", fullName);

          await expect.poll(() => getV2Owner(fullName), { timeout: 90_000 }).toBe(owner);
          if (canSetRecords) await expectRecordsOnChain(fullName, records);
          // The approval carries a buffer for price moves, but the issuer pulls only the price.
          if (token === "USDC" && exactPrice) expect(usdcBefore - (await getUsdcBalance(owner))).toBe(expected.amount);
          if (batchMode === "atomic" && canSetRecords)
            expect(wallet.sentTransactions().map((r) => r.method)).toEqual(["wallet_sendCalls"]);
        });

        test("renews the minted subname by a year", async ({ page, connect }) => {
          test.skip(token !== "ETH" || batchMode !== "sequential", "Renewal runs once per activation");
          test.skip(!expirable, `${parent} issues permanent subnames`);
          const owner = await connect(`/?parent=${parent}`);
          const section = page.locator("#subname-renewal");
          await section.scrollIntoViewIfNeeded();
          await section.getByTestId("renew-name-input").fill(label);

          const expiry = await getV2Expiry(fullName);
          const duration = secondsFromYears(new Date(Number(expiry) * 1000), 1);
          if (!(await activationNeedsProofs(parent))) {
            const quote = await quoteRenewal(parent, label, owner, duration);
            await expect(section.getByTestId("pricing-primary-fee")).toHaveText((await priceText(quote.price, "ETH")).text, {
              timeout: 90_000,
            });
          }

          await clickWhenEnabled(section, "mint-button");
          await expectOutcome(section, "renew-success-name", fullName);
          await expect.poll(() => getV2Expiry(fullName), { timeout: 90_000 }).toBe(expiry + BigInt(duration));
        });
      });
    }
  }
}
