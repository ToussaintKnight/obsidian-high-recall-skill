# Positioning

Obsidian High Recall is for people who use Obsidian as a long-running research memory and need an agent or CLI to retrieve broad context without silently missing relevant notes.

For a reader-facing decision guide, see [comparison.md](comparison.md).

## Best Fit

- Researchers, PhD students, engineers, founders, and analysts with large local vaults.
- Agent workflows where Codex needs a recall pack before writing, planning, coding, or summarizing.
- Private-vault work where raw notes should stay local.
- High-recall tasks where extra reading burden is acceptable.
- Benchmark-minded users who want to compare Smart Connections, OHS, and RRF union on their own vault.

## Not The Best Fit

- Small vaults where normal Obsidian search already works.
- Tasks that require a polished Obsidian-native chat UI.
- Workflows where precision matters more than recall.
- Users who cannot run Node.js locally.
- Teams that need hosted multi-user search with centralized access control.

## How It Relates To Existing Tools

| Tool or path | Good at | Where this project fits |
|---|---|---|
| Obsidian built-in search | Exact text lookup inside Obsidian | Adds broad recall packs for agent/CLI workflows. |
| Smart Connections | Local semantic index and Obsidian-native AI workflows | Reuses its local vectors when available and exposes high-recall retrieval to Codex/CLI. |
| obsidian-hybrid-search | Hybrid/fulltext local retrieval | Uses it as a fallback or union channel when extra latency is acceptable. |
| General RAG scripts | Custom retrieval pipelines | Provides a portable Codex skill, fixture test, privacy policy, and benchmark workflow. |

## Default Recommendation

Start with:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Use `--backend both --limit 200` only when missing a note is costlier than reading extra results and waiting longer.

If you try it on a real vault, share aggregate-only results with the benchmark report template. Do not share raw snippets, private note paths, vault names, raw queries, or gold labels.
