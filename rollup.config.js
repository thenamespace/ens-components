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
  {
    find: "@/components",
    replacement: path.resolve(__dirname, "src/components/index"),
  },
  {
    find: "@/atoms",
    replacement: path.resolve(__dirname, "src/components/atoms/index"),
  },
  {
    find: "@/molecules",
    replacement: path.resolve(__dirname, "src/components/molecules/index"),
  },
  {
    find: "@/constants",
    replacement: path.resolve(__dirname, "src/constants/index"),
  },
  { find: "@/utils", replacement: path.resolve(__dirname, "src/utils/index") },
  { find: "@/types", replacement: path.resolve(__dirname, "src/types/index") },
  { find: "@/web3", replacement: path.resolve(__dirname, "src/web3/index") },
];

const nodeResolveOpts = {
  browser: true,
  mainFields: ["module", "browser", "main"],
  exportConditions: ["browser", "module", "default"],
  extensions: [".mjs", ".js", ".ts", ".tsx", ".json", ".css"],
  preferBuiltins: false,
  preserveSymlinks: false,
};

const cssPlugins = [
  postcssImport(),
  autoprefixer(),
  cssnano({
    preset: [
      "default",
      { normalizeWhitespace: false, discardComments: { removeAll: false } },
    ],
  }),
];

export default [
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
        inject: false, // <-- do NOT inject here (we have a separate injected build)
        minimize: false,
        sourceMap: true,
        plugins: cssPlugins,
      }),
    ],
    treeshake: true,
  },

  {
    input: "src/styles.ts",
    output: {
      file: "dist/styles.js",
      format: "es",
      sourcemap: true,
    },
    plugins: [
      alias({ entries: aliasEntries }),
      nodeResolve(nodeResolveOpts),
      commonjs(),
      json(),
      postcss({
        extract: false,
        inject: true,
        minimize: false,
        sourceMap: true,
        plugins: cssPlugins,
      }),
    ],
  },

  // 3) DTS bundling
  {
    input: "dist/types/index.d.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["src/*"],
            "@/components": ["src/components/index"],
            "@/atoms": ["src/components/atoms/index"],
            "@/molecules": ["src/components/molecules/index"],
            "@/constants": ["src/constants/index"],
            "@/utils": ["src/utils/index"],
            "@/types": ["src/types/index"],
            "@/web3": ["src/web3/index"],
          },
        },
      }),
    ],
    external: [
      /\.css$/,
      /^@\//, // Treat all @/ aliases as external
      ...externals,
    ],
  },
];
