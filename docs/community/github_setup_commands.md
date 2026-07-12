# GitHub Setup Commands

Use this after local commits are pushed and `gh auth login -h github.com` succeeds. It turns the repository setup checklist into repeatable commands for the GitHub-facing surface that affects discovery and trust.

## Dry Run

Print the commands without changing GitHub:

```bash
npm run github:setup
node scripts/github_setup_commands.mjs
```

Print the structured plan:

```bash
node scripts/github_setup_commands.mjs --json
```

## Apply

After reviewing the dry-run output:

```bash
npm run github:setup -- --apply
```

The apply mode runs:

- `gh auth status`;
- repository About box update for description and website;
- issue, discussion, and wiki feature toggles;
- topic sync from [repository_setup.md](repository_setup.md);
- label create/update from [.github/labels.yml](../../.github/labels.yml).

## Manual Checks Still Required

GitHub does not expose every trust/discovery setting cleanly through the same CLI path. After applying commands, confirm manually:

- social preview image is `docs/marketing/social_preview.png`;
- GitHub Pages serves the `docs/` site;
- security advisories are enabled;
- Code scanning is visible after `.github/workflows/codeql.yml` runs;
- OpenSSF Scorecard badge resolves after `.github/workflows/scorecard.yml` publishes results;
- the `v0.1.0` release is visible;
- issue chooser links and the tester discussion link resolve;
- seeded Discussions exist after running `npm run github:discussions -- --apply`.

## Why This Matters

The original launch critique found almost no human page-view distribution. Repository metadata, topics, labels, discussions, Pages, releases, Code scanning, OpenSSF Scorecard, and social preview are not cosmetic; they help visitors understand whether the project is alive, searchable, and safe to try.

## Verification

Before external launch:

```bash
npm test
npm run community:check
npm run site:check
```

Then check the live repo page against [repository_setup.md](repository_setup.md).
