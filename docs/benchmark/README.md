# Benchmark Artifacts

This directory contains anonymized aggregate results from a private local Obsidian vault benchmark. Raw snippets, queries, note paths, and gold note identifiers are intentionally excluded.

- `settings.json`: experimental settings and index statistics.
- `summary_metrics.csv`: mean and standard deviation across tasks.
- `case_metrics_at20.csv`: anonymized case-level metrics at K=20.
- `sensitivity_smart_grid.csv`: aggregate Smart parameter grid over K, per-channel, and neighbor-seeds.
- `sensitivity_smart_collapsed.csv`: primary K by per-channel grid, collapsed over neighbor-seeds.
- `sensitivity_smart_at50.csv`: K=50 slice for diagnostic checks.
- `sensitivity_settings.json`: sensitivity experiment settings.
- `pilot_smoke_test.md`: aggregate-only archive of the earlier 3-task pilot.
- `reporting_guide.md`: how external users can share aggregate/anonymized benchmark reports safely.
- `figures/`: PNG figures referenced by the root README files.

The public fixture smoke path uses Smart-only retrieval to avoid network/model downloads in CI. The evaluator-derived `rrf-union` merge logic is covered separately by `npm run rrf:check`, which uses synthetic public data and the same shared RRF module used by `evaluate_recall.mjs`.
