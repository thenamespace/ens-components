import type { Locator, Page } from "@playwright/test";
import { expect } from "./fixtures";
import { encodeIpfsContenthash, getAddr, getContenthash, getText } from "./chain";

export interface RecordsInput {
  texts?: Record<string, string>;
  /** EVM addresses keyed by coin type (60 = ETH, 2147492101 = Base, …). */
  addresses?: Record<number, string>;
  /** IPFS CID, written as `ipfs://<cid>`. */
  ipfs?: string;
}

/** A CID that is valid for the contenthash encoder; tests vary records around it. */
export const SAMPLE_IPFS_CID = "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi";
export const BASE_COIN_TYPE = 2147492101;

/** Fills a SelectRecordsForm (registration profile, mint profile or the records editor). */
export const fillRecords = async (scope: Locator, records: RecordsInput) => {
  for (const [key, value] of Object.entries(records.texts ?? {})) {
    const input = scope.getByTestId(`text-record-input-${key}`);
    if (!(await input.isVisible())) await scope.getByTestId(`text-record-add-${key}`).click();
    await input.fill(value);
  }
  for (const [coinType, value] of Object.entries(records.addresses ?? {})) {
    const input = scope.getByTestId(`address-record-input-${coinType}`);
    if (!(await input.isVisible())) await scope.getByTestId(`address-record-add-${coinType}`).click();
    await input.fill(value);
  }
  if (records.ipfs) {
    const input = scope.getByTestId("contenthash-input");
    if (!(await input.isVisible())) await scope.getByTestId("contenthash-add-ipfs").click();
    await input.fill(`ipfs://${records.ipfs}`);
  }
};

/** Polls the universal resolver until every record in `records` resolves to the expected value. */
export const expectRecordsOnChain = async (name: string, records: RecordsInput) => {
  const poll = { timeout: 90_000, intervals: [2_000, 5_000] };
  for (const [key, value] of Object.entries(records.texts ?? {})) {
    await expect.poll(() => getText(name, key), poll).toBe(value);
  }
  for (const [coinType, value] of Object.entries(records.addresses ?? {})) {
    await expect.poll(() => getAddr(name, Number(coinType)), poll).toBe(value);
  }
  if (records.ipfs) {
    await expect.poll(() => getContenthash(name), poll).toBe(encodeIpfsContenthash(records.ipfs));
  }
};

/**
 * Loads `name` in the landing page's records editor, applies `records` through the
 * UI, sends the update and waits for the success screen. `existingTexts` are text
 * records the editor must pre-fill from chain before anything is changed.
 */
export const updateRecordsInEditor = async (
  page: Page,
  name: string,
  records: RecordsInput,
  existingTexts: Record<string, string> = {},
) => {
  const section = page.locator("#ens-records");
  await section.scrollIntoViewIfNeeded();
  await section.getByTestId("records-lookup-input").fill(name);
  await section.getByTestId("records-lookup-button").click();

  for (const [key, value] of Object.entries(existingTexts)) {
    await expect(section.getByTestId(`text-record-input-${key}`)).toHaveValue(value);
  }

  await fillRecords(section, records);
  await section.getByTestId("records-next").click();
  await section.getByTestId("records-confirm").click();
  await expect(section.getByTestId("records-update-success")).toBeVisible({ timeout: 3 * 60_000 });
};
