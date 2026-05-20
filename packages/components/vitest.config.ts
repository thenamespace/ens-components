import { defineConfig } from "vitest/config";
import path from "node:path";

// Vitest config kept deliberately minimal — pure-function unit tests only
// (no DOM, no React rendering). If we later add component tests, switch
// `environment` to "jsdom" and add @testing-library/react.
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
