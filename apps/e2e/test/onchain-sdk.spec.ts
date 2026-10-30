import { test, expect, type Page } from "@playwright/test";
import {
  decodeFunctionData,
  encodeFunctionResult,
  keccak256,
  multicall3Abi,
  parseAbi,
  toBytes,
  zeroAddress,
  type Hex,
} from "viem";

const registry = "0x3333333333333333333333333333333333333333";
const owner = "0x2222222222222222222222222222222222222222";
const resolver = "0x1Ad304327d1477114Abe88820Fa7ddDC9A72f612";
const reservation = "0x7f13C79FB772BA42177f4be6Dc9e692C1f3acD11";
const id = keccak256(toBytes("activation"));
const abi = parseAbi([
  "function activationIdOf(bytes32 parent) view returns (bytes32)",
  "function activations(bytes32 id) view returns (bool,uint64,uint8,uint8,address,bytes32,address,bytes,address)",
  "function featuresOf(bytes32 id) view returns (address[])",
  "function getSubnameResolver(bytes32 id,address requested) view returns (address)",
  "function getSubregistry(string label) view returns (address)",
  "function getExpiry(uint256 id) view returns (uint64)",
  "function getOwner(uint256 id) view returns (address)",
  "function getStatus(uint256 id) view returns (uint8)",
  "function hasRootRoles(uint256 roles,address account) view returns (bool)",
  "function hasRoles(uint256 id,uint256 roles,address account) view returns (bool)",
  "function supportsInterface(bytes4 id) view returns (bool)",
  "function roots(bytes32 id) view returns (bytes32)",
  "struct MintQuote { bool canMint; uint256 price; uint8 denied; uint8 expiration; bytes32 activationId; address subregistry; }",
  "function quoteMint(string parent,string label,address minter,uint64 duration,bytes claims) view returns (MintQuote)",
  "struct RenewalQuote { bool canRenew; uint256 price; uint8 denied; bytes32 activationId; address subregistry; }",
  "function quoteRenewal(string parent,string label,address renewer,uint64 duration,bytes claims) view returns (RenewalQuote)",
  "function quotePayment(uint256 usd,address token) view returns (uint256)",
]);

async function mockChain(
  page: Page,
  state: {
    active?: boolean;
    status?: number;
    reservation?: boolean;
    permanent?: boolean;
    paymentError?: boolean;
  } = {}
) {
  const calls: string[] = [];
  const call = (data: Hex): Hex => {
    if (data.startsWith("0x82ad56cb")) {
      const decoded = decodeFunctionData({ abi: multicall3Abi, data });
      if (decoded.functionName !== "aggregate3")
        throw new Error("Unexpected multicall");
      return encodeFunctionResult({
        abi: multicall3Abi,
        functionName: "aggregate3",
        result: decoded.args[0].map(entry => {
          try {
            return { success: true, returnData: call(entry.callData) };
          } catch {
            return { success: false, returnData: "0x" as const };
          }
        }),
      });
    }
    const { functionName } = decodeFunctionData({ abi, data });
    calls.push(functionName);
    let result: unknown;
    switch (functionName) {
      case "activationIdOf":
        result = id;
        break;
      case "activations":
        result = [
          state.active ?? true,
          0n,
          0,
          0,
          zeroAddress,
          keccak256(toBytes("arthy0")),
          zeroAddress,
          "0x",
          registry,
        ];
        break;
      case "featuresOf":
        result = state.reservation ? [reservation] : [];
        break;
      case "getSubnameResolver":
        result = resolver;
        break;
      case "getSubregistry":
        result = registry;
        break;
      case "getExpiry":
        result = state.permanent ? (1n << 64n) - 1n : 2_100_000_000n;
        break;
      case "getOwner":
        result = owner;
        break;
      case "getStatus":
        result = state.status ?? 0;
        break;
      case "hasRootRoles":
      case "hasRoles":
      case "supportsInterface":
        result = true;
        break;
      case "roots":
        result = keccak256(toBytes("reservation"));
        break;
      case "quoteMint":
        result = {
          canMint: true,
          price: 1_000_000_000_000n,
          denied: 0,
          expiration: 0,
          activationId: id,
          subregistry: registry,
        };
        break;
      case "quoteRenewal":
        result = {
          canRenew: true,
          price: 1_000_000_000_000n,
          denied: 0,
          activationId: id,
          subregistry: registry,
        };
        break;
      case "quotePayment":
        if (state.paymentError) throw new Error("Payment RPC unavailable");
        result = 1_000_000n;
        break;
      default:
        throw new Error(`Unexpected contract call ${functionName}`);
    }
    return encodeFunctionResult({ abi, functionName, result: result as never });
  };
  await page.route("**/*", async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === "127.0.0.1" || url.hostname === "localhost")
      return route.continue();
    if (url.hostname.includes("manager.namespace.ninja")) {
      if (url.pathname.includes("/proof"))
        return route.fulfill({
          status: 503,
          headers: { "access-control-allow-origin": "*" },
          contentType: "application/json",
          body: JSON.stringify({ message: "Unavailable" }),
        });
      return route.fulfill({ contentType: "application/json", body: "[]" });
    }
    if (request.method() === "POST") {
      const body = request.postDataJSON();
      const answer = (rpc: {
        id: number;
        method: string;
        params?: unknown[];
      }) => {
        let result: unknown;
        try {
          if (rpc.method === "eth_chainId") result = "0x1";
          else if (rpc.method === "eth_blockNumber") result = "0x123";
          else if (rpc.method === "eth_getCode") result = "0x6000";
          else if (rpc.method === "eth_call")
            result = call((rpc.params?.[0] as { data: Hex }).data);
          else
            return {
              jsonrpc: "2.0",
              id: rpc.id,
              error: { code: -32601, message: "Mock method not supported" },
            };
          return { jsonrpc: "2.0", id: rpc.id, result };
        } catch {
          return {
            jsonrpc: "2.0",
            id: rpc.id,
            error: { code: -32000, message: "Mock contract read failed" },
          };
        }
      };
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify(
          Array.isArray(body) ? body.map(answer) : answer(body)
        ),
      });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "{}",
    });
  });
  return calls;
}

test("the mint form gets availability and prices through the SDK", async ({
  page,
}) => {
  const calls = await mockChain(page);
  await page.goto("/");
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await expect(form.locator(".ns-name-status")).toContainText(
    "alice.arthy0.eth is available"
  );
  await expect(form.getByTestId("pricing-primary-fee")).not.toHaveText(
    /^(N\/A)?$/
  );
  expect(calls).toContain("featuresOf");
  expect(calls).toContain("quoteMint");
  expect(calls).toContain("quotePayment");
});

test("a proof outage is shown as a service error, with retry", async ({
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
  await expect(form.locator(".ns-name-status")).toContainText("is available");
  await expect(form.getByTestId("form-error")).toHaveCount(0);
});

test("the mint form shows a paused activation reason", async ({ page }) => {
  await mockChain(page, { active: false });
  await page.goto("/");
  const form = page.locator("#subname-mint");
  await form.getByTestId("subname-input").fill("alice");
  await expect(form).toContainText(
    "Subname issuance and renewal are paused for this parent."
  );
});

test("the renewal form rejects permanent names through the SDK", async ({
  page,
}) => {
  await mockChain(page, { permanent: true });
  await page.goto("/");
  const form = page.locator("#subname-renewal");
  await form.getByTestId("renew-name-input").fill("alice");
  await expect(form).toContainText("permanent");
});

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
