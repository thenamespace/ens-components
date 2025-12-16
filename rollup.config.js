import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import image from "@rollup/plugin-image";
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

const cssPlugins = [
  postcssImport(),
  autoprefixer(),
  cssnano({ preset: ["default", { discardComments: { removeAll: true } }] }),
];

export default [
  // Main bundle
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
      nodeResolve({
        browser: true,
        extensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
        preferBuiltins: false,
      }),
      commonjs(),
      json(),
      image(),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2020",
        tsconfig: "tsconfig.json",
        jsx: "automatic",
      }),
      postcss({
        extract: "index.css",
        minimize: true,
        sourceMap: true,
        plugins: cssPlugins,
      }),
    ],
  },

  // Styles bundle
  {
    input: "src/styles.ts",
    external: externals,
    output: {
      file: "dist/styles.js",
      format: "es",
      sourcemap: true,
      inlineDynamicImports: true,
    },
    plugins: [
      alias({ entries: aliasEntries }),
      nodeResolve({
        browser: true,
        extensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
        preferBuiltins: false,
      }),
      commonjs(),
      json(),
      image(),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2020",
        tsconfig: "tsconfig.json",
      }),
      postcss({
        inject: true,
        minimize: true,
        sourceMap: true,
        plugins: cssPlugins,
      }),
    ],
  },

  // Type declarations
  {
    input: "dist/types/index.d.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    external: [/\.css$/, ...externals],
    plugins: [
      dts({
        respectExternal: true,
        compilerOptions: {
          baseUrl: ".",
          paths: {
            "@/*": ["dist/types/*"],
            "@/components": ["dist/types/components/index"],
            "@/atoms": ["dist/types/components/atoms/index"],
            "@/molecules": ["dist/types/components/molecules/index"],
            "@/constants": ["dist/types/constants/index"],
            "@/utils": ["dist/types/utils/index"],
            "@/types": ["dist/types/types/index"],
            "@/web3": ["dist/types/web3/index"],
          },
        },
      }),
    ],
  },
];
