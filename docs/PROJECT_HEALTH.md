# Project Health

This page records the public-repository readiness state for maintainers, contributors, and agents. It is not a popularity score; it tracks whether the project is understandable, installable, testable, safe to discuss, and ready for outside users.

Machine-readable snapshot: [project_health.yml](project_health.yml).

## Current Verdict

Status: launch-ready, early adoption.

The repository now has the core trust and adoption surfaces expected from a serious open-source project: README quickstart, fixture demo, package manifest, CI, security policy, contribution guide, issue templates, release notes, roadmap, launch materials, and a public fixture benchmark.

The remaining risk is distribution and real-world validation. More human testers are needed across operating systems, vault sizes, Obsidian versions, Smart Connections cache layouts, and OHS first-run conditions.

## Strengths

- Clear first-screen positioning around local-first, recall-first Obsidian search.
- Public fixture vault and `npm test` path that do not require private notes.
- Privacy and security policy for private-vault workflows.
- Reproducible evaluator with `smart`, `ohs`, and evaluator-derived `rrf-union`.
- CI runs syntax, privacy, and fixture smoke checks.
- Starter issues and templates route testers toward privacy-safe reports.
- Launch kit, share page, release notes, and external contribution strategy are documented.

## Remaining Gaps

- More real user reports are needed before making broad quality claims.
- OS compatibility still depends on tester reports for Windows, macOS, and Linux.
- Smart Connections cache compatibility should be documented across plugin versions.
- OHS first-run latency and dependency download behavior need clearer diagnostics.
- Privacy scanner is conservative and should grow with new artifact types as the benchmark workflow evolves.

## Verification

Maintainers should run:

```bash
npm test
```

This currently covers:

- JavaScript syntax checks.
- Public-artifact privacy scan.
- Fixture-vault evaluator smoke test.
- Fixture metric assertion.

For release prep, also inspect generated docs and images manually, then verify that no private vault paths, snippets, queries, gold labels, or local usernames are included.

## Launch Funnel

Track adoption by funnel quality, not stars alone:

1. Human GitHub views.
2. Fixture test runs.
3. Clean install reports.
4. Real-vault tester comments.
5. Privacy-safe benchmark reports.
6. Compatibility issues with useful environment details.
7. Stars, forks, citations, and external mentions from the right audience.

