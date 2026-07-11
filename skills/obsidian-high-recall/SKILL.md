---
name: obsidian-high-recall
description: High-recall semantic and hybrid retrieval over a local Obsidian vault for Codex. Use when the user asks Codex to search, recall, index, mine, summarize, or build research/context packs from Obsidian notes, especially when recall matters more than precision, queries are vague or bilingual, or Smart Connections / semantic search / vault memory is mentioned.
---

# Obsidian High Recall

## Quick Start

Use the bundled wrapper first:

```bash
cd <path-to-this-skill>
node scripts/obsidian_high_recall.mjs query "embodied AI data collection" --limit 120
```

The script auto-discovers the active Obsidian vault from Obsidian's app config and stores derived index data outside the vault. With `--backend auto`, it prefers Smart Connections vectors when `.smart-env` is present and falls back to `obsidian-hybrid-search`.

## Workflow

1. Run `doctor` for privacy-safe setup diagnostics or user bug reports:

```bash
node scripts/obsidian_high_recall.mjs doctor --json
```

`doctor` does not print local paths, snippets, queries, or note names. Use `status` only when the user needs operational index details locally.

2. Run `status` before important work:

```bash
node scripts/obsidian_high_recall.mjs status
```

3. Reindex when the vault changed materially or the index is empty:

```bash
node scripts/obsidian_high_recall.mjs reindex --force
```

4. Query with a broad natural-language prompt. Prefer `--json` when another script or agent will consume the result:

```bash
node scripts/obsidian_high_recall.mjs query "robot foundation model demonstrations and teleoperation data" --limit 200 --json
```

Use `--profile deep` only when the user explicitly wants maximum recall and can tolerate slower execution. The default `quick` profile uses Smart Connections vector search when available, or one hybrid recall call plus one fulltext safety-net call through OHS; deep adds semantic, title, tag-filtered, and more granular fan-out calls.

## Evaluation

Run the bundled smoke evaluation when comparing backends:

```bash
node scripts/evaluate_recall.mjs ./obsidian_recall_eval
node scripts/evaluate_recall.mjs ./obsidian_recall_eval --cases ./references/eval_cases.example.json --backends smart,ohs,rrf-union
```

The evaluator writes `raw_runs.json`, `metrics.json`, and `metrics.csv` with Precision@K, Recall@K, F1@K, MRR, ranks, and latency for `smart`, `ohs`, and evaluator-derived `rrf-union`. Pass `--vault`, `--cases`, `--backends`, `--ks`, `--limit`, `--per-channel`, and `--neighbor-seeds` for real vault-specific benchmarks.

## Recall Policy

- Optimize for union recall, not ranking precision.
- Treat semantic, hybrid, fulltext, title, tag-filter, and graph-neighbor matches as complementary evidence.
- Keep weak/adjacent results in the recall pack unless the user explicitly asks for a clean shortlist.
- Use snippets and anchors as evidence, then open/read promising notes directly before making strong claims.
- If Smart Connections files are detected, use the wrapper's `smart` or `auto` backend for fast vector recall. Use `--backend both` when maximum union recall matters more than latency.

## Backend Notes

- Default backend: `auto`, preferring Smart Connections vectors and falling back to `obsidian-hybrid-search`.
- Smart backend observed model: `TaylorAI/bge-micro-v2`.
- Default model observed during setup: `local:Xenova/multilingual-e5-small`.
- Default DB location: `%LOCALAPPDATA%/Codex/obsidian-high-recall/<vault-hash>.db`.
- The wrapper sets `OBSIDIAN_VAULT_PATH`; pass `--vault <path>` to override.
- Read `references/backend.md` only when changing backend behavior or debugging index/search failures.
