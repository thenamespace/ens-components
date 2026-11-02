import { test, expect } from "@playwright/test";
import { decodeFunctionData, zeroAddress } from "viem";
import {
  abi,
  connectMockWallet,
  mockChain,
  owner,
} from "./support/mock-onchain";

for (const operation of ["registration", "renewal"] as const) {
  const section =
    operation === "registration" ? "#subname-mint" : "#subname-renewal";
  const input =
    operation === "registration" ? "subname-input" : "renew-name-input";
  const quoteMethod =
    operation === "registration" ? "quoteMint" : "quoteRenewal";
  const contractMethod = operation === "registration" ? "register" : "renew";
  const success =
    operation === "registration" ? "mint-success-name" : "renew-success-name";

  test(`${operation} shows a known price while requiring an account`, async ({
    page,
  }) => {
    const chain = await mockChain(page);
    await page.goto("/");
    const form = page.locator(section);
    await form.getByTestId(input).fill("alice");
    await expect(form.getByTestId("pricing-primary-fee")).toBeVisible();
    await expect(form.getByTestId("pricing-primary-fee")).not.toHaveText(
      /^(N\/A|Free)?$/
    );
    await expect(form.getByTestId("mint-button")).toHaveText("Connect Wallet");
    expect(chain.calls).toContain(quoteMethod);
    expect(chain.calls).toContain("quotePayment");
    expect(chain.sent).toHaveLength(0);
  });

  test(`${operation} does not invent a price for an account-dependent policy`, async ({
    page,
  }) => {
    const chain = await mockChain(page, { accountDependent: true });
    await page.goto("/");
    const form = page.locator(section);
    await form.getByTestId(input).fill("alice");
    await expect(form).toContainText(/connect.*wallet/i);
    await expect
      .poll(() => chain.calls.filter(name => name === "featuresOf").length)
      .toBeGreaterThan(0);
    await expect(form.getByTestId("pricing-primary-fee")).toHaveText("N/A");
    await expect(form.getByTestId("mint-button")).toHaveText("Connect Wallet");
    expect(chain.calls).not.toContain(quoteMethod);
    expect(chain.calls).not.toContain("quotePayment");
    expect(chain.sent).toHaveLength(0);
  });

  test(`${operation} prepares, simulates, sends, and confirms with a mocked wallet`, async ({
    page,
  }) => {
    const chain = await mockChain(page);
    await page.goto("/");
    await connectMockWallet(page);
    const form = page.locator(section);
    await form.getByTestId(input).fill("alice");
    await expect(form.getByTestId("mint-button")).toBeEnabled({
      timeout: 20_000,
    });
    await form.getByTestId("mint-button").click();
    await expect(form.getByTestId(success)).toHaveText("alice.arthy0.eth", {
      timeout: 20_000,
    });
    expect(
      chain.rpcMethods.filter(method => method === "eth_simulateV1").length
    ).toBeGreaterThan(1);
    expect(chain.rpcMethods).toContain("eth_getTransactionReceipt");
    expect(
      chain.calls.filter(name => name === quoteMethod).length
    ).toBeGreaterThan(1);
    expect(chain.sent).toHaveLength(1);
    const transaction = decodeFunctionData({ abi, data: chain.sent[0].data });
    expect(transaction.functionName).toBe(contractMethod);
    expect(transaction.args?.[0]).toMatchObject({
      parentLabel: "arthy0",
      label: "alice",
    });
    expect(transaction.args?.[1]).toBe(zeroAddress);
    expect(BigInt(chain.sent[0].value!)).toBe(1_020_000n);
    if (transaction.functionName === "register")
      expect(transaction.args[0].owner.toLowerCase()).toBe(owner);
  });
  test(`${operation} refreshes the quote before submission and rejects a price increase`, async ({
    page,
  }) => {
    const state = { priceUsdRaw: 1_000_000_000_000n };
    const chain = await mockChain(page, state);
    await page.goto("/");
    await connectMockWallet(page);
    const form = page.locator(section);
    await form.getByTestId(input).fill("alice");
    await expect(form.getByTestId("mint-button")).toBeEnabled({
      timeout: 20_000,
    });
    state.priceUsdRaw = 2_000_000_000_000n;
    await form.getByTestId("mint-button").click();
    await expect(form.getByTestId("form-error")).toContainText(
      "The price increased."
    );
    expect(chain.sent).toHaveLength(0);
    await expect(form.getByTestId(success)).toHaveCount(0);
  });
}

test("registration approves ERC20 before sending the registration", async ({
  page,
}) => {
  const chain = await mockChain(page);
  await page.goto("/");
  await connectMockWallet(page);
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await form.getByTestId("token-select").click();
  await form.getByTestId("token-option-USDC").click();
  await expect(form.getByTestId("mint-button")).toBeEnabled({
    timeout: 20_000,
  });
  await form.getByTestId("mint-button").click();
  await expect(form.getByTestId("mint-success-name")).toHaveText(
    "alice.arthy0.eth",
    { timeout: 20_000 }
  );
  const transactions = chain.sent.map(tx =>
    decodeFunctionData({ abi, data: tx.data })
  );
  expect(transactions.map(tx => tx.functionName)).toEqual([
    "approve",
    "register",
  ]);
  expect(transactions[0].args?.[1]).toBe(1_020_000n);
  expect(chain.sent.every(tx => BigInt(tx.value ?? "0x0") === 0n)).toBe(true);
});

test("a proof outage remains a service error and can be retried", async ({
  page,
}) => {
  const state = { reservation: true };
  await mockChain(page, state);
  await page.goto("/");
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await expect(form.getByTestId("form-error")).toContainText(
    "reservation proof service returned HTTP 503"
  );
  await expect(form.locator(".ns-name-status")).toContainText(
    "Couldn't check availability"
  );
  state.reservation = false;
  await form.getByRole("button", { name: "Try again" }).click();
  await expect(form.locator(".ns-name-status")).toContainText(
    "Connect a wallet to check eligibility"
  );
  await expect(form.getByTestId("form-error")).toHaveCount(0);
});

for (const blocked of [
  {
    name: "paused parent",
    state: { active: false },
    section: "#subname-mint",
    input: "subname-input",
    message: "Subname registration and renewal are paused for this parent.",
  },
  {
    name: "taken registration",
    state: { status: 2 },
    section: "#subname-mint",
    input: "subname-input",
    message: /already registered|not available|unavailable/i,
  },
  {
    name: "issuer permission",
    state: { authorized: false },
    section: "#subname-mint",
    input: "subname-input",
    message: "grant the issuer permission",
  },
  {
    name: "permanent renewal",
    state: { permanent: true },
    section: "#subname-renewal",
    input: "renew-name-input",
    message: "permanent",
  },
  {
    name: "missing renewal",
    state: { ownerMissing: true },
    section: "#subname-renewal",
    input: "renew-name-input",
    message: "isn't registered or has expired",
  },
]) {
  test(`blocks ${blocked.name} without preparing transactions`, async ({
    page,
  }) => {
    const chain = await mockChain(page, blocked.state);
    await page.goto("/");
    await connectMockWallet(page);
    const form = page.locator(blocked.section);
    await form.getByTestId(blocked.input).fill("alice");
    await expect(form).toContainText(blocked.message);
    await expect(form.getByTestId("mint-button")).toBeDisabled();
    expect(chain.sent).toHaveLength(0);
  });
}

test("payment RPC failures remain visible instead of hiding token prices", async ({
  page,
}) => {
  await mockChain(page, { paymentError: true });
  await page.goto("/");
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await expect(form.getByTestId("form-error")).toContainText(
    "Check your RPC connection and try again",
    { timeout: 15_000 }
  );
  await expect(form.locator(".ns-name-status")).toContainText(
    "Couldn't check availability"
  );
});

test("a failed simulation disables registration before any wallet submission", async ({
  page,
}) => {
  const chain = await mockChain(page, { simulationFailed: true });
  await page.goto("/");
  await connectMockWallet(page);
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await expect(form).toContainText("A prepared transaction would fail.", {
    timeout: 20_000,
  });
  await expect(form.getByTestId("mint-button")).toBeDisabled();
  expect(chain.sent).toHaveLength(0);
});

for (const failure of ["rejectTransaction", "transactionReverted"] as const) {
  test(`${failure} does not show registration success`, async ({ page }) => {
    const chain = await mockChain(page, { [failure]: true });
    await page.goto("/");
    await connectMockWallet(page);
    const form = page.locator("#subname-mint");
    await form.getByTestId("subname-input").fill("alice");
    await expect(form.getByTestId("mint-button")).toBeEnabled({
      timeout: 20_000,
    });
    await form.getByTestId("mint-button").click();
    await expect(form.getByTestId("form-error")).toBeVisible({
      timeout: 20_000,
    });
    await expect(form.getByTestId("mint-success-name")).toHaveCount(0);
    expect(chain.sent).toHaveLength(failure === "rejectTransaction" ? 0 : 1);
  });
}

test("a token conversion increase after approval requires a refreshed quote", async ({
  page,
}) => {
  const chain = await mockChain(page, { paymentIncreaseAfterApproval: true });
  await page.goto("/");
  await connectMockWallet(page);
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await form.getByTestId("token-select").click();
  await form.getByTestId("token-option-USDC").click();
  await expect(form.getByTestId("mint-button")).toBeEnabled({
    timeout: 20_000,
  });
  await form.getByTestId("mint-button").click();
  await expect(form.getByTestId("form-error")).toContainText(
    /price|payment|refresh/i
  );
  expect(
    chain.sent.map(
      tx => decodeFunctionData({ abi, data: tx.data }).functionName
    )
  ).toEqual(["approve"]);
  await expect(form.getByTestId("mint-success-name")).toHaveCount(0);
});
