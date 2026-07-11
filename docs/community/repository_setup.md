# Repository Setup

Use this checklist after authentication is restored and the local commits are pushed. It keeps the GitHub-facing surface aligned with the repo files, launch copy, and starter issue flow.

## About Box

- Description: `Local-first high-recall search for Obsidian vaults, usable from Codex and CLI.`
- Website: `https://toussaintknight.github.io/obsidian-high-recall-skill/`
- Topics:
  - `obsidian`
  - `local-first`
  - `search`
  - `rag`
  - `pkm`
  - `codex`
  - `smart-connections`
  - `ai-agents`
  - `retrieval`
  - `semantic-search`

## Social Preview

Set the GitHub social preview image to:

```text
docs/marketing/social_preview.png
```

The same image is used by the GitHub Pages Open Graph metadata. Regenerate it with:

```bash
npm run social:card
npm run site:check
```

## AI Discovery

The GitHub Pages site publishes an AI-readable project summary at:

```text
https://toussaintknight.github.io/obsidian-high-recall-skill/llms.txt
```

Keep [../llms.txt](../llms.txt) aligned with README positioning, privacy guardrails, benchmark limitations, and tester feedback links.

## Labels

The source of truth is [.github/labels.yml](../../.github/labels.yml). It covers every label used by issue templates and the starter issue playbook.

After `gh auth login -h github.com`, generate or apply the repeatable setup commands:

```bash
npm run github:setup
node scripts/github_setup_commands.mjs
npm run github:setup -- --apply
```

Details are in [github_setup_commands.md](github_setup_commands.md). At minimum, the live repo should have:

- `bug`
- `enhancement`
- `documentation`
- `good first issue`
- `tester-feedback`
- `benchmark`
- `privacy`
- `security`
- `dependencies`
- `windows`
- `macos`
- `linux`
- `smart-connections`
- `compatibility`
- `research`
- `ohs`
- `diagnostics`
- `community`
- `launch`

## Features To Enable

- Issues: enabled.
- Discussions: enabled for tester coordination.
- GitHub Pages: enabled from `main` / `docs` or the already configured Pages source.
- Security advisories: enabled for private privacy/security reports.
- Releases: keep `v0.1.0` visible and update release notes when package behavior changes.
- Dependabot: configured by [.github/dependabot.yml](../../.github/dependabot.yml) for npm and GitHub Actions updates.

## Starter Issues

Starter issue drafts live in [starter_issues.md](starter_issues.md). After labels are synced, create missing live issues with:

```bash
npm run github:issues
npm run github:issues -- --json
npm run github:issues -- --apply
```

Details are in [starter_issue_commands.md](starter_issue_commands.md).

## Discussions

Discussion seeds live in [discussion_seeds.md](discussion_seeds.md). After Discussions are enabled, create missing seed threads with:

```bash
npm run github:discussions
npm run github:discussions -- --json
npm run github:discussions -- --apply
```

Details are in [discussion_commands.md](discussion_commands.md). The live repo should have threads for tester calls, install/privacy Q&A, qualitative recall wins/misses, and roadmap feedback.

## Release

Release notes live in [../releases/v0.1.0.md](../releases/v0.1.0.md). After commits are pushed and CI is green, publish or inspect the GitHub release with:

```bash
npm run github:release
npm run github:release -- --json
npm run github:release -- --apply
```

Details are in [../releases/publish_release.md](../releases/publish_release.md).

## Maintenance

The maintenance source of truth is [maintenance.md](maintenance.md). It defines the weekly CI, Dependabot, issue triage, release, and privacy/security loop.

Before merging dependency or maintenance PRs:

```bash
npm test
npm run privacy:scan
npm run community:check
```

## Launch Sanity Check

Before posting externally:

```bash
npm test
npm run community:check
npm run site:check
npm run github:setup -- --json
npm run github:issues -- --json
npm run github:discussions -- --json
```

Then confirm:

- README badge links resolve.
- The issue chooser shows bug, benchmark, feature, and tester feedback forms.
- The issue chooser links to the compatibility matrix.
- The tester discussion link opens.
- The seeded Discussions cover tester calls, Q&A, recall wins/misses, and roadmap feedback.
- The release page links to the fixture demo command.
- The share page hero, demo GIF, architecture image, and benchmark figures load.
