# Contributing

Contributions are welcome when they make the tool easier to install, safer for private vaults, more reproducible, or more useful across different Obsidian setups.

## Before Opening A PR

Run:

```bash
npm test
```

For skill-specific validation in Codex environments, also run:

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
- Link to [docs/troubleshooting.md](docs/troubleshooting.md) when reporting install, vault detection, Smart Connections, or OHS fallback issues.

## Good First Contributions

- Test install and smoke evaluation on macOS/Linux/Windows.
- Improve docs for Smart Connections setup and fallback behavior.
- Add fixture cases that cover bilingual or non-English queries without private data.
- Add tests around evaluator metrics, RRF union behavior, and privacy redaction.
- Report compatibility issues with Obsidian, Smart Connections, Node.js, or OHS versions.
