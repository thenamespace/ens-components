// rollup.config.js (ESM)
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import postcssImport from "postcss-import";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const externals = [
  /^react($|\/)/,
  /^react-dom($|\/)/,
  /^@tanstack\/react-query($|\/)/,
  /^wagmi($|\/)/,
  /^viem($|\/)/,
];

const aliasEntries = [
  { find: "@", replacement: path.resolve(__dirname, "src") },
  { find: "@/components", replacement: path.resolve(__dirname, "src/components/index") },
  { find: "@/atoms", replacement: path.resolve(__dirname, "src/components/atoms/index") },
  { find: "@/molecules", replacement: path.resolve(__dirname, "src/components/molecules/index") },
  { find: "@/constants", replacement: path.resolve(__dirname, "src/constants/index") },
  { find: "@/utils", replacement: path.resolve(__dirname, "src/utils/index") },
  { find: "@/types", replacement: path.resolve(__dirname, "src/types/index") },
  { find: "@/web3", replacement: path.resolve(__dirname, "src/web3/index") },
];

const nodeResolveOpts = {
  browser: true,
  mainFields: ["module", "browser", "main"],
  exportConditions: ["browser", "module", "default"],
  // include .css so `bootstrap/dist/css/...` resolves:
  extensions: [".mjs", ".js", ".ts", ".tsx", ".json", ".css"],
  preferBuiltins: false,
  // helps pnpm workspaces:
  preserveSymlinks: false,
};

const cssPlugins = [
  postcssImport(), // MUST be first for @import to inline (including from node_modules)
  autoprefixer(),
  cssnano({
    preset: [
      "default",
      { normalizeWhitespace: false, discardComments: { removeAll: false } },
    ],
  }),
];

export default [
  // 1) Main JS bundle + EXTRACTED CSS file
  {
    input: "src/index.tsx",
    external: externals,
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      alias({ entries: aliasEntries }),
      nodeResolve(nodeResolveOpts),
      commonjs(),
      json(),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2020",
        tsconfig: "tsconfig.json",
        jsx: "automatic",
      }),
      postcss({
        // Extract to a physical CSS file used by consumers:
        extract: "index.css",
        inject: false,         // <-- do NOT inject here (we have a separate injected build)
        minimize: false,
        sourceMap: true,
        plugins: cssPlugins,
      }),
    ],
    treeshake: true,
  },

  // 2) styles.ts entry that INJECTS styles at runtime (JS import path)
  {
    input: "src/styles.ts",   // should import index.css (and optionally bootstrap in TS)
    output: {
      file: "dist/styles.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      alias({ entries: aliasEntries }),
      // IMPORTANT: include resolver stack so `bootstrap/...` is found:
      nodeResolve(nodeResolveOpts),
      commonjs(),
      json(),
      postcss({
        extract: false,        // runtime injection
        inject: true,
        minimize: false,
        sourceMap: true,
        plugins: cssPlugins,   // postcss-import first
      }),
    ],
  },

  // 3) DTS bundling
  {
    input: "dist/types/index.d.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [dts({ respectExternal: true })],
    external: [
      /\.css$/,
      ...externals,
    ],
  },
];
