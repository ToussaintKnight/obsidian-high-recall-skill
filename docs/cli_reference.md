# CLI Reference

This project exposes two command-line entry points:

- `obsidian-high-recall`: query, detect, diagnose, status, and reindex a local Obsidian vault.
- `obsidian-high-recall-eval`: run recall evaluations over private or fixture cases.

When running from a clone, use the script paths shown below. When running through the package, use the bin names.

## Install-Or-Run Forms

Run directly from GitHub:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "your broad query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Run from a local clone:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs demo
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Run after package installation:

```bash
obsidian-high-recall demo
obsidian-high-recall query "your broad query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

## `obsidian-high-recall`

### `help`

```bash
obsidian-high-recall help
```

Prints usage text and exits without resolving a vault or touching local notes.

### `demo`

```bash
obsidian-high-recall demo
obsidian-high-recall demo --json
```

Runs one safe query against the bundled public fixture vault. It defaults to `--backend smart`, `--limit 10`, `--per-channel 20`, and `--neighbor-seeds 0`, so it does not require a private vault, Obsidian auto-discovery, Smart Connections cache, or OHS first-run download. Use this before trying a real vault.

### `detect`

```bash
obsidian-high-recall detect --vault "/absolute/path/to/your-vault"
```

Checks vault discovery and local Smart Connections/OHS state. Use this when auto-discovery fails or when debugging a new setup.

### `doctor`

```bash
obsidian-high-recall doctor --vault "/absolute/path/to/your-vault" --json
```

Produces a privacy-safe diagnostic report for bug reports and tester feedback. It should not print local paths, snippets, raw queries, note names, vault names, usernames, tokens, or gold labels. Review the output before posting it publicly.

### `status`

```bash
obsidian-high-recall status --vault "/absolute/path/to/your-vault" --json
```

Reports operational index state. Use it locally for debugging. Prefer `doctor --json` for public issue reports.

### `reindex`

```bash
obsidian-high-recall reindex --vault "/absolute/path/to/your-vault" --force
```

Rebuilds the OHS fallback index. This can take time and may require first-run package/model downloads for OHS. Do not run it when you only need a privacy-safe diagnostic.

### `query`

```bash
obsidian-high-recall query "data collection for embodied AI" --vault "/absolute/path/to/your-vault" --backend auto --limit 120 --json
```

Returns a recall pack with ranked hits, snippets, channels, scores, ranks, anchors, and JSON metadata. Query output can include private snippets, note paths, raw query text, and local `vault`/`db` paths. Do not paste real-vault query output into public issues without redaction.

The JSON recall pack schema, result fields, ranking semantics, and `privacy.safeToShare` flags are defined in [output_contract.md](output_contract.md).

## Query Options

| Option | Default | Meaning |
|---|---:|---|
| `--vault PATH` | auto-discovered | Absolute path to an Obsidian vault. |
| `--db PATH` | local app data path | Optional OHS database path. |
| `--backend auto|smart|ohs|both` | `auto` | Retrieval backend. `auto` prefers Smart Connections vectors when available. |
| `--limit N` | `120` | Maximum returned results. |
| `--per-channel N` | `80` | Candidate budget per channel before merge/ranking. |
| `--snippet-length N` | `320` | Approximate snippet length. Values below 80 reset to default. |
| `--neighbor-seeds N` | `25` | Add links/backlinks from the top N results as graph-neighbor recall candidates. |
| `--extra TEXT` | none | Add comma/semicolon-separated query expansions. |
| `--profile quick|deep` | `quick` | `deep` runs more fan-out calls and can be slower/noisier. |
| `--deep` | off | Shortcut for `--profile deep`. |
| `--json` | off | Emit machine-readable JSON. |
| `--rerank` | off | Enable OHS reranker for hybrid mode. Can trigger a larger first-run model download. |
| `--no-auto-index` | off | Do not auto-reindex when the OHS database is empty. |
| `--force` | off | Used by `reindex` to force rebuild. |

## Backend Choice

| Backend | Use when | Tradeoff |
|---|---|---|
| `auto` | Daily use, unknown setup | Fast path when Smart vectors exist, OHS fallback otherwise. |
| `smart` | Smart Connections has indexed the vault, or fixture/no-vector smoke tests | Fast; fixture may use lexical fallback when no `.smart-env` exists. |
| `ohs` | You need local hybrid/fulltext fallback | Slower; may require first-run package/model downloads. |
| `both` | Missing a relevant note is more costly than latency/noise | Best union recall path; slower and can return more noise. |

## Output Contract

`query --json` returns a local recall pack for agents and scripts. It intentionally includes private fields such as raw query text, vault-relative note paths, snippets, tags, links, backlinks, anchors, and local vault/database paths. The output declares `privacy.safeToShare: false`.

`doctor --json` returns a separate diagnostic object intended for public bug reports after manual review. It declares `privacy.safeToShare: true` and omits local paths, note names, snippets, raw queries, vault names, usernames, tokens, and gold labels.

The full schema and field-level privacy classification are in [output_contract.md](output_contract.md).

## `obsidian-high-recall-eval`

Use the evaluator when comparing retrieval behavior across backends.

Public fixture run:

```bash
obsidian-high-recall-eval .tmp/fixture-eval --vault docs/fixtures/demo-vault --cases docs/fixtures/demo_cases.json --backends smart --ks 5,10 --limit 20 --per-channel 20 --neighbor-seeds 0
```

Private real-vault run:

```bash
obsidian-high-recall-eval ./obsidian_recall_eval --vault "/absolute/path/to/your-vault" --cases ./cases.local.json --backends smart,ohs,rrf-union --ks 10,20,50
```

Cases file shape:

```json
[
  {
    "id": "my-topic",
    "query": "broad natural language query",
    "gold": ["Known-Relevant-Note-Title"]
  }
]
```

Evaluator outputs:

- `raw_runs.json`
- `metrics.json`
- `metrics.csv`

Keep these local unless you have manually redacted them. For public reports, share only aggregate metrics through [benchmark/reporting_guide.md](benchmark/reporting_guide.md).

## Evaluator Options

| Option | Default | Meaning |
|---|---:|---|
| `--cases PATH` | built-in example | JSON recall cases. Use private local files for real-vault evaluation. |
| `--vault PATH` | wrapper auto-discovery | Vault path passed to each backend run. |
| `--backends LIST` | `smart,ohs,rrf-union` | Comma-separated backend list. |
| `--ks LIST` | `10,20,50` | Comma-separated K values for Precision/Recall/F1/MRR metrics. |
| `--limit N` | `80` | Wrapper result limit. |
| `--per-channel N` | `30` | Candidate budget per channel. |
| `--neighbor-seeds N` | `0` | Graph-neighbor seeds for evaluator runs. |

## Privacy Rules For CLI Use

- Use `doctor --json` for public bug reports.
- Do not publish real-vault `query --json` output without redaction.
- Treat `query --json` packs with `privacy.safeToShare: false` as local-only.
- Do not commit `raw_runs.json`, `metrics.json`, `metrics.csv`, `cases.local.json`, OHS databases, `.smart-env`, model caches, or npm caches.
- Use [demo/fixture_walkthrough.md](demo/fixture_walkthrough.md) when you need a public expected-output example.
- Use [testing_guide.md](testing_guide.md) when reporting tester feedback.
