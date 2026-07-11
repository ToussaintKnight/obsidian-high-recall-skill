# Anonymous Benchmark Reporting Guide

External benchmark reports are useful because this project is intentionally optimized for high recall across real, messy Obsidian vaults. The public fixture proves that the tool runs; anonymized real-vault reports show whether the retrieval behavior generalizes.

Before sharing anything from a private vault, review the safe-sharing checklist in [../privacy_threat_model.md](../privacy_threat_model.md).

## What To Run

Start with the public fixture:

```bash
npm test
```

Then run the evaluator on your own vault with a small private cases file:

```bash
node skills/obsidian-high-recall/scripts/evaluate_recall.mjs ./obsidian_recall_eval --vault "/absolute/path/to/your-vault" --cases ./cases.local.json --backends smart,ohs,rrf-union --ks 10,20,50
```

Use 5-20 recall tasks if possible. Each task should have a broad natural-language query and one or more private gold labels that identify notes you know should be found. Keep the cases file local.

## What To Share

Open a benchmark report issue with aggregate/anonymized data only:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new?template=benchmark_report.yml

Useful fields:

- OS and Node.js version.
- Approximate vault size, rounded to a coarse bucket.
- Whether Smart Connections was installed and fully indexed.
- Backends tested: `smart`, `ohs`, `rrf-union`.
- Settings: `limit`, `per-channel`, `neighbor-seeds`, and K values.
- Aggregate metrics from `metrics.csv`: Precision@K, Recall@K, F1@K, MRR, retrieved count, and latency.
- A short qualitative takeaway: where recall was strong, weak, surprising, or too noisy.

## What Not To Share

Do not upload or paste:

- `raw_runs.json`
- `cases.local.json`
- private note paths
- private note titles
- snippets
- raw queries that reveal private work
- vault names
- gold labels
- screenshots containing private notes

If a result is useful but sensitive, describe it at a category level, such as "robotics project notes" or "meeting notes", rather than using the exact title or path.

## Safe Report Shape

```text
OS: Windows 11
Node: 22.x
Vault size: about 5k-10k markdown files
Smart Connections: installed and indexed
Backends: smart, ohs, rrf-union
Settings: limit=80, per-channel=30, neighbor-seeds=0, ks=10,20,50

Aggregate metrics:
smart K=20: Precision=..., Recall=..., F1=..., MRR=..., mean latency=...
ohs K=20: Precision=..., Recall=..., F1=..., MRR=..., mean latency=...
rrf-union K=20: Precision=..., Recall=..., F1=..., MRR=..., mean latency=...

Takeaway:
Smart was fast and usually found a first relevant note. RRF union improved recall on broad cross-topic queries but added latency and more reading burden.
```

This is enough for project-level evidence without exposing the private vault.
