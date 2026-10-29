# Contributing to ENS Components

## Setup

Use Node.js 24 and pnpm 10.13.1. The package manager version is pinned in
`package.json`.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm landing
```

The playground runs at http://localhost:4000. Use `pnpm storybook` for the
component explorer at http://localhost:6006.

| Directory             | Purpose                 |
| --------------------- | ----------------------- |
| `packages/components` | Published React library |
| `apps/landing`        | Playground and examples |
| `apps/storybook`      | Component stories       |
| `apps/e2e`            | Sepolia wallet tests    |

## Checks

```sh
pnpm format:check
pnpm build
pnpm check:package
```

Use `pnpm format` to apply Prettier. PR checks run formatting, all three builds,
and package validation. The package check runs publint and Are the Types Wrong,
checks the tarball contents, and installs it in an isolated consumer to test ESM,
CommonJS, TypeScript, and the README example. It needs npm registry access and
uses the minimum declared viem and wagmi versions.

ESLint is installed but not configured. The builds include TypeScript checks.

The [Sepolia E2E suite](apps/e2e/README.md) is separate. It needs a funded test
wallet and sends transactions. Follow its setup before running `pnpm e2e`; do
not put wallet keys or provider credentials in PR workflows.

## Pull requests

Work on a branch and keep changes focused. Use Conventional Commit messages,
such as `fix: preserve record values when switching chains`. Explain the changed
behavior, the checks you ran, and anything that still needs verification.
Keep formatting-only changes in a separate commit.

Update the package README and examples when changing public props, callbacks,
setup, or compatibility. Add a short user-facing entry to `CHANGELOG.md` for
published changes, including migration steps when needed. Keep credentials in
ignored `.env` files and use dummy values in `.env.example`.

## Publishing a release

1. In a PR, bump `packages/components/package.json` to an unpublished stable
   version. Move the relevant entries from `Unreleased` in [CHANGELOG.md](CHANGELOG.md)
   under a heading such as `## [3.0.1]`. Include migration instructions for breaking changes.
2. After review, approval, and merge, run **Publish npm package and GitHub release**
   from `main` in GitHub Actions. It validates the selected commit and publishes
   the checked tarball using the existing `NPM_TOKEN` secret, with npm provenance.
3. The workflow creates `v<version>` at that commit and a GitHub Release with
   GitHub-generated release notes, an npm link, and a link to the changelog.
   It never commits or pushes to `main`.

The workflow rejects existing tags, and npm rejects already-published versions.
It does not publish prereleases or automatically recover partial releases. If
npm publishing succeeds but GitHub release creation fails, check the published
package and finish only the GitHub release for that version at the original
workflow commit. If the tag already exists, verify it points to that commit
before using it. Do not rerun the publishing job to repair a GitHub release.

Keep the root and package `LICENSE` files identical; the package check verifies
this. To require PR checks before merging, a repository admin must make
**Format, build, and package** a required check in GitHub's branch rules.

## Playground deployments

The playground builds from the workspace library. Publishing to npm does not
update the website.

Run **Build playground and request staging deployment** from `main`. It builds
and pushes an image, records a staging request in GitHub Deployments, and asks
Namespace infrastructure to open a PR for the `uikit` app. The infrastructure
repository comes from the existing `GH_INFRA_REPOSITORY_PATH` variable; the
workflow uses the existing GCP configuration and `REPOSITORY_DISPATCH_PAT`.

A successful dispatch means the request was accepted, not that the infra PR or
rollout succeeded. The deployment stays **queued** until a maintainer confirms
that the image tag is running at https://test.enscomponents.com. The workflow
summary includes the deployment ID. After checking the infra PR and rollout,
record the result with that ID:

```sh
gh api --method POST repos/thenamespace/ens-components/deployments/DEPLOYMENT_ID/statuses \
  -f state=success \
  -f environment_url=https://test.enscomponents.com \
  -f description='Verified the requested image is running in staging.'
```

Use `state=failure` with a suitable description for a failed rollout, or
`state=inactive` for an abandoned request. The infra pipeline does not yet report
these results back automatically. It must check the deployed image revision,
then update this source repository's deployment ID when that integration is added.
A successful workflow or an HTTP 200 from an older deployment is not sufficient.
Production promotion remains a separate reviewed infrastructure change.
