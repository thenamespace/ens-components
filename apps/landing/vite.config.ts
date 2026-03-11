import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// To enable pre-rendering (so bots that don't run JS can read page content),
// install vite-plugin-prerender and uncomment the block below:
//
//   pnpm --filter landing add -D vite-plugin-prerender
//
// import prerender from "vite-plugin-prerender";
//
// Then add to plugins:
//   prerender({ staticDir: path.join(__dirname, "dist"), routes: ["/"] })

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom", "wagmi", "viem", "@tanstack/react-query"],
  },
  optimizeDeps: {
    exclude: ["@thenamespace/ens-components"],
  },
});
