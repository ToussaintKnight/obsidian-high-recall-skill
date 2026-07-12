# Changelog

All notable public changes are tracked here. This project follows a pragmatic release log: each entry should explain what changed for users, testers, or contributors without exposing private vault data.

## Unreleased

- Added a GitHub CodeQL code-scanning workflow for JavaScript/TypeScript static analysis on pushes, pull requests, and weekly schedules.
- Made the README, install guide, demo walkthrough, and launch copy lead with the no-vault `npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo` path before full fixture validation.
- Added a landscape positioning and reply kit for joining Obsidian, local-first AI, and agent-workflow conversations without overclaiming or requesting private data.
- Added a `demo` CLI command and `npm run demo:query` for one-command public fixture recall output.
- Added a guarded npm registry publish workflow with tag/version checks, privacy gates, and provenance publishing.
- Added a repeatable GitHub launch metrics collector and documentation for baseline, 24-hour, and 7-day channel snapshots.
- Added `docs/llms.txt` and site metadata checks so AI tools can discover the project summary, privacy model, quick start, benchmark context, and feedback paths.
- Added repeatable GitHub Discussion seed drafts and commands for tester calls, install/privacy Q&A, recall wins/misses, and roadmap feedback.
- Added an early-tester conversion path across the README, project page, and marketing kit so launch visitors know how to run the fixture, try a real vault, report results, and star/watch after useful evaluation.
- Added stronger launch-readiness gates for privacy leaks, package contents, installed CLI behavior, documentation links, CI workflow shape, and GitHub Pages metadata.
- Added privacy-safe `doctor --json` diagnostics for bug reports and tester feedback.
- Expanded the public fixture smoke path to cover 5 recall cases across English, Chinese, and mixed Chinese/English queries.
- Expanded CI to run `npm test` on Linux, Windows, and macOS.

## 0.1.0 - 2026-07-05

- Initial public release for local-first high-recall search over Obsidian vaults.
- Added Codex skill and CLI wrappers for `auto`, `smart`, `ohs`, and `both` backend modes.
- Added Smart Connections `.smart-env` reuse, lexical fallback, OHS fallback, and evaluator-derived `rrf-union`.
- Added public fixture vault, smoke evaluator, benchmark figures, architecture diagram, demo GIF, security policy, contribution guide, issue templates, and launch materials.
- Published privacy-safe benchmark reporting guidance with aggregate/anonymized metrics only.
