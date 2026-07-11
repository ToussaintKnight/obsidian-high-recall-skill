# Testing Guide

Use this guide if you want to help validate Obsidian High Recall on a new machine, operating system, vault size, Smart Connections state, or workflow. The goal is to collect useful public feedback without exposing private notes.

If you are installing from scratch, start with [install.md](install.md), then return here for the tester reporting path.

Public OS/backend coverage is tracked in [compatibility.md](compatibility.md); a useful tester report should be specific enough to update that matrix without exposing private notes.

## Ten-Minute Path

1. Clone and install:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm ci
```

2. Run the public fixture:

```bash
npm test
```

This uses only `docs/fixtures/demo-vault`. Passing this step means the package, CLI wiring, fixture evaluator, privacy gate, docs gates, and basic recall path work on your machine.

Expected output and stable fixture result facts are listed in [demo/fixture_walkthrough.md](demo/fixture_walkthrough.md).

3. Check CLI entry points:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI" --vault docs/fixtures/demo-vault --backend smart --limit 10
```

For command and option details, see [cli_reference.md](cli_reference.md).

For the `query --json` recall pack schema and field-level privacy classification, see [output_contract.md](output_contract.md).

4. If you have a real vault, run a privacy-safe diagnostic:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault "/absolute/path/to/your-vault" --json
```

Review the output before posting it. It should not contain local paths, note names, snippets, raw queries, vault names, usernames, tokens, or gold labels.

5. Optionally run one broad real-vault query:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120 --json
```

Do not paste the returned snippets or note paths into a public issue. Report only whether the result found useful notes, missed expected categories, was too noisy, or was too slow.

## What To Report

Open a tester feedback issue:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new?template=tester_feedback.yml

Useful public fields:

- Operating system and version.
- Node.js version.
- Whether `npm test` passed.
- Whether CLI entry points worked.
- Obsidian version if a real vault was tested.
- Smart Connections installed/indexed/not installed.
- Coarse vault size bucket, such as under 500 notes, 500-2,000 notes, 2,000-10,000 notes, or more than 10,000 notes.
- Which backend ran: `auto`, `smart`, `ohs`, or `both`.
- Privacy-safe `doctor --json` output, after manual review.
- A qualitative result: useful, missed expected notes, too noisy, too slow, or confusing.

## What Not To Report

Do not paste, upload, or screenshot:

- Private note paths.
- Private note titles.
- Snippets from private notes.
- Raw private queries.
- Vault names.
- Gold labels or local evaluation cases.
- `raw_runs.json`.
- `cases.local.json`.
- Local usernames or absolute home paths.
- API keys, tokens, cookies, or credentials.

Use synthetic examples or the public fixture vault when showing logs.

## Pass, Fail, Or Partial

Use these labels in your report:

| Result | Meaning |
|---|---|
| Fixture pass | `npm test` passes using only public fixture data |
| Install fail | `npm ci`, Node.js setup, or package wiring fails before fixture recall |
| Fixture fail | Install works, but public fixture evaluation fails |
| Doctor pass | `doctor --json` runs and stays privacy-safe on a real vault |
| Real-vault recall pass | A broad real-vault query returns useful local context |
| Real-vault recall weak | Query runs, but misses expected categories or returns too much noise |
| Privacy concern | Any output seems likely to reveal private data |

## If Something Fails

Try to reduce the failure to the public fixture first:

```bash
npm test
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI" --vault docs/fixtures/demo-vault --backend smart --limit 10 --json
```

If the fixture passes but your real vault fails, run:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault "/absolute/path/to/your-vault" --json
```

Then compare the failure with [troubleshooting.md](troubleshooting.md). If it still fails, open a bug report with redacted commands and privacy-safe diagnostic output.

## Benchmark Reports

If you want to evaluate retrieval quality, use the separate [benchmark reporting guide](benchmark/reporting_guide.md). Benchmark reports should share aggregate metrics only: Precision@K, Recall@K, F1, MRR, retrieved count, and latency. Keep private cases files and raw runs local.
