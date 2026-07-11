# Public Output Examples

These examples show what Obsidian High Recall returns without requiring a private vault. They use the public fixture vault and redact local paths/timestamps.

## Files

- [fixture_query_pack.redacted.json](fixture_query_pack.redacted.json): representative `query --json` recall pack from `docs/fixtures/demo-vault`.
- [doctor_report.fixture.json](doctor_report.fixture.json): representative `doctor --json` diagnostic report from the same fixture vault.

## Reproduce Locally

Run:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI robot demonstrations" --vault docs/fixtures/demo-vault --backend smart --limit 3 --json
```

And:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault docs/fixtures/demo-vault --json
```

The live output will include your local vault/cache paths and current timestamp. The checked-in examples replace those with placeholders.

## Privacy Notes

- The query-pack example has `privacy.safeToShare: false` because real-vault query output can include raw queries, note paths, snippets, note names, and local paths.
- The doctor example has `privacy.safeToShare: true` because it is designed for public diagnostics after manual review.
- Use [output_contract.md](../output_contract.md) for field-level privacy classification.
- Use [fixture_walkthrough.md](../demo/fixture_walkthrough.md) for expected fixture behavior.
