import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// To enable pre-rendering (so bots that don't run JS can read page content),
// install vite-plugin-prerender and uncomment the block below:
//
//   pnpm --filter landing add -D vite-plugin-prerender
//
// import prerender from "vite-plugin-prerender";
//
// Then add to plugins:
//   prerender({ staticDir: path.join(__dirname, "dist"), routes: ["/"] })

const componentsPkg = JSON.parse(
  readFileSync(resolve(__dirname, "../../packages/components/package.json"), "utf-8")
);

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(componentsPkg.version),
  },
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "wagmi", "viem", "@tanstack/react-query"],
  },
  optimizeDeps: {
    exclude: ["@thenamespace/ens-components"],
  },
});
