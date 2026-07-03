# Obsidian High Recall for Codex

Language: [English](README.md) | [中文](README.zh-CN.md)

A portable Codex skill for high-recall retrieval over a local Obsidian vault.

This is for workflows where missing relevant notes is worse than returning extra noise. It prefers Smart Connections local vectors when available, and falls back to `obsidian-hybrid-search` when needed.

## What It Does

- Auto-discovers the active Obsidian vault from Obsidian app config.
- Reads Smart Connections `.smart-env` vectors when the plugin has indexed the vault.
- Falls back to `obsidian-hybrid-search` through `npx`.
- Supports `auto`, `smart`, `ohs`, and `both` backends.
- Returns broad recall packs with snippets, channels, scores, ranks, and JSON output.
- Keeps derived indexes and runtime packages outside the vault.

## Requirements

- Codex Desktop or another Codex environment that supports local skills.
- Node.js available on `PATH`.
- Obsidian vault stored on local disk.
- Optional but recommended: Obsidian Smart Connections plugin, fully indexed.

First run may download npm/Hugging Face packages for local inference. The skill does not intentionally upload vault contents; retrieval and embedding inference run locally after dependencies are available.

## Install

### Install From GitHub In Codex

Ask Codex:

```text
Use $skill-installer to install https://github.com/ToussaintKnight/obsidian-high-recall-skill/tree/main/skills/obsidian-high-recall
```

Restart Codex after installation.

### Manual Install

Windows PowerShell:

```powershell
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item ".\obsidian-high-recall-skill\skills\obsidian-high-recall" "$env:USERPROFILE\.codex\skills\" -Recurse
```

macOS/Linux:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
mkdir -p ~/.codex/skills
cp -R ./obsidian-high-recall-skill/skills/obsidian-high-recall ~/.codex/skills/
```

Restart Codex.

## Use In Codex

Ask:

```text
Use $obsidian-high-recall to find a high-recall pack for "data collection for embodied AI".
```

For maximum recall:

```text
Use $obsidian-high-recall with backend both and limit 200 for "robot foundation model demonstration data".
```

## Use From CLI

From the installed skill directory:

```bash
node scripts/obsidian_high_recall.mjs detect
node scripts/obsidian_high_recall.mjs status
node scripts/obsidian_high_recall.mjs query "data collection for embodied AI" --backend auto --limit 120 --json
node scripts/obsidian_high_recall.mjs query "robot teleoperation demonstrations" --backend both --limit 200 --per-channel 80 --json
```

If vault auto-discovery fails:

```bash
node scripts/obsidian_high_recall.mjs query "my query" --vault "/absolute/path/to/your-vault" --json
```

## Backend Choice

- `auto`: prefer Smart Connections vectors when `.smart-env` exists; otherwise use OHS.
- `smart`: use Smart Connections local embeddings plus lexical fallback.
- `ohs`: use `obsidian-hybrid-search` hybrid/fulltext search.
- `both`: union Smart and OHS results; best recall, slower.

Recommended operating mode:

- Daily use: `--backend auto --limit 120`
- High-stakes recall: `--backend both --limit 200`
- Benchmarking: compare `smart` vs `ohs` with the evaluator.

## Benchmark Snapshot

This benchmark is a small, private-vault retrieval study intended to test recall behavior, not a universal claim about all Obsidian vaults. Raw note paths, snippets, and gold note identifiers are not published; aggregate metrics and anonymized case-level data are included.

An earlier 3-task pilot is archived in [pilot_smoke_test.md](docs/benchmark/pilot_smoke_test.md); the 8-task benchmark below is the primary result.

**Setting.** The vault snapshot contained 255 Smart Connections files, 6,220 Smart blocks, and 1,478 embedded blocks. The Smart backend used `TaylorAI/bge-micro-v2` embeddings. The OHS backend used `obsidian-hybrid-search` `0.13.16`, `local:Xenova/multilingual-e5-small`, 244 indexed files, and 1,450 chunks. Each run used `limit=80`, `per-channel=30`, `neighbor-seeds=0`, and K values of 10, 20, and 50. Full setting: [settings.json](docs/benchmark/settings.json).

**Data.** The evaluation used 8 manually labeled recall tasks with 53 total gold labels. The query mix was 1 Chinese query, 1 mixed Chinese/English query, and 6 English queries across embodied data, robot demonstrations, world models, spatial perception, tactile manipulation, humanoid robotics, JEPA/world-model notes, and AI productivity tooling.

**Ablations.** Three conditions were evaluated: Smart Connections recall (`smart`), OHS hybrid/fulltext recall (`ohs`), and a deployable reciprocal-rank-fusion union (`rrf-union`) over Smart and OHS result lists. Full aggregate data: [summary_metrics.csv](docs/benchmark/summary_metrics.csv). Case-level anonymized metrics: [case_metrics_at20.csv](docs/benchmark/case_metrics_at20.csv).

**Main result at K=20.**

| condition | Precision@20 | Recall@20 | F1@20 | MRR | mean latency |
|---|---:|---:|---:|---:|---:|
| Smart | 0.20 | 0.61 | 0.30 | 0.68 | 1.40s |
| OHS | 0.19 | 0.55 | 0.28 | 0.25 | 54.84s |
| RRF union | 0.22 | 0.65 | 0.32 | 0.52 | 56.24s |

At K=50, Smart reached the highest mean recall in this run: Smart `0.91`, OHS `0.72`, RRF union `0.85`. RRF union was best at K=20, while Smart was much faster and had stronger first-hit behavior.

![Benchmark summary at K=20](docs/benchmark/figures/summary_at20.png)

![Average recall curve](docs/benchmark/figures/recall_curve.png)

![Recall by task](docs/benchmark/figures/recall_by_case_at20.png)

![Latency by condition](docs/benchmark/figures/latency_by_condition.png)

![Recall heatmap at K=20](docs/benchmark/figures/recall_heatmap_at20.png)

**Limitations.** The gold set is small and manually seeded, so Precision@K is conservative: unlabelled but useful retrieved notes count as false positives. The vault is private and domain-skewed, so these results should be interpreted as a robustness smoke test for this deployment pattern. The practical deployment recommendation is: use Smart/`auto` for daily recall, and use union/OHS only when extra latency is acceptable.

## Evaluate Recall

Create a cases file:

```json
[
  {
    "id": "my-topic",
    "query": "broad natural language query for this topic",
    "gold": [
      "Known-Relevant-Note-Title",
      "folder/or/path-substring"
    ]
  }
]
```

Run:

```bash
node scripts/evaluate_recall.mjs ./obsidian_recall_eval --cases ./cases.json
```

Outputs:

- `raw_runs.json`
- `metrics.json`
- `metrics.csv`

Metrics include Precision@K, Recall@K, F1@K, MRR, gold-note ranks, retrieved count, and latency for `smart` and `ohs`.

## Repository Layout

```text
skills/
  obsidian-high-recall/
    SKILL.md
    agents/openai.yaml
    references/
    scripts/
```

## License

MIT
