# Troubleshooting

Use this page when the public fixture works but a real vault install, index, or query does not.

## First Checks

Run the fixture smoke test:

```bash
npm test
```

Check the CLI without touching a private vault:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
```

If both pass, the repo and Node.js runtime are basically healthy. The remaining issue is likely vault discovery, Smart Connections state, OHS first-run setup, or query settings.

## Vault Not Detected

Symptom:

```text
Could not resolve Obsidian vault. Pass --vault or set OBSIDIAN_VAULT_PATH.
```

Fix:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs detect --vault "/absolute/path/to/your-vault"
```

On Windows PowerShell, quote paths with spaces:

```powershell
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs detect --vault "D:\Notes\Obsidian Vault"
```

You can also set `OBSIDIAN_VAULT_PATH` in your shell. Prefer `--vault` for bug reports because it makes the command explicit; redact the actual path before sharing logs.

## Smart Connections Not Detected

Run:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs detect --vault "/absolute/path/to/your-vault"
```

If `smart.embeddedSources` and `smart.embeddedBlocks` are zero:

- Open Obsidian.
- Confirm Smart Connections is installed and enabled.
- Let Smart Connections finish indexing the vault.
- Re-run `detect`.

Expected fallback behavior:

- `--backend auto` uses Smart when local Smart vectors are available.
- `--backend auto` falls back to OHS when Smart vectors are missing.
- `--backend smart` can still use lexical fallback, but semantic Smart recall needs embedded blocks or sources.

## OHS First Run Or Stale Index

OHS is used for `--backend ohs`, `--backend both`, or `--backend auto` when Smart vectors are missing. First run can download packages/models and build a local DB.

Check status:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs status --vault "/absolute/path/to/your-vault"
```

Force a rebuild:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs reindex --vault "/absolute/path/to/your-vault" --force
```

If first-run setup fails:

- Confirm Node.js 20+.
- Confirm temporary network access for `npx obsidian-hybrid-search` and local model/package downloads.
- Re-run with a stable network.
- Avoid `--rerank` for smoke tests because it downloads a larger model.

## Slow Queries Or Too Many Results

Start with the fast daily path:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Use high-recall union only when extra latency and reading burden are acceptable:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad query" --vault "/absolute/path/to/your-vault" --backend both --limit 200 --per-channel 80
```

If results are too noisy, lower `--limit` or `--per-channel`. If recall is too low, raise them or try `--backend both`.

## Privacy-Safe Bug Reports

Open a bug report with:

- operating system
- Node.js version
- Obsidian version
- Smart Connections installed/indexed status
- backend used
- redacted command
- redacted error output

Do not paste private note paths, vault names, snippets, raw queries, gold labels, local usernames, tokens, `raw_runs.json`, or local cases files into public issues.

Use the public fixture vault whenever possible to reproduce a failure without private data.
