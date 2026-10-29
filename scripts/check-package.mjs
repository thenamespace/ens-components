import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

const artifacts = resolve(".artifacts");
mkdirSync(artifacts, { recursive: true });
const [packed] = JSON.parse(
  execFileSync("npm", ["pack", "--json", "--pack-destination", artifacts], {
    cwd: "packages/components",
    encoding: "utf8",
  })
);
const tarball = resolve(artifacts, packed.filename);
const unpacked = mkdtempSync(resolve(tmpdir(), "ens-package-check-"));

try {
  execFileSync("tar", ["-xzf", tarball, "-C", unpacked]);
  const packageRoot = resolve(unpacked, "package");
  const manifest = JSON.parse(
    readFileSync(resolve(packageRoot, "package.json"), "utf8")
  );
  assert.equal(manifest.license, "MIT");
  assert.equal(
    readFileSync(resolve(packageRoot, "LICENSE"), "utf8"),
    readFileSync("LICENSE", "utf8")
  );
  assert.ok(
    readFileSync(resolve(packageRoot, "README.md"), "utf8").includes(
      manifest.name
    )
  );

  const exportPaths = value =>
    typeof value === "string"
      ? [value]
      : Object.values(value).flatMap(exportPaths);
  for (const path of new Set([
    manifest.main,
    manifest.module,
    manifest.types,
    ...exportPaths(manifest.exports),
  ])) {
    assert.ok(
      readFileSync(resolve(packageRoot, path)).length > 0,
      `Empty package export: ${path}`
    );
  }
  for (const { path } of packed.files) {
    assert.ok(
      !/(^|\/)(\.env(?:\.|$)|src\/|node_modules\/)/.test(path),
      `Unexpected package file: ${path}`
    );
  }

  execFileSync(resolve("node_modules/.bin/publint"), [tarball, "--strict"], {
    stdio: "inherit",
  });
  // CSS files are checked above; attw checks JavaScript entry points with modern resolution.
  execFileSync(
    resolve("node_modules/.bin/attw"),
    [
      tarball,
      "--profile",
      "node16",
      "--exclude-entrypoints",
      "styles.css",
      "index.css",
    ],
    { stdio: "inherit" }
  );

  // Keep the consumer outside the workspace so hoisted dependencies cannot hide missing ones.
  writeFileSync(
    resolve(unpacked, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        [manifest.name]: `file:${tarball}`,
        react: "19.0.0",
        "react-dom": "19.0.0",
        viem: "2.46.3",
        wagmi: "2.19.5",
        "@tanstack/react-query": "5.90.20",
        "@rainbow-me/rainbowkit": "2.2.8",
        "@types/react": "19.2.13",
        "@types/react-dom": "19.2.3",
      },
    })
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
    ],
    {
      cwd: unpacked,
      stdio: "inherit",
      timeout: 300_000,
    }
  );

  const smoke = `
    import assert from 'node:assert/strict';
    import { createRequire } from 'node:module';
    import { EnsNameRegistrationForm, EnsRecordsForm, SubnameMintForm } from '@thenamespace/ens-components';
    for (const component of [EnsNameRegistrationForm, EnsRecordsForm, SubnameMintForm]) {
      assert.equal(typeof component, 'function');
    }
    const require = createRequire(import.meta.url);
    const cjs = require('@thenamespace/ens-components');
    assert.equal(typeof cjs.EnsNameRegistrationForm, 'function');
    for (const entry of ${JSON.stringify(Object.keys(manifest.exports))}) {
      const specifier = entry === '.' ? '${manifest.name}' : '${manifest.name}/' + entry.slice(2);
      require.resolve(specifier);
      import.meta.resolve(specifier);
    }
  `;
  writeFileSync(resolve(unpacked, "smoke.mjs"), smoke);
  execFileSync(process.execPath, ["smoke.mjs"], {
    cwd: unpacked,
    stdio: "inherit",
  });

  const consumerTypes = `
    import { EnsNameRegistrationForm, EnsRecordsForm, SubnameMintForm } from '@thenamespace/ens-components';
    import type { EnsRecords } from '@thenamespace/ens-components';
    import type { ComponentProps } from 'react';
    import '@thenamespace/ens-components/styles';
    const records: EnsRecords = { addresses: [], texts: [] };
    const registration: ComponentProps<typeof EnsNameRegistrationForm> = { isTestnet: true };
    const editor: ComponentProps<typeof EnsRecordsForm> = { name: 'example.eth', existingRecords: records };
    const mint: ComponentProps<typeof SubnameMintForm> = { parentName: 'example.eth' };
  `;
  writeFileSync(resolve(unpacked, "consumer.mts"), consumerTypes);
  writeFileSync(resolve(unpacked, "consumer.cts"), consumerTypes);
  const tsc = resolve("packages/components/node_modules/typescript/bin/tsc");
  const flags = [
    "--noEmit",
    "--strict",
    "--skipLibCheck",
    "--target",
    "es2022",
    "--jsx",
    "react-jsx",
  ];
  execFileSync(
    process.execPath,
    [tsc, ...flags, "--module", "NodeNext", "consumer.mts", "consumer.cts"],
    {
      cwd: unpacked,
      stdio: "inherit",
    }
  );
  for (const [index, readme] of [
    "README.md",
    "packages/components/README.md",
  ].entries()) {
    const example = readFileSync(readme, "utf8").match(/```tsx\n([\s\S]*?)```/);
    assert.ok(example, `Missing quick-start example in ${readme}`);
    writeFileSync(resolve(unpacked, `readme-${index}.tsx`), example[1]);
    execFileSync(
      process.execPath,
      [
        tsc,
        ...flags,
        "--module",
        "esnext",
        "--moduleResolution",
        "bundler",
        `readme-${index}.tsx`,
      ],
      {
        cwd: unpacked,
        stdio: "inherit",
      }
    );
  }
  console.log(
    `Verified ${packed.filename}: package lint, ESM/CJS types and imports, isolated consumer, README examples, and MIT license.`
  );
} finally {
  rmSync(unpacked, { recursive: true, force: true });
}
