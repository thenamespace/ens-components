import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  format: ["esm", "cjs"],
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"],
  treeshake: true,
  splitting: false,
  minify: false,
  target: "es2020",
  esbuildOptions(options) {
    options.alias = {
      "@": "./src",
      "@/components": "./src/components",
      "@/atoms": "./src/components/atoms",
      "@/molecules": "./src/components/molecules",
      "@/constants": "./src/constants",
      "@/utils": "./src/utils",
      "@/types": "./src/types",
      "@/web3": "./src/web3"
    };
  },
});
