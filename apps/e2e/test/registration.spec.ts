import { expect, test } from "./support/fixtures";
import { getUsdcBalance, getV2Owner, uniqueLabel } from "./support/chain";
import {
  BASE_COIN_TYPE,
  expectRecordsOnChain,
  type RecordsInput,
  SAMPLE_IPFS_CID,
  updateRecordsInEditor,
} from "./support/records";
import { registerName } from "./support/registration";

// Each describe registers one fresh name, then (where noted) edits its records in
// the records editor. Tests in a describe share that name, so they run in order.

const initialRecords = (label: string, owner: string): RecordsInput => ({
  texts: { description: `Registered by e2e run ${label}`, url: `https://example.com/${label}` },
  addresses: { 60: owner, [BASE_COIN_TYPE]: owner },
  ipfs: SAMPLE_IPFS_CID,
});

const updatedRecords = (label: string, owner: string): RecordsInput => ({
  texts: { description: `Updated by e2e run ${label}`, "com.twitter": "namespace_eth" },
  addresses: { 60: owner, [BASE_COIN_TYPE]: owner },
  ipfs: "bafybeihdwdcefgh4dqkjv67uzcmw7ojee6xedzdetojuzjevtenxquvyku",
});

test.describe.serial("ENSv2 registration (USDC, one transaction per prompt)", () => {
  test.use({ batchMode: "sequential" });
  const label = uniqueLabel("e2ev2s");
  const name = `${label}.eth`;

  test("registers a name with records and charges the quoted price", async ({ page, wallet, connect }) => {
    const owner = await connect();
    const balanceBefore = await getUsdcBalance(owner);
    const price = await registerName(page, { label, records: initialRecords(label, owner) });

    await expect.poll(() => getV2Owner(name), { timeout: 90_000 }).toBe(owner);
    await expectRecordsOnChain(name, initialRecords(label, owner));
    expect(balanceBefore - (await getUsdcBalance(owner))).toBe(price);
    expect(wallet.requests.map((r) => r.method)).not.toContain("wallet_sendCalls");
  });

  test("updates texts, addresses and contenthash in the records editor", async ({ page, connect }) => {
    const owner = await connect();
    const updated = updatedRecords(label, owner);
    await updateRecordsInEditor(page, name, updated, { url: `https://example.com/${label}` });
    await expectRecordsOnChain(name, updated);
  });
});

test.describe("ENSv2 registration (USDC, batched)", () => {
  test.use({ batchMode: "atomic" });

  test("registers through one EIP-5792 batch", async ({ page, wallet, connect }) => {
    const label = uniqueLabel("e2ev2b");
    const name = `${label}.eth`;
    const owner = await connect();
    const balanceBefore = await getUsdcBalance(owner);
    const price = await registerName(page, { label, records: initialRecords(label, owner) });

    // Commit is a plain transaction; approval, resolver and registration go in one batch.
    expect(wallet.sentTransactions().map((r) => r.method)).toEqual(["eth_sendTransaction", "wallet_sendCalls"]);
    await expect.poll(() => getV2Owner(name), { timeout: 90_000 }).toBe(owner);
    await expectRecordsOnChain(name, initialRecords(label, owner));
    expect(balanceBefore - (await getUsdcBalance(owner))).toBe(price);
  });
});
