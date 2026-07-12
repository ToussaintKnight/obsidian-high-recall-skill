# NPM Publish Readiness

This project is currently installable through a local clone or GitHub-backed `npx`. Publishing to the npm registry is the next step toward a standard one-command install:

```bash
npx obsidian-high-recall query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Do not advertise the registry command until the package has actually been published and verified.

## Current Status

- Package name: `obsidian-high-recall`
- Version: `0.1.0`
- Access: public
- License: MIT
- Runtime: Node.js 20+
- Declared runtime dependencies: none
- CLI bins:
  - `obsidian-high-recall`
  - `obsidian-high-recall-eval`

## Required Local Gates

Run these before any npm publish attempt:

```bash
npm test
npm run privacy:scan
npm run publish:check
```

`npm run publish:check` verifies package metadata, package contents, bin entries, publish configuration, release docs, privacy docs, and installed-package CLI behavior through the existing package smoke tests.

## GitHub Actions Publish Workflow

The repeatable registry publish path is `.github/workflows/npm-publish.yml`.

Before using it:

1. Configure an npm automation token as the repository secret `NPM_TOKEN`.
2. Push the release commit and confirm CI is green.
3. Confirm the GitHub release tag exactly matches `package.json`, for example `v0.1.0`.
4. Trigger the workflow by publishing a GitHub release, or run `workflow_dispatch` with the same tag.

The workflow runs `npm test`, `npm run privacy:scan`, and `npm run publish:check`, rejects a tag/version mismatch, rejects an already-published package version, and publishes with:

```bash
npm publish --access public --provenance
```

Keep the workflow disabled by omission of `NPM_TOKEN` until the repo is pushed, CI is green, and the release notes are final.

## Dry Run

Inspect the exact package payload:

```bash
npm pack --dry-run --json --cache .tmp/npm-cache
```

The package should include source, skill files, public fixtures, docs, release notes, security policy, contribution docs, citation metadata, and public benchmark artifacts. It must not include local evaluation runs, private cases, raw snippets, private vault paths, `.smart-env`, OHS databases, or local cache directories.

## Publish Steps

Manual publishing is the fallback path. Prefer the GitHub Actions workflow above after `NPM_TOKEN` is configured.

1. Confirm the GitHub repository is pushed and CI is green.
2. Confirm the release notes match `package.json` version.
3. Authenticate to npm in a clean terminal.
4. Run:

```bash
npm publish --access public
```

5. Verify the package page and registry install:

```bash
npm view obsidian-high-recall version
npx --yes obsidian-high-recall help
```

6. Update [docs/install.md](install.md), [README.md](../README.md), [README.zh-CN.md](../README.zh-CN.md), and [docs/releases/v0.1.0.md](releases/v0.1.0.md) only after the registry command works.

## If A Publish Goes Wrong

- If a real credential or private vault data is published, treat it as a security incident: revoke/rotate the credential, unpublish if allowed by npm policy, and open a private security advisory path.
- If only docs or metadata are wrong, publish a patch release with corrected docs.
- Do not publish real-vault recall packs, `.smart-env`, local OHS databases, `raw_runs.json`, or private cases files as package artifacts.

## Related Docs

- Install guide: [install.md](install.md)
- Dependency inventory: [dependency_inventory.md](dependency_inventory.md)
- Privacy threat model: [privacy_threat_model.md](privacy_threat_model.md)
- Release notes: [releases/v0.1.0.md](releases/v0.1.0.md)
