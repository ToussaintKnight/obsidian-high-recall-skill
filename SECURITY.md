# Security Policy

Obsidian High Recall is designed as a local-first tool for private Obsidian vaults. The default workflow reads Markdown notes from a local vault and writes derived runtime data outside the vault.

## Privacy Model

- The tool does not intentionally upload note contents, snippets, paths, queries, or benchmark labels.
- Smart Connections data is read from the local `.smart-env` cache when present.
- OHS fallback uses `obsidian-hybrid-search` through `npx` and stores its local database outside the vault.
- The Smart backend may download local inference packages and model files on first use. After dependencies are available, retrieval and embedding inference run locally.
- Benchmark outputs such as `raw_runs.json`, local cases files, and private labels are ignored by git and should not be committed.
- CI runs `npm run privacy:scan` to block public-file leaks such as local absolute paths, common API tokens, `raw_runs.json`, and local cases files.
- GitHub CodeQL runs on pushes, pull requests, and a weekly schedule to provide JavaScript/TypeScript code scanning for the CLI and repository scripts.
- OpenSSF Scorecard runs on pushes and a weekly schedule to publish supply-chain security posture results and SARIF findings for repository practices.
- GitHub Actions checkout steps use `persist-credentials: false` so workflow jobs do not retain a push-capable repository token after checkout.

For the full data classification, network behavior, leak scenarios, and safe-sharing checklist, see [docs/privacy_threat_model.md](docs/privacy_threat_model.md). For runtime downloads, cache paths, and dependency review steps, see [docs/dependency_inventory.md](docs/dependency_inventory.md).

## Threat Model

The main risks are accidental disclosure through logs, screenshots, benchmark artifacts, issue reports, or pull requests. Treat vault paths, note titles, snippets, private queries, and gold labels as sensitive unless they come from the public fixture vault in `docs/fixtures/demo-vault`.

This project does not claim to sandbox third-party npm packages, Hugging Face model downloads, Obsidian plugins, or the local operating system. Review dependency behavior before using the tool with highly sensitive vaults.

## Local Privacy Check

Run this before opening a pull request:

```bash
npm run privacy:scan
```

The scan checks tracked and unignored public candidate files, including binary metadata where ASCII strings are visible. It is a guardrail, not a substitute for reviewing screenshots, copied logs, release notes, and benchmark reports before publishing them.

To verify that privacy documentation and public safety links stay present, run:

```bash
npm run privacy:docs
```

GitHub code scanning is configured in `.github/workflows/codeql.yml`, and OpenSSF Scorecard is configured in `.github/workflows/scorecard.yml`. These are public-repository guardrails for code quality and supply-chain posture; they do not inspect private vault contents and do not replace `npm run privacy:scan`.

## Reporting A Vulnerability

For sensitive reports, use [GitHub Security Advisories private vulnerability reporting](https://github.com/ToussaintKnight/obsidian-high-recall-skill/security/advisories/new). If that is unavailable, open a minimal public issue without private note content, paths, snippets, tokens, or secrets, and ask for a private maintainer contact path.

Please do not publicly disclose a vulnerability before the maintainer has had a reasonable chance to investigate and ship a fix. The target response window is an initial acknowledgement within 7 days and a public disclosure note after a fix or mitigation is available.

For non-sensitive bugs, use the bug report issue template.
