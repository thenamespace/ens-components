import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./test",
  testMatch: "onchain-sdk.spec.ts",
  workers: 1,
  timeout: 45_000,
  use: { baseURL: "http://127.0.0.1:4050", headless: true },
  webServer: {
    command:
      "node ../../node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4050 --strictPort --force",
    cwd: "../landing",
    url: "http://127.0.0.1:4050",
    reuseExistingServer: false,
  },
});
