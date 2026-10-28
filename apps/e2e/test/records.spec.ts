import { expect, test } from "./support/fixtures";

// The edit flows live in registration.spec.ts, on the names registered there.

test("records editor refuses a name the wallet does not own", async ({ page, connect }) => {
  await connect();
  const section = page.locator("#ens-records");
  await section.getByTestId("records-lookup-input").fill("arti.eth");
  await section.getByTestId("records-lookup-button").click();
  await expect(section.getByTestId("records-lookup-error")).toHaveText(
    "You are not permitted to edit records, try adding a name you own",
  );
});
