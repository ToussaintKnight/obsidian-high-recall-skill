# Public Fixture Vault

The fixture vault is intentionally small and public. It is not a quality benchmark for real vaults; it exists to make install, CLI behavior, evaluator metrics, and privacy-safe examples reproducible in CI.

`demo_cases.json` covers five recall tasks:

- 3 English queries
- 1 Chinese query
- 1 mixed Chinese/English query

All gold labels point to public fixture notes in `demo-vault/`. Do not replace these files with private notes, private note titles, raw snippets, or real vault paths.
