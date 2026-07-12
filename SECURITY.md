# Security Policy

Obsidian High Recall is designed as a local-first tool for private Obsidian vaults. The default workflow reads Markdown notes from a local vault and writes derived runtime data outside the vault.

## Privacy Model

- The tool does not intentionally upload note contents, snippets, paths, queries, or benchmark labels.
- Smart Connections data is read from the local `.smart-env` cache when present.
- OHS fallback uses `obsidian-hybrid-search` through `npx` and stores its local database outside the vault.
- The Smart backend may download local inference packages and model files on first use. After dependencies are available, retrieval and embedding inference run locally.
- Benchmark outputs such as `raw_runs.json`, local cases files, and private labels are ignored by git and should not be committed.
- CI runs `npm run privacy:scan`, a conservative check for tracked private artifacts, local user paths, and token-like values in public text files.

## Threat Model

The main risks are accidental disclosure through logs, screenshots, benchmark artifacts, issue reports, or pull requests. Treat vault paths, note titles, snippets, private queries, and gold labels as sensitive unless they come from the public fixture vault in `docs/fixtures/demo-vault`.

This project does not claim to sandbox third-party npm packages, Hugging Face model downloads, Obsidian plugins, or the local operating system. Review dependency behavior before using the tool with highly sensitive vaults.

The public-artifact privacy scan is a guardrail, not a proof of confidentiality. Maintainers should still manually review benchmark outputs, screenshots, release notes, and marketing assets before publishing them.

## Reporting A Vulnerability

For sensitive reports, use GitHub Security Advisories if enabled for the repository. If that is unavailable, open a minimal public issue without private note content, paths, snippets, tokens, or secrets, and ask for a private maintainer contact path.

For non-sensitive bugs, use the bug report issue template.
