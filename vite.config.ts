import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components/index"),
      "@/atoms": path.resolve(__dirname, "./src/components/atoms/index"),
      "@/molecules": path.resolve(
        __dirname,
        "./src/components/molecules/index"
      ),
      "@/constants": path.resolve(__dirname, "./src/constants/index"),
      "@/utils": path.resolve(__dirname, "./src/utils/index"),
      "@/types": path.resolve(__dirname, "./src/types/index"),
      "@/web3": path.resolve(__dirname, "./src/web3/index"),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
