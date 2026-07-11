# Support

Use GitHub Issues and Discussions for support.

Choose the most specific issue form:

- Bug report: install, indexing, search, or evaluation failure.
- Tester feedback: fixture run, OS compatibility, or real-vault smoke-test result.
- Benchmark report: aggregate/anonymized recall metrics from a real vault.
- Feature request: workflow gap or proposed capability.

## Quick Help Path

1. Start with the public fixture:

```bash
npm test
```

2. If the fixture passes but your vault fails, open a bug report with:

- operating system
- Node.js version
- Obsidian version
- Smart Connections installed/indexed status
- command used, with vault paths redacted
- redacted error output

3. If the tool works and you want to share results, use the benchmark report issue template.

## Privacy Rules

Do not paste private note paths, vault names, snippets, raw queries, gold labels, tokens, or `raw_runs.json` into public issues or discussions.

If a report requires sensitive details, open a minimal public issue asking for a private reporting path, or use GitHub Security Advisories if enabled.

## Useful Links

- Security model: [SECURITY.md](SECURITY.md)
- Troubleshooting: [docs/troubleshooting.md](docs/troubleshooting.md)
- Contribution guide: [CONTRIBUTING.md](CONTRIBUTING.md)
- Starter issues: [docs/community/starter_issues.md](docs/community/starter_issues.md)
- New issue chooser: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new/choose
- Tester discussion: https://github.com/ToussaintKnight/obsidian-high-recall-skill/discussions/9
- Benchmark reports: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/4
