# Output Contract

This document defines the public machine-readable contract for Obsidian High Recall outputs. It is meant for agent wrappers, scripts, benchmarks, and issue reporters that need to know which fields are stable and which fields may contain private vault content.

## Status

- Current schema version: `0.1`.
- Primary object: recall pack returned by `obsidian-high-recall query ... --json`.
- Privacy-safe diagnostic object: returned by `obsidian-high-recall doctor --json`.
- Compatibility promise: fields documented as stable should only change with a schema version bump. Extra fields may be added without a version bump.

The query recall pack is designed for local agent context, not public sharing. The doctor report is designed for public bug reports after manual review.

## Recall Pack Shape

Run:

```bash
obsidian-high-recall query "broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120 --json
```

Top-level stable fields:

| Field | Type | Stable | Privacy | Meaning |
|---|---|---:|---|---|
| `schemaVersion` | string | yes | safe | Output contract version, currently `0.1`. |
| `query` | string | yes | private | Raw user query. |
| `generatedAt` | ISO string | yes | safe | Time the pack was generated. |
| `vault` | string | yes | private | Resolved local vault path. |
| `db` | string | yes | private | Local OHS database path. |
| `privacy` | object | yes | safe | Machine-readable warning flags for consumers. |
| `backend` | object | yes | mixed | Selected backend and local backend detection details. |
| `index` | object | yes | mixed | OHS and Smart Connections index state. |
| `expansions` | object | yes | private | Query expansions derived from the raw query. |
| `profile` | string | yes | safe | `quick` or `deep`. |
| `searchPlan` | object | yes | private | Queries and terms issued to backend channels. |
| `channels` | array | yes | safe | Per-channel candidate counts. |
| `results` | array | yes | private | Ranked recall results. |
| `resultCountBeforeLimit` | number | yes | safe | Merged candidate count before `--limit`. |

The `privacy` object in query output is expected to contain:

```json
{
  "safeToShare": false,
  "rawQueryIncluded": true,
  "localPathsIncluded": true,
  "snippetsIncluded": true,
  "noteNamesIncluded": true
}
```

Consumers should treat any recall pack with `safeToShare: false` as local-only unless a human has redacted it.

## Result Shape

Each item in `results` is a ranked note or graph-neighbor candidate:

| Field | Type | Stable | Privacy | Meaning |
|---|---|---:|---|---|
| `path` | string | yes | private | Vault-relative Markdown path. |
| `title` | string or null | yes | private | Note title inferred from backend metadata or path. |
| `tags` | string[] | yes | private | Parsed or backend-provided tags. |
| `snippet` | string or null | yes | private | Local note text excerpt. |
| `bestScore` | number | yes | safe by itself | Highest backend score observed for the result. |
| `bestRank` | number or null | yes | safe by itself | Best rank across source channels. |
| `channels` | string[] | yes | safe | Channels that surfaced the result. |
| `matchedBy` | string[] | yes | safe | Backend match labels, such as `smart-vector` or `lexical`. |
| `channelRanks` | object | yes | safe | Per-channel rank map. |
| `links` | string[] | yes | private | Outgoing Markdown links seen by backend output. |
| `backlinks` | string[] | yes | private | Backlinks seen by backend output. |
| `urls` | string[] | yes | potentially private | URLs extracted by backend output. |
| `anchors` | object[] | yes | private | Anchor metadata such as line ranges or heading paths. |
| `graphReasons` | string[] | yes | private | Why a graph-neighbor candidate was included. |
| `recallScore` | number | yes | safe by itself | Internal merge/ranking score. Higher sorts earlier. |

Known channel labels:

| Channel | Source |
|---|---|
| `smart-source` | Smart Connections source-level vectors. |
| `smart-block` | Smart Connections block-level vectors. |
| `lexical` | Local markdown lexical fallback. |
| `semantic` | OHS semantic search. |
| `hybrid` | OHS hybrid search. |
| `fulltext` | OHS full-text search. |
| `title` | OHS title search. |
| `tag` | OHS tag-constrained semantic search. |
| `graph-neighbor` | Link/backlink expansion from top merged results. |

## Ranking Semantics

`results` are sorted by `recallScore`, then by `bestRank`, then by `bestScore`. The score is intentionally heuristic and recall-oriented. It is suitable for ordering candidate context for an agent, but it is not a calibrated probability of relevance.

For quality evaluation, use `obsidian-high-recall-eval` and report Precision@K, Recall@K, F1@K, MRR, retrieved count, and latency. Do not infer benchmark quality from raw `recallScore` alone.

## Doctor Report

Run:

```bash
obsidian-high-recall doctor --vault "/absolute/path/to/your-vault" --json
```

The doctor report has its own top-level `privacy.safeToShare: true` flag and is designed to omit local paths, note names, snippets, raw queries, vault names, usernames, tokens, and gold labels. Review it before posting publicly.

Stable doctor fields include:

| Field | Meaning |
|---|---|
| `schemaVersion` | Output contract version. |
| `privacy` | Share-safety guarantees for the diagnostic report. |
| `runtime` | Node.js, platform, and architecture. |
| `vault` | Coarse vault detection status and markdown file count. |
| `smart` | Coarse Smart Connections index counts and detection flags. |
| `ohs` | Coarse OHS database existence/size status. |
| `recommendations` | Setup hints that avoid private data. |

## Public Sharing Rules

Safe to share after review:

- `doctor --json` output.
- Aggregate benchmark metrics.
- Public fixture outputs from `docs/fixtures/demo-vault`.

Do not share without redaction:

- Real-vault `query --json` recall packs.
- `raw_runs.json`.
- Local cases files.
- Private note paths, titles, tags, snippets, links, backlinks, URLs, raw queries, vault names, or gold labels.

For reproducible public examples, use [demo/fixture_walkthrough.md](demo/fixture_walkthrough.md). For command details, use [cli_reference.md](cli_reference.md). For benchmark reporting, use [benchmark/reporting_guide.md](benchmark/reporting_guide.md).
