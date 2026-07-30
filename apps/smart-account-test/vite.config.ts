import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "wagmi", "viem", "@tanstack/react-query"],
  },
  optimizeDeps: {
    exclude: ["@thenamespace/ens-components"],
    include: ["@thenamespace/offchain-manager", "viem/ens"],
  },
});
