# Contributing

Contributions are welcome when they make the tool easier to install, safer for private vaults, more reproducible, or more useful across different Obsidian setups.

## Before Opening A PR

Run:

```bash
npm test
```

CI runs this same command on Linux, Windows, and macOS.

For privacy-sensitive changes, or before sharing a branch publicly, run the leak gate directly:

```bash
npm run privacy:scan
```

When editing README or docs, run the local link check:

```bash
npm run docs:links
```

When changing install commands, first-run setup, or OS-specific onboarding docs, run:

```bash
npm run install:check
```

When changing usage recipes, copy-paste workflow commands, or scenario guidance, run:

```bash
npm run recipes:check
```

When changing fixture demo assets, public fixture walkthroughs, or first-run demo copy, run:

```bash
npm run demo:check
```

When changing CLI options, help output, package bins, or command reference docs, run:

```bash
npm run cli:check
```

When changing JSON output fields, recall pack privacy flags, or doctor report shape, update [docs/output_contract.md](docs/output_contract.md) and run:

```bash
npm run output:check
```

When changing public positioning, comparison, launch, or marketing copy, run:

```bash
npm run positioning:check
```

When changing evaluator, benchmark, or ranking behavior, run:

```bash
npm run rrf:check
```

When changing the Codex skill, agent metadata, bundled references, or npm package hooks, run:

```bash
npm run skill:check
```

When changing package version, release notes, or user-visible behavior, update `CHANGELOG.md` and run:

```bash
npm run release:check
```

When changing issue templates, PR checklist, support paths, or starter issues, run:

```bash
npm run community:check
```

When changing Dependabot, labels, repository setup, or maintenance policy, update [docs/community/maintenance.md](docs/community/maintenance.md) and run:

```bash
npm run community:check
```

For additional validation inside a Codex installation, also run the system skill validator when available:

```bash
python <codex-home>/skills/.system/skill-creator/scripts/quick_validate.py skills/obsidian-high-recall
```

Use the public fixture vault for examples and tests:

```bash
node skills/obsidian-high-recall/scripts/evaluate_recall.mjs .tmp/fixture-eval --vault docs/fixtures/demo-vault --cases docs/fixtures/demo_cases.json --backends smart
```

## Privacy Rules

- Do not commit private vault contents, note paths, snippets, queries, or labels.
- Do not commit `raw_runs.json`, local cases files, local database files, `.smart-env`, or dependency caches.
- Use `docs/fixtures/demo-vault` for reproducible tests and documentation examples.
- Redact local paths and usernames from screenshots and logs.
- Treat `npm run privacy:scan` as a public-file guardrail; still manually review images, issue text, and benchmark reports before publishing.
- Link to [docs/troubleshooting.md](docs/troubleshooting.md) when reporting install, vault detection, Smart Connections, or OHS fallback issues.

## Good First Contributions

- Test install and smoke evaluation on macOS/Linux/Windows.
- Improve docs for Smart Connections setup and fallback behavior.
- Add fixture cases that cover bilingual or non-English queries without private data.
- Add tests around evaluator metrics, RRF union behavior, and privacy redaction.
- Report compatibility issues with Obsidian, Smart Connections, Node.js, or OHS versions.

Copy-ready starter issue drafts live in [docs/community/starter_issues.md](docs/community/starter_issues.md).
