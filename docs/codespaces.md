# Codespaces Demo

GitHub Codespaces is useful for a zero-private-vault smoke test. It lets a new reader run the public fixture, inspect the CLI, and see the recall-pack shape before installing anything locally.

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1)

Codespaces cannot access your local Obsidian vault. Use it only for the bundled public fixture and repository tests. Real-vault recall still needs a local machine where the vault and optional Smart Connections `.smart-env` index are present.

## Quick Path

1. Open the repository in GitHub Codespaces: <https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1>.
2. Wait for the devcontainer `postCreateCommand` to finish `npm ci` and `npm run demo:query`.
3. Run the public fixture test:

```bash
npm test
```

4. Inspect a redacted fixture recall pack:

```bash
npm run demo:query
```

5. Review CLI help:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
```

## What This Proves

- The package installs on a clean Linux Node.js 20 environment.
- The public fixture vault in `docs/fixtures/demo-vault` can be queried without private data.
- The recall output schema and redaction behavior are visible before any real-vault use.
- Repository gates such as syntax checks, fixture recall smoke tests, privacy docs, and package checks can run in a reproducible cloud environment.

## What This Does Not Prove

- It does not test your local Obsidian vault.
- It does not test your local Smart Connections `.smart-env` vectors.
- It does not test local OS path discovery for Windows or macOS.
- It does not prove OHS first-run performance on a private vault.

After the Codespaces fixture passes, follow [install.md](install.md) on your local machine before running a real-vault query.
