# Obsidian High Recall

Language: [English](README.md) | [中文](README.zh-CN.md)

[![CI](https://github.com/ToussaintKnight/obsidian-high-recall-skill/actions/workflows/ci.yml/badge.svg)](https://github.com/ToussaintKnight/obsidian-high-recall-skill/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Local-first](https://img.shields.io/badge/privacy-local--first-blue.svg)](SECURITY.md)

Local-first high-recall search for Obsidian vaults, usable from Codex and CLI.

Project page: https://toussaintknight.github.io/obsidian-high-recall-skill/

When your vault has thousands of notes, normal search and agent memory can miss the one note that matters. This project intentionally favors recall over precision: it would rather return extra context than silently miss a relevant note.

It reuses Smart Connections vectors when available, falls back to `obsidian-hybrid-search`, and can merge both result sets for maximum recall.

## Who It Is For

- Researchers, engineers, founders, and analysts with large local Obsidian vaults.
- Codex/CLI workflows that need broad context before planning, writing, coding, or summarizing.
- Privacy-sensitive work where raw notes, snippets, queries, and labels should stay local.

It is not trying to replace Obsidian's native UI or Smart Connections. It is a portable recall layer that reuses local indexes when available, adds fallback/union retrieval, and returns agent-ready context packs. More detail: [docs/positioning.md](docs/positioning.md).

## 30-Second Demo

![Fixture demo: install, test, query, recall pack](docs/demo/fixture_demo.gif)

Run the public fixture benchmark without any private vault:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm test
```

The fixture smoke test uses public notes only and covers 5 recall cases: 3 English, 1 Chinese, and 1 mixed Chinese/English.

Query the fixture vault directly:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI robot demonstrations" --vault docs/fixtures/demo-vault --backend smart --limit 10
```

Use it on your own vault:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "robot foundation model demonstration data" --vault "/absolute/path/to/your-vault" --backend auto --limit 120 --json
```

## What It Does

- Auto-discovers the active Obsidian vault from Obsidian app config.
- Reads Smart Connections `.smart-env` vectors when the plugin has indexed the vault.
- Keeps a lexical fallback so fixture and no-vector cases are still testable.
- Falls back to `obsidian-hybrid-search` through `npx`.
- Supports `auto`, `smart`, `ohs`, and `both` backends.
- Returns broad recall packs with snippets, channels, scores, ranks, and JSON output.
- Provides a privacy-safe `doctor --json` report for bug reports and tester feedback.
- Stores derived indexes and runtime packages outside the vault.

## Install

### CLI From GitHub

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "data collection for embodied AI" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

If your environment does not support GitHub-backed `npx`, clone the repo and use the local `node` commands shown above.

### Codex Skill

Ask Codex:

```text
Use $skill-installer to install https://github.com/ToussaintKnight/obsidian-high-recall-skill/tree/main/skills/obsidian-high-recall
```

Restart Codex after installation.

### Manual Skill Install

Windows PowerShell:

```powershell
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item ".\obsidian-high-recall-skill\skills\obsidian-high-recall" "$env:USERPROFILE\.codex\skills\" -Recurse
```

Restart Codex after installation.

## Requirements

- Node.js 20+.
- Obsidian vault stored on local disk.
- Optional but recommended: Obsidian Smart Connections plugin, fully indexed.
- Optional fallback: network access for first-time `npx obsidian-hybrid-search` and model/package downloads.

The tool does not intentionally upload vault contents. See [SECURITY.md](SECURITY.md) for the privacy model and reporting process.

## Backend Choice

- `auto`: prefer Smart Connections vectors when `.smart-env` exists; otherwise use OHS.
- `smart`: use Smart Connections local embeddings plus lexical fallback.
- `ohs`: use `obsidian-hybrid-search` hybrid/fulltext search.
- `both`: union Smart and OHS results; best recall, slower.

Recommended operating mode:

- Daily use: `--backend auto --limit 120`
- High-stakes recall: `--backend both --limit 200`
- Benchmarking: compare `smart`, `ohs`, and `rrf-union` with the evaluator.

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
node scripts/obsidian_high_recall.mjs doctor --vault "/absolute/path/to/your-vault" --json
node scripts/obsidian_high_recall.mjs status
node scripts/obsidian_high_recall.mjs query "data collection for embodied AI" --backend auto --limit 120 --json
node scripts/obsidian_high_recall.mjs query "robot teleoperation demonstrations" --backend both --limit 200 --per-channel 80 --json
```

If vault auto-discovery fails:

```bash
node scripts/obsidian_high_recall.mjs query "my query" --vault "/absolute/path/to/your-vault" --json
```

## Architecture

The architecture shows the local-first retrieval flow, backend routing, privacy boundary, and public benchmark publishing path.

![Architecture option B: Archify-generated diagram](docs/architecture/architecture_option_b_archify.png)

Alternative direct diagram and editable Archify source are in [docs/architecture](docs/architecture/README.md).

## Benchmark Snapshot

This benchmark is a small, private-vault retrieval study intended to test recall behavior, not a universal claim about all Obsidian vaults. Raw note paths, snippets, and gold note identifiers are not published; aggregate metrics and anonymized case-level data are included.

An earlier 3-task pilot is archived in [pilot_smoke_test.md](docs/benchmark/pilot_smoke_test.md); the 16-task benchmark below is the primary result.

**Setting.** The vault snapshot contained 255 Smart Connections files, 6,220 Smart blocks, and 1,478 embedded blocks. The Smart backend used `TaylorAI/bge-micro-v2` embeddings. The OHS backend used `obsidian-hybrid-search` `0.13.16`, `local:Xenova/multilingual-e5-small`, 244 indexed files, and 1,450 chunks. Each run used `limit=80`, `per-channel=30`, `neighbor-seeds=0`, and K values of 10, 20, and 50. Full setting: [settings.json](docs/benchmark/settings.json).

**Data.** The evaluation used 16 manually labeled recall tasks with 95 total gold labels. The query mix was 6 Chinese queries, 6 English queries, and 4 mixed Chinese/English queries across embodied data, robot demonstrations, world models, spatial/3D perception, tactile manipulation, humanoid robotics, JEPA/world-model notes, AI productivity tooling, robot companion use cases, Physical AI startups, simulation data engines, agent skills, and biosignal dexterity.

**Ablations.** Three conditions were evaluated: Smart Connections recall (`smart`), OHS hybrid/fulltext recall (`ohs`), and a deployable reciprocal-rank-fusion union (`rrf-union`) over Smart and OHS result lists. Full aggregate data: [summary_metrics.csv](docs/benchmark/summary_metrics.csv). Case-level anonymized metrics: [case_metrics_at20.csv](docs/benchmark/case_metrics_at20.csv).

**Main result at K=20.**

| condition | Precision@20 | Recall@20 | F1@20 | MRR | mean latency |
|---|---:|---:|---:|---:|---:|
| Smart | 0.17 | 0.57 | 0.26 | 0.65 | 1.00s |
| OHS | 0.17 | 0.55 | 0.25 | 0.24 | 49.54s |
| RRF union | 0.18 | 0.61 | 0.28 | 0.61 | 50.54s |

At K=20, RRF union had the highest mean Recall and F1, while Smart was roughly 50x faster and kept the strongest first-hit behavior. At K=50, Smart reached the highest mean recall in this expanded run: Smart `0.87`, OHS `0.73`, RRF union `0.82`. The practical tradeoff is clear: use Smart/`auto` for fast daily recall, and use union/OHS when the extra latency is acceptable.

**Parameter sensitivity.** The fixed operating point above is not assumed optimal. A Smart-only sensitivity grid swept `per-channel ∈ {10,30,60,100}` and `neighbor-seeds ∈ {0,10,25,50}` with `limit=120`, then scored K=10/20/50/80/120. Full grid data: [sensitivity_smart_grid.csv](docs/benchmark/sensitivity_smart_grid.csv). The primary plot uses the collapsed K by per-channel table in [sensitivity_smart_collapsed.csv](docs/benchmark/sensitivity_smart_collapsed.csv); settings and the no-op diagnostic are in [sensitivity_settings.json](docs/benchmark/sensitivity_settings.json).

`neighbor-seeds` produced identical rankings in this Smart-only run: max observed range across `neighbor-seeds` was `0.0` for Precision, Recall, F1, MRR, retrieved count, and result count. This is expected for the current wrapper path because `neighbor-seeds` only adds graph neighbors when merged results expose links/backlinks; the Smart-only channel results in this snapshot did not change the graph-neighbor candidate set. The main sensitivity figure therefore collapses over `neighbor-seeds` and treats it as a diagnostic control, not a meaningful optimization axis.

At K=50, the default `per-channel=30` reached the highest mean Recall (`0.87`), but `per-channel=10` was close (`0.85`) with better F1 (`0.25` vs `0.20`), better Precision (`0.145` vs `0.112`), and lower read burden (36 vs 48 returned results). Wider candidate pools were not monotonically better: `per-channel=60/100` lowered Recall@50 to `0.79/0.81` while returning 85/116 results. Increasing K to 120 recovered Recall to `0.96` for `per-channel=60/100`, but Precision fell to `0.068/0.050`.

![Benchmark summary at K=20](docs/benchmark/figures/summary_at20.png)

![Backend tradeoff at K=20](docs/benchmark/figures/backend_tradeoff_at20.png)

![Recall by query language](docs/benchmark/figures/language_recall_at20.png)

![Average recall curve](docs/benchmark/figures/recall_curve.png)

![Recall by task](docs/benchmark/figures/recall_by_case_at20.png)

![Latency by condition](docs/benchmark/figures/latency_by_condition.png)

![Recall heatmap at K=20](docs/benchmark/figures/recall_heatmap_at20.png)

![Smart sensitivity K by per-channel tradeoff matrix](docs/benchmark/figures/sensitivity_tradeoff_matrix_at50.png)

![Smart read-budget tradeoff curves](docs/benchmark/figures/sensitivity_k_tradeoff_curves.png)

![Smart recall vs read burden](docs/benchmark/figures/sensitivity_read_burden_pareto_at50.png)

**Limitations.** The gold set is still small and manually seeded, so Precision@K is conservative: unlabelled but useful retrieved notes count as false positives. The vault is private and domain-skewed, so these results should be interpreted as a robustness smoke test for this deployment pattern, not a universal benchmark for all Obsidian vaults.

## Evaluate Recall

Run the public fixture smoke test:

```bash
npm run smoke:fixture
```

CI also runs a deterministic RRF union smoke test without requiring OHS downloads:

```bash
npm run rrf:check
```

Create a cases file for your own vault:

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
node skills/obsidian-high-recall/scripts/evaluate_recall.mjs ./obsidian_recall_eval --vault "/absolute/path/to/your-vault" --cases ./cases.json --backends smart,ohs,rrf-union --ks 10,20,50
```

Outputs:

- `raw_runs.json`
- `metrics.json`
- `metrics.csv`

Metrics include Precision@K, Recall@K, F1@K, MRR, gold-note ranks, retrieved count, and latency for `smart`, `ohs`, and evaluator-derived `rrf-union`.

## Share Anonymous Benchmark Reports

Real-vault reports are useful when they stay privacy-safe. If you try this on your own vault, share aggregate metrics through the [benchmark report issue template](https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new?template=benchmark_report.yml). Do not publish raw runs, private cases files, note paths, snippets, raw queries, vault names, or gold labels.

See [docs/benchmark/reporting_guide.md](docs/benchmark/reporting_guide.md) for the exact safe report shape.

## Repository Layout

```text
.github/
  ISSUE_TEMPLATE/
docs/
  architecture/
  benchmark/
  fixtures/
skills/
  obsidian-high-recall/
    SKILL.md
    agents/openai.yaml
    references/
    scripts/
```

## Community And Project Health

- Security and privacy model: [SECURITY.md](SECURITY.md)
- CI matrix: Linux, Windows, and macOS run `npm test`
- Privacy leak gate: `npm run privacy:scan`
- Privacy threat model: [docs/privacy_threat_model.md](docs/privacy_threat_model.md), `npm run privacy:docs`
- Documentation link gate: `npm run docs:links`
- Changelog and release notes: [CHANGELOG.md](CHANGELOG.md), `npm run release:check`
- Support: [SUPPORT.md](SUPPORT.md)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Issue templates and tester feedback: [new issue chooser](https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new/choose)
- Starter issue playbook: [docs/community/starter_issues.md](docs/community/starter_issues.md)
- Repository setup checklist: [docs/community/repository_setup.md](docs/community/repository_setup.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- Roadmap: [ROADMAP.md](ROADMAP.md)
- Launch playbook: [docs/LAUNCH.md](docs/LAUNCH.md)
- Marketing kit: [docs/marketing](docs/marketing/README.md)
- Share page: [docs/index.html](docs/index.html)
- Positioning and fit: [docs/positioning.md](docs/positioning.md)
- Anonymous benchmark reporting guide: [docs/benchmark/reporting_guide.md](docs/benchmark/reporting_guide.md)
- Launch baseline: [docs/metrics/launch_baseline.md](docs/metrics/launch_baseline.md)
- External contribution strategy: [docs/community/external_contribution_strategy.md](docs/community/external_contribution_strategy.md)
- GitHub labels manifest: [.github/labels.yml](.github/labels.yml)
- Community file gate: `npm run community:check`
- Public fixture vault: [docs/fixtures/demo-vault](docs/fixtures/demo-vault)
- Citation metadata: [CITATION.cff](CITATION.cff)

## License

MIT
