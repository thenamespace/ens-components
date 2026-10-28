import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";

const BASE_URL = "http://localhost:4000";

export default defineConfig({
  testDir: "./test",
  // Every test sends real Sepolia transactions from one wallet, so they must not
  // race each other for nonces or token allowances.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  // Registration waits out the 60s commitment age plus several block confirmations.
  timeout: 10 * 60_000,
  expect: { timeout: 30_000 },
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: BASE_URL,
    // MetaMask popups can take a while to appear while the previous tx is mining.
    actionTimeout: 60_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // The root `landing` script runs through turbo, which builds the component library first.
    command: "pnpm landing",
    cwd: "../..",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
