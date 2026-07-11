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

## Labels

The source of truth is [.github/labels.yml](../../.github/labels.yml). It covers every label used by issue templates and the starter issue playbook.

After `gh auth login -h github.com`, sync labels manually or with a label-sync tool. A simple manual path is:

```bash
gh label list --repo ToussaintKnight/obsidian-high-recall-skill
```

Then create or update labels to match `.github/labels.yml`. At minimum, the live repo should have:

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
```

Then confirm:

- README badge links resolve.
- The issue chooser shows bug, benchmark, feature, and tester feedback forms.
- The issue chooser links to the compatibility matrix.
- The tester discussion link opens.
- The release page links to the fixture demo command.
- The share page hero, demo GIF, architecture image, and benchmark figures load.
