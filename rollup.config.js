// rollup.config.js (ESM)
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import json from "@rollup/plugin-json";
import postcss from "rollup-plugin-postcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import esbuild from "rollup-plugin-esbuild";
import dts from "rollup-plugin-dts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    input: "src/index.tsx",
    external: [/^react($|\/)/, /^react-dom($|\/)/],
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      inlineDynamicImports: true, // <-- key to avoid multiple chunks
    },
    plugins: [
      alias({
        entries: [
          { find: "@", replacement: path.resolve(__dirname, "src") },
          { find: "@/components", replacement: path.resolve(__dirname, "src/components") },
          { find: "@/atoms", replacement: path.resolve(__dirname, "src/components/atoms") },
          { find: "@/molecules", replacement: path.resolve(__dirname, "src/components/molecules") },
          { find: "@/constants", replacement: path.resolve(__dirname, "src/constants") },
          { find: "@/utils", replacement: path.resolve(__dirname, "src/utils") },
          { find: "@/types", replacement: path.resolve(__dirname, "src/types") },
          { find: "@/web3", replacement: path.resolve(__dirname, "src/web3") },
        ],
      }),
      nodeResolve({
        browser: true,
        mainFields: ["module", "browser", "main"],
        exportConditions: ["browser", "module", "default"],
        extensions: [".mjs", ".js", ".ts", ".tsx", ".json"],
        preferBuiltins: false,
      }),
      commonjs(),
      json(),
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
        plugins: [
          autoprefixer(), 
          cssnano({ 
            preset: ["default", {
              normalizeWhitespace: false,
              discardComments: { removeAll: false }
            }]
          })
        ],
        inject: false,
      }),
    ],
    treeshake: true,
  },
  {
    input: "dist/types/index.d.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [dts({ respectExternal: true })],
    external: [/\.css$/,   /^react($|\/)/, /^react-dom($|\/)/, /^wagmi/, /^viem/, /^@tanstack\/react-query/],
  },
];
