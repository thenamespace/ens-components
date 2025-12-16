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
  // Node.js built-in modules (should be externalized for browser builds)
  /^node:/,
  /^zlib$/,
  /^http2$/,
  /^stream$/,
  /^https$/,
  /^http$/,
  /^crypto$/,
  /^url$/,
  /^assert$/,
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
const nodeBuiltinsPlugin = () => {
  const nodeBuiltins = new Set([
    "zlib",
    "http2",
    "stream",
    "https",
    "http",
    "crypto",
    "url",
    "assert",
  ]);

  return {
    name: "node-builtins",
    resolveId(id) {
      if (nodeBuiltins.has(id)) {
        return { id: `\0${id}`, moduleSideEffects: false };
      }
      return null;
    },
    load(id) {
      if (id.startsWith("\0") && nodeBuiltins.has(id.slice(1))) {
        return "export default {};";
      }
      return null;
    },
  };
};

// Process polyfill for browser builds
const processPolyfill = `if (typeof process === 'undefined') { var process = { env: {}, version: '', versions: {}, platform: 'browser', nextTick: function(fn) { setTimeout(fn, 0); } }; }`;

export default [
  {
    input: "src/index.tsx",
    external: externals,
    output: {
      file: "dist/index.js",
      format: "es",
      sourcemap: true,
      inlineDynamicImports: true,
      interop: "esModule",
      externalLiveBindings: false,
      banner: processPolyfill,
    },
    plugins: [
      alias({ entries: aliasEntries }),
      nodeBuiltinsPlugin(),
      nodeResolve(nodeResolveOpts),
      esbuild({
        include: /\.[jt]sx?$/,
        target: "es2020",
        tsconfig: "tsconfig.json",
        jsx: "automatic",
      }),
      commonjs({
        exclude: [
          "**/node_modules/viem/**",
          "viem",
          "viem/**",
          "viem/*",
          "viem/chains",
          "viem/chains/**",
          "**/node_modules/viem/chains/**",
        ],
        transformMixedEsModules: false,
        defaultIsModuleExports: "auto",
        requireReturnsDefault: "auto",
        strictRequires: false,
        ignore: ["viem", "viem/**", "viem/chains", "viem/chains/**"],
      }),
      json(),
      image(),
      postcss({
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
      nodeBuiltinsPlugin(),
      nodeResolve(nodeResolveOpts),
      commonjs({
        exclude: [
          "**/node_modules/viem/**",
          "viem",
          "viem/**",
          "viem/*",
          "viem/chains",
          "viem/chains/**",
          "**/node_modules/viem/chains/**",
        ],
        transformMixedEsModules: false,
        defaultIsModuleExports: "auto",
        requireReturnsDefault: "auto",
        strictRequires: false,
        ignore: ["viem", "viem/**", "viem/chains", "viem/chains/**"],
      }),
      json(),
      image(),
      postcss({
        extract: false,
        inject: true,
        minimize: false,
        sourceMap: true,
        plugins: cssPlugins,
      }),
    ],
  },
  {
    input: "dist/types/index.d.ts",
    output: { file: "dist/index.d.ts", format: "es" },
    plugins: [
      alias({ entries: aliasEntries }),
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
    external: [/\.css$/, ...externals, /^@\//],
  },
];
