import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { createRequire } from "node:module";
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
const unpacked = mkdtempSync(resolve(artifacts, "package-check-"));

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

  const scope = resolve(unpacked, "node_modules/@thenamespace");
  mkdirSync(scope, { recursive: true });
  symlinkSync(packageRoot, resolve(scope, "ens-components"), "dir");
  const require = createRequire(resolve(unpacked, "consumer.cjs"));
  for (const entry of Object.keys(manifest.exports)) {
    require.resolve(
      entry === "." ? manifest.name : `${manifest.name}/${entry.slice(2)}`
    );
  }
  // Run from a consumer directory so resolution goes through the packed exports map.
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `
    import assert from 'node:assert/strict';
    import { EnsNameRegistrationForm, EnsRecordsForm, SubnameMintForm } from '@thenamespace/ens-components';
    for (const component of [EnsNameRegistrationForm, EnsRecordsForm, SubnameMintForm]) {
      assert.equal(typeof component, 'function');
    }
  `,
    ],
    { cwd: unpacked, stdio: "inherit" }
  );
  const cjs = require(manifest.name);
  assert.equal(typeof cjs.EnsNameRegistrationForm, "function");
  console.log(
    `Verified ${packed.filename}: ESM/CJS imports, exports, styles, types, README, and MIT license.`
  );
} finally {
  rmSync(unpacked, { recursive: true, force: true });
}
