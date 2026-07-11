# Fixture Walkthrough

This walkthrough shows what a successful first run looks like using only the public fixture vault in `docs/fixtures/demo-vault`. It is safe to share because the notes, queries, and gold labels are synthetic public data.

## Run The Fixture Smoke Test

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm test
```

Expected stable result:

```text
Fixture smoke passed: 5 cases have Recall@10 > 0.
```

This means the public evaluator found at least one relevant public fixture note for each recall case. Runtime values and latency numbers can vary by machine.

## Run One Public Query

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI robot demonstrations" --vault docs/fixtures/demo-vault --backend smart --limit 10 --json
```

Expected stable facts:

- `backend.selected` should be `smart`.
- `backend.primary` can be `lexical-fallback` on the fixture vault because the public fixture does not include a Smart Connections `.smart-env` cache.
- `channels` should include `lexical`.
- The first result should be `Embodied AI Data Collection`.
- The output can also include adjacent public fixture notes such as `World Models and Simulation` and `Agent Memory Search`.

Example redacted shape:

```json
{
  "backend": {
    "selected": "smart",
    "primary": "lexical-fallback"
  },
  "channels": [
    {
      "channel": "lexical",
      "count": 3
    }
  ],
  "results": [
    {
      "path": "Embodied AI Data Collection.md",
      "title": "Embodied AI Data Collection",
      "channels": ["lexical"],
      "matchedBy": ["lexical"]
    },
    {
      "path": "World Models and Simulation.md",
      "title": "World Models and Simulation"
    },
    {
      "path": "Agent Memory Search.md",
      "title": "Agent Memory Search"
    }
  ]
}
```

The real JSON also includes local `vault` and `db` paths, timestamps, snippets, expansions, and scores. Do not paste real-vault JSON into public issues without redacting local paths, snippets, raw queries, note names, vault names, and usernames.

## Interpret The Fixture Metrics

The public fixture has five recall cases:

- 3 English queries.
- 1 Chinese query.
- 1 mixed Chinese/English query.

The fixture is not a quality benchmark for real vaults. It checks that install, CLI wiring, evaluator metrics, JSON output, and privacy-safe examples work. For real retrieval quality, use private cases locally and share only aggregate metrics through the [benchmark reporting guide](../benchmark/reporting_guide.md).

## If The Fixture Fails

Run:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs detect --vault docs/fixtures/demo-vault
```

Then check [troubleshooting.md](../troubleshooting.md). If you open an issue, include your OS, Node.js version, the exact fixture command, and redacted error output. Do not include private vault content.
