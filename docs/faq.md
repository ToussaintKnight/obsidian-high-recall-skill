# FAQ

This page answers the questions most likely to decide whether a new user will try Obsidian High Recall on a real vault.

## Is This An Obsidian Plugin?

No. It is a local CLI and Codex skill that reads an Obsidian vault from disk. It does not add a new Obsidian pane or chat UI. The intended use is to produce high-recall context packs for agents, scripts, benchmarks, and CLI workflows.

If you want a polished Obsidian-native UI, use an Obsidian plugin or vault-native agent client. If you want broad local context before an agent writes, plans, codes, or summarizes, use this tool as the recall layer.

## Does It Upload My Notes?

The wrapper does not intentionally upload vault contents, snippets, note paths, raw queries, or benchmark labels. Querying reads local Markdown, local Smart Connections cache files, and/or a local OHS database.

Network access can still happen for dependency setup:

- GitHub-backed `npx` can download this package.
- OHS fallback can download `obsidian-hybrid-search` and model/runtime packages on first use.
- Smart vector search can download local inference packages/model files on first use.

These are dependency downloads, not intentional note-content uploads. The project does not sandbox npm packages, model downloads, Obsidian plugins, or the local operating system. See [dependency_inventory.md](dependency_inventory.md), [privacy_threat_model.md](privacy_threat_model.md), and [SECURITY.md](../SECURITY.md).

## Do I Need Smart Connections?

No. Smart Connections is recommended because it provides a fast local semantic index when fully indexed, but it is not required.

Backend behavior:

- `auto`: uses Smart vectors when available, otherwise falls back to OHS.
- `smart`: uses Smart vectors when available and lexical fallback for fixture/no-vector cases.
- `ohs`: uses `obsidian-hybrid-search`.
- `both`: merges Smart and OHS results for higher recall at higher latency.

Run `doctor --json` to inspect your setup without reading note contents into a public log.

## Why Optimize Recall Over Precision?

The target workflow is the broad retrieval step before an agent or human makes a decision. In that stage, a missed relevant note can distort the whole answer. Extra context usually costs only reading time.

This means Precision@K can look conservative, especially because unlabelled but useful notes count as false positives in small manual benchmarks. Use `--limit` and `--per-channel` to tune reading burden.

## Why Is The Main Benchmark From A Private Vault?

The tool is built for private research memory, so real value appears on real private vaults. Publishing raw note identifiers, snippets, paths, queries, or labels would defeat the privacy goal.

The repo therefore includes:

- a public fixture vault for install and output-shape reproduction;
- aggregate/anonymized private-vault benchmark metrics;
- redacted output examples;
- a benchmark reporting guide for privacy-safe real-vault reports.

Use [examples](examples/README.md), [demo/fixture_walkthrough.md](demo/fixture_walkthrough.md), and [benchmark/reporting_guide.md](benchmark/reporting_guide.md).

## How Is This Different From Smart Connections?

Smart Connections is an Obsidian plugin and local semantic layer. Obsidian High Recall reuses Smart Connections data when available, then exposes it through a portable CLI/Codex workflow with:

- fallback retrieval through OHS;
- optional Smart+OHS union;
- JSON output contract for agents/scripts;
- evaluator metrics;
- public fixture tests;
- privacy-safe reporting conventions.

It complements Smart Connections rather than replacing it.

## How Is This Different From obsidian-hybrid-search?

OHS is a strong local hybrid/fulltext backend. This project wraps it as one recall channel and adds Smart Connections reuse, backend routing, result merging, Codex skill instructions, fixture tests, benchmark docs, privacy gates, and public contribution workflow.

Use OHS directly when you only need the OHS search CLI. Use this project when you want a higher-level recall pack and agent-ready workflow.

## What Is Safe To Share Publicly?

Usually safe after review:

- public fixture output;
- `doctor --json` output;
- aggregate benchmark metrics;
- compatibility reports without paths, snippets, queries, vault names, or note names.

Do not share without redaction:

- real-vault `query --json` recall packs;
- `raw_runs.json`;
- local cases files;
- note paths, note titles, snippets, raw private queries, vault names, local usernames, tokens, or gold labels.

The output contract marks real query packs as `privacy.safeToShare: false`.

## What Should I Do If npx Fails?

For a local clone, use the checked-in Node script instead of `npx .`:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
```

For GitHub-backed `npx`, set a writable npm cache if your default cache is blocked:

```bash
npm_config_cache=.tmp/npm-cache npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Windows PowerShell syntax is in [troubleshooting.md](troubleshooting.md).

## Does It Work On Windows, macOS, Linux, And WSL?

CI runs the public fixture on Linux, Windows, and macOS. Real-vault behavior depends on Obsidian config discovery, path quoting, Smart Connections state, OHS first-run setup, local filesystem permissions, and model/package downloads.

Public OS/backend coverage is tracked in [compatibility.md](compatibility.md). The most useful contribution is a privacy-safe tester report that fills one missing row.

## How Do I Contribute Without Sharing Private Notes?

Start with [testing_guide.md](testing_guide.md), then open a tester feedback issue with:

- OS and Node.js version;
- Obsidian and Smart Connections status;
- whether `npm test` passed;
- backend used;
- privacy-safe `doctor --json` output;
- qualitative result, such as useful, too noisy, too slow, or missed expected categories.

Starter issue drafts live in [community/starter_issues.md](community/starter_issues.md). Do not attach private vault output.

## What Are The Main Limitations?

- It is not an Obsidian-native UI.
- It does not sandbox npm/model/plugin code.
- Private-vault benchmark results are not universal claims.
- `both` and OHS paths can be slower than Smart-only recall.
- Recall-first output can be noisy by design.
- Real-vault query output can contain private data and should stay local.
