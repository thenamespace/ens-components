import { expect, test, useEnsVersion } from "./support/fixtures";

// The edit flows live in registration.spec.ts, on the names registered there.

for (const version of [1, 2] as const) {
  test(`ENSv${version} records editor refuses a name the wallet does not own`, async ({ page, connect }) => {
    await connect();
    await useEnsVersion(page, version);
    const section = page.locator("#ens-records");
    await section.getByTestId("records-lookup-input").fill(version === 2 ? "arti.eth" : "nick.eth");
    await section.getByTestId("records-lookup-button").click();
    await expect(section.getByTestId("records-lookup-error")).toHaveText(
      "You are not permitted to edit records, try adding a name you own",
    );
  });
}
