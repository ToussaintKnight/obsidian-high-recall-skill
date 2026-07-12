# Maintenance Playbook

Use this playbook to keep the project visibly maintained after launch. The goal is to protect local-first privacy, keep install paths working, and turn tester feedback into small reproducible fixes.

## Weekly Loop

1. Check GitHub Actions on `main` and recent pull requests.
2. Review Dependabot PRs for npm and GitHub Actions updates.
3. Triage new issues with the closest existing label from [.github/labels.yml](../../.github/labels.yml).
4. Convert repeated tester failures into fixture cases, troubleshooting docs, or small CLI diagnostics.
5. Update [docs/metrics/launch_baseline.md](../metrics/launch_baseline.md) when launch-channel metrics change.

## Dependency Updates

Dependabot is configured in [.github/dependabot.yml](../../.github/dependabot.yml) for:

- npm package and lockfile updates.
- GitHub Actions updates.

Before merging dependency PRs, run:

```bash
npm test
npm run privacy:scan
npm run demo:check
```

For updates that affect retrieval behavior, also run:

```bash
npm run rrf:check
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI robot demonstrations" --vault docs/fixtures/demo-vault --backend smart --limit 10 --json
```

Do not commit npm caches, model caches, OHS databases, `.smart-env`, real-vault outputs, `raw_runs.json`, or local cases files.

## Release Updates

For any user-visible behavior or packaging change:

1. Update `CHANGELOG.md`.
2. Update or add `docs/releases/vX.Y.Z.md`.
3. Run `npm run release:check`.
4. Run `npm test`.
5. Confirm the fixture walkthrough still matches the stable public output facts in [docs/demo/fixture_walkthrough.md](../demo/fixture_walkthrough.md).

Keep v0.1.x focused on install reliability, privacy safety, fixture reproducibility, and tester feedback. Defer larger backend changes until they can be evaluated against public fixture cases and private aggregate reports.

## Issue Triage

Use these labels consistently:

- `tester-feedback`: install, fixture, or real-vault smoke reports.
- `benchmark`: aggregate recall metrics or methodology.
- `privacy` or `security`: leak risk, redaction, advisories, dependency risk.
- `compatibility`: OS, Node.js, Obsidian, Smart Connections, or OHS version problems.
- `dependencies`: Dependabot, package, lockfile, or GitHub Actions updates.
- `good first issue`: public-fixture-only tasks with no private data required.
- `help wanted`: tasks where outside OS, vault, backend, or community feedback is explicitly useful.
- `question`: non-bug setup or usage questions; redirect broad Q&A to Discussions when possible.

Close or redirect reports that require private note content in public. Ask the reporter to use privacy-safe `doctor --json`, synthetic examples, public fixture reproduction, or GitHub Security Advisories for sensitive details.

## Security And Privacy Maintenance

- Keep `SECURITY.md` and [privacy_threat_model.md](../privacy_threat_model.md) aligned.
- Treat local paths, vault names, note titles, snippets, raw queries, gold labels, usernames, and tokens as sensitive.
- If a real credential is ever exposed, rotate/revoke it first; history rewrite is not enough.
- If a private note path, snippet, or gold label lands in git history, rewrite the public repo history before broader launch.

## Launch Maintenance

Before each external launch post:

```bash
npm test
npm run community:check
npm run site:check
```

Then verify the live GitHub repo has:

- Issues enabled.
- Discussions enabled.
- Security advisories enabled.
- GitHub Pages configured.
- Labels synced from `.github/labels.yml`.
- At least five live starter issues open for OS testing, benchmark reports, privacy redaction, OHS diagnostics, and Smart Connections compatibility.
