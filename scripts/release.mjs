import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

async function optionalResource(request) {
  try {
    return (await request()).data;
  } catch (error) {
    if (error.status === 404) return undefined;
    throw error;
  }
}

export async function release({ github, context }) {
  assert.equal(context.ref, "refs/heads/main", "Releases must run from main.");
  assert.equal(context.repo.owner, "thenamespace");
  assert.equal(context.repo.repo, "ens-components");
  const checkout = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  assert.equal(
    checkout,
    context.sha,
    "Checkout does not match the workflow commit."
  );

  const manifest = JSON.parse(
    readFileSync("packages/components/package.json", "utf8")
  );
  assert.equal(manifest.name, "@thenamespace/ens-components");
  const { name, version } = manifest;
  assert.match(
    version,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    "This workflow publishes stable versions only."
  );
  const changelog = readFileSync("CHANGELOG.md", "utf8");
  const section = changelog
    .split(/^## /m)
    .find(entry => entry.startsWith(`[${version}]\n`));
  const notes = section?.slice(section.indexOf("\n") + 1).trim();
  assert.ok(
    notes,
    `Add a non-empty ## [${version}] section to CHANGELOG.md in the version PR.`
  );

  const tag = `v${version}`;
  const ref = await optionalResource(() =>
    github.rest.git.getRef({ ...context.repo, ref: `tags/${tag}` })
  );
  if (ref) {
    let object = ref.object;
    while (object.type === "tag") {
      object = (
        await github.rest.git.getTag({ ...context.repo, tag_sha: object.sha })
      ).data.object;
    }
    assert.equal(object.type, "commit");
    assert.equal(
      object.sha,
      context.sha,
      `${tag} points to another commit; refusing to move it.`
    );
  }
  const existingRelease = await optionalResource(() =>
    github.rest.repos.getReleaseByTag({ ...context.repo, tag })
  );
  if (existingRelease) {
    assert.ok(ref, "An existing release must have a matching tag.");
    assert.equal(
      existingRelease.draft,
      false,
      "Resolve the existing draft release first."
    );
    assert.equal(existingRelease.prerelease, false);
  }

  const tarball = resolve(
    ".artifacts",
    `thenamespace-ens-components-${version}.tgz`
  );
  const integrity = `sha512-${createHash("sha512").update(readFileSync(tarball)).digest("base64")}`;
  const registry = await fetch(
    `https://registry.npmjs.org/${encodeURIComponent(name)}/${version}`,
    {
      signal: AbortSignal.timeout(30000),
    }
  );
  if (registry.ok) {
    const published = await registry.json();
    assert.equal(
      published.dist?.integrity,
      integrity,
      `${name}@${version} already exists with different contents. Bump the version in a PR.`
    );
    console.log(
      `${name}@${version} already contains this tarball; skipping npm publish.`
    );
  } else {
    assert.equal(
      registry.status,
      404,
      `npm registry lookup failed: HTTP ${registry.status}`
    );
    assert.ok(
      !existingRelease,
      "A GitHub Release exists but its npm version is missing; investigate before publishing."
    );
    execFileSync(
      "npm",
      [
        "publish",
        tarball,
        "--access",
        "public",
        "--provenance",
        "--registry",
        "https://registry.npmjs.org",
      ],
      { stdio: "inherit" }
    );
  }

  if (existingRelease) {
    console.log(`GitHub Release ${tag} already exists; leaving it unchanged.`);
    return;
  }
  // Creating the tag explicitly keeps a retry pinned to the published source commit.
  if (!ref) {
    await github.rest.git.createRef({
      ...context.repo,
      ref: `refs/tags/${tag}`,
      sha: context.sha,
    });
  }
  const result = await github.rest.repos.createRelease({
    ...context.repo,
    tag_name: tag,
    target_commitish: context.sha,
    name: tag,
    body: `${notes}\n\n[npm package](https://www.npmjs.com/package/${name}/v/${version})`,
    draft: false,
    prerelease: false,
  });
  console.log(`Created ${result.data.html_url}`);
}
