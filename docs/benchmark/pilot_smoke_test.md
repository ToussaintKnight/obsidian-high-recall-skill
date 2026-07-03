# Pilot Smoke Test

This table archives the earlier pilot evaluation used during initial development. It used 3 manually labeled recall tasks and an earlier vault/index snapshot. The expanded 8-task benchmark in the root README is the primary result and supersedes this pilot for headline claims.

Only aggregate metrics are included here. Raw note paths, snippets, and gold note identifiers are intentionally excluded.

| K | backend | Precision | Recall | F1 | MRR | latency |
|---:|---|---:|---:|---:|---:|---:|
| 10 | smart | 0.400 | 0.514 | 0.447 | 0.733 | 0.94s |
| 10 | ohs | 0.333 | 0.419 | 0.369 | 0.611 | 48.98s |
| 20 | smart | 0.200 | 0.514 | 0.286 | 0.733 | 0.94s |
| 20 | ohs | 0.267 | 0.662 | 0.378 | 0.611 | 48.98s |
| 50 | smart | 0.155 | 0.919 | 0.265 | 0.733 | 0.94s |
| 50 | ohs | 0.135 | 0.838 | 0.232 | 0.611 | 48.98s |

