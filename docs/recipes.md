# Usage Recipes

These recipes are copy-paste starting points for common workflows. They use placeholders for private vault paths and queries. Do not publish real-vault JSON recall packs unless you have redacted private paths, snippets, note names, vault names, raw queries, and usernames.

## Choose A Mode

| Need | Start with | Why |
|---|---|---|
| Fast daily recall | `--backend auto --limit 120` | Uses Smart Connections when available, otherwise falls back locally. |
| Maximum recall | `--backend both --limit 200 --per-channel 80` | Merges Smart and OHS results; slower and noisier. |
| Public smoke test | `--backend smart --vault docs/fixtures/demo-vault` | Uses fixture notes only; safe to share. |
| Private benchmark | `obsidian-high-recall-eval` | Produces Precision@K, Recall@K, F1, MRR, and latency. |
| Public issue report | `doctor --json` | Diagnostic path designed to avoid private note contents. |

## Recipe 1: Verify The Public Fixture

Use this before touching a private vault:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm ci
npm test
```

Then run one public query:

```bash
npx --yes . query "data collection for embodied AI robot demonstrations" --vault docs/fixtures/demo-vault --backend smart --limit 10
```

Expected stable fixture facts are documented in [demo/fixture_walkthrough.md](demo/fixture_walkthrough.md).

## Recipe 2: Daily Research Recall

Use this when you want broad context but still care about speed:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Good query shape:

```text
robot foundation model demonstration data teleoperation trajectories
```

Use broad terms, synonyms, and adjacent concepts. The tool is recall-first; it is acceptable if it returns extra context.

## Recipe 3: High-Stakes Recall Sweep

Use this before writing a memo, planning a research direction, or asking an agent to make a decision where missing a relevant note would be costly:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "your broad high-stakes query" --vault "/absolute/path/to/your-vault" --backend both --limit 200 --per-channel 80 --json
```

Review more results than you normally would. `both` can be slower because it merges Smart and OHS channels. The JSON recall pack declares `privacy.safeToShare: false`; keep it local.

## Recipe 4: Codex Preflight Context

After installing the skill, ask Codex for a recall pack before a writing, coding, or planning task:

```text
Use $obsidian-high-recall to find a high-recall pack for "robot foundation model demonstration data and teleoperation trajectories" before drafting the plan.
```

For maximum recall:

```text
Use $obsidian-high-recall with backend both and limit 200 for "world model simulation data engine embodied AI".
```

Use this when Codex should inspect local research memory before answering. Avoid pasting private recall-pack snippets into public chats or issues.

## Recipe 5: Privacy-Safe Bug Report

When something fails, prefer `doctor --json`:

```bash
npx --yes . doctor --vault "/absolute/path/to/your-vault" --json
```

Review the output before posting. It should not contain private paths, snippets, note names, raw queries, vault names, usernames, tokens, or gold labels.

Open a bug or tester feedback issue with:

- operating system and version
- Node.js version
- Obsidian version
- Smart Connections installed/indexed/not installed
- backend used
- whether `npm test` passed
- redacted command and error output

## Recipe 6: Benchmark Your Own Vault

Create a local cases file. Keep it private:

```json
[
  {
    "id": "my-topic",
    "query": "broad natural language query for this topic",
    "gold": ["Known-Relevant-Note-Title"]
  }
]
```

Run:

```bash
node skills/obsidian-high-recall/scripts/evaluate_recall.mjs ./obsidian_recall_eval --vault "/absolute/path/to/your-vault" --cases ./cases.local.json --backends smart,ohs,rrf-union --ks 10,20,50 --limit 80 --per-channel 30 --neighbor-seeds 0
```

Share only aggregate metrics through the benchmark report template. Do not upload `raw_runs.json`, `cases.local.json`, private labels, note paths, snippets, or raw queries.

## Recipe 7: Tune Read Burden

If results are too noisy:

```bash
npx --yes . query "your query" --vault "/absolute/path/to/your-vault" --backend auto --limit 60 --per-channel 30
```

If recall is too low:

```bash
npx --yes . query "your query with synonyms and adjacent terms" --vault "/absolute/path/to/your-vault" --backend both --limit 200 --per-channel 80
```

For systematic tuning, compare Precision@K, Recall@K, F1, MRR, retrieved count, and latency with the evaluator. The benchmark sensitivity notes in the README show why bigger candidate pools are not always better.

## Related References

- Install guide: [install.md](install.md)
- CLI reference: [cli_reference.md](cli_reference.md)
- Output contract: [output_contract.md](output_contract.md)
- Testing guide: [testing_guide.md](testing_guide.md)
- Compatibility matrix: [compatibility.md](compatibility.md)
- Benchmark reporting guide: [benchmark/reporting_guide.md](benchmark/reporting_guide.md)
