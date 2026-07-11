# Starter Issue Commands

Use this after local commits are pushed, labels are synced, and `gh auth login -h github.com` succeeds. It converts [starter_issues.md](starter_issues.md) into repeatable GitHub issue creation.

## Dry Run

Print the plan without changing GitHub:

```bash
npm run github:issues
npm run github:issues -- --json
```

## Apply

Create missing starter issues and skip open issues with the same title:

```bash
npm run github:issues -- --apply
```

The script creates issues in `ToussaintKnight/obsidian-high-recall-skill` with:

- the title from each numbered starter issue;
- labels from each `Labels:` line;
- a body copied from the starter issue draft;
- a source footer pointing back to [starter_issues.md](starter_issues.md).

## Privacy Guardrail

The drafts are designed to be privacy-safe. Keep them that way:

- use fixture data or aggregate reports;
- do not include private note paths, snippets, raw queries, vault names, usernames, tokens, or gold labels;
- ask contributors to use `doctor --json` for public diagnostics;
- route sensitive reports through the security advisory path.

## Verification

Before applying:

```bash
npm test
npm run community:check
npm run github:setup -- --json
npm run github:issues -- --json
```

After applying, verify the live repo has at least five starter issues for OS testing, benchmark reports, privacy redaction, OHS diagnostics, and Smart Connections compatibility.
