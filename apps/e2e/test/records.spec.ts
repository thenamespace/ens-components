import { expect, test } from "./support/fixtures";
import { getOwner } from "./support/chain";
import { updateTextRecords } from "./support/records";

const name = process.env.E2E_RECORDS_NAME;

test.describe("ENS records form", () => {
  test.skip(!name, "Set E2E_RECORDS_NAME to an ENSv2 Sepolia name owned by the test wallet");

  test("updates text records of an existing name", async ({ page, wallet, connect }) => {
    const owner = await connect();
    expect(await getOwner(name!)).toBe(owner);

    const stamp = new Date().toISOString();
    await updateTextRecords(page, wallet, name!, {
      description: `Updated by e2e at ${stamp}`,
      url: `https://example.com/e2e?at=${encodeURIComponent(stamp)}`,
    });
  });

  test("rejects a name the wallet does not own", async ({ page, connect }) => {
    await connect();
    const section = page.locator("#ens-records");
    await section.getByTestId("records-lookup-input").fill("arti.eth");
    await section.getByTestId("records-lookup-button").click();
    await expect(section.getByTestId("records-lookup-error")).toHaveText(
      "You are not permitted to edit records, try adding a name you own",
    );
  });
});
