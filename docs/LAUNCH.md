# Launch Playbook

The first distribution goal is not 600 stars. It is 20 serious users who can install the tool, run a query on a real vault, and report whether it found notes they would have missed.

## Positioning

Use this one-liner:

> Local-first high-recall search for Obsidian vaults, designed for AI agents and researchers who cannot afford to miss relevant notes.

Avoid leading with "Codex skill" outside Codex communities. The larger audience is Obsidian users, researchers, PKM users, and local-first AI users.

## Launch Checklist

- README first screen explains the user pain and 30-second demo.
- FAQ is visible at [faq.md](faq.md) and `npm run faq:check` passes after objection-handling docs change.
- Public output examples are visible at [examples](examples/README.md) and `npm run examples:check` passes after output-example changes.
- Install guide is visible at [install.md](install.md) and `npm run install:check` passes after install/onboarding changes.
- Codespaces no-vault demo path is visible at [codespaces.md](codespaces.md) and `npm run codespaces:check` passes after devcontainer or browser-sandbox onboarding changes.
- Usage recipes are visible at [recipes.md](recipes.md) and `npm run recipes:check` passes after workflow guidance changes.
- Compatibility matrix is visible at [compatibility.md](compatibility.md) and separates CI fixture coverage from real-vault tester reports.
- Demo GIF is visible in the README and uses only public fixture data.
- Fixture walkthrough documents expected output and pass criteria at [demo/fixture_walkthrough.md](demo/fixture_walkthrough.md); `npm run demo:check` passes after demo changes.
- Social preview card exists at `docs/marketing/social_preview.png`; use it for GitHub social preview and community posts.
- Launch experiment plan is visible at [marketing/launch_experiment.md](marketing/launch_experiment.md); `npm run launch:check` passes after channel tracking or outreach-measurement changes.
- Landscape positioning and reply kit is visible at [marketing/landscape_positioning.md](marketing/landscape_positioning.md); use it before replying to existing Obsidian, local-first AI, PKM, or agent-workflow threads.
- Launch metric collection is documented in [metrics/collection.md](metrics/collection.md); use `npm run github:metrics -- --collect` before each channel post, after 24 hours, and after 7 days.
- `npm test` passes on the public fixture vault.
- `npm run rrf:check` passes after evaluator, benchmark, or union-ranking changes.
- `npm run skill:check` passes after `SKILL.md`, `agents/openai.yaml`, bundled references, scripts, or package hooks change.
- `npm run cli:check` passes after CLI option, help output, package bin, or command-reference changes.
- `npm run install:check` passes after install commands, first-run setup, or OS-specific onboarding docs change.
- `npm run recipes:check` passes after usage recipes, copy-paste workflow commands, or scenario guidance changes.
- GitHub Actions runs `npm test` on Linux, Windows, and macOS.
- GitHub CodeQL code scanning is configured at `.github/workflows/codeql.yml` for pushes, pull requests, and weekly static analysis.
- OpenSSF Scorecard is configured at `.github/workflows/scorecard.yml` and visible through the README badge after the public workflow runs.
- GitHub Actions checkout steps set `persist-credentials: false` across CI, CodeQL, Scorecard, and npm publish workflows.
- `npm run privacy:scan` passes before release or launch posts are updated.
- `npm run privacy:docs` passes after [privacy_threat_model.md](privacy_threat_model.md), `SECURITY.md`, README, or launch privacy wording changes.
- `npm run dependency:check` passes after dependency, model-download, runtime-cache, or privacy-link wording changes.
- `npm run docs:links` passes after README, docs, benchmark figures, or marketing pages change.
- `npm run faq:check` passes after privacy, backend, benchmark, installation, or limitation FAQ changes.
- `npm run examples:check` passes after public redacted output examples or example links change.
- `npm run positioning:check` passes after positioning, comparison, launch, or marketing copy changes.
- `npm run site:check` passes after the GitHub Pages share page, social preview card, sitemap, or robots file changes.
- `docs/llms.txt` summarizes the project for AI tools and stays aligned with README positioning, privacy guardrails, benchmark limitations, and tester feedback links.
- `npm run release:check` passes after `package.json`, `CHANGELOG.md`, or release notes change.
- The npm publish workflow exists at `.github/workflows/npm-publish.yml`, requires `NPM_TOKEN`, checks tag/version parity, and runs `npm publish --access public --provenance` only after test/privacy/publish gates pass.
- `npm run community:check` passes after issue template, PR template, support, or starter issue changes.
- `SECURITY.md` explains the privacy model.
- `CONTRIBUTING.md` and issue templates are present.
- A v0.1.0 GitHub release exists with the fixture demo command.
- Repeatable GitHub release commands are in [releases/publish_release.md](releases/publish_release.md).
- Repository metadata and labels follow [community/repository_setup.md](community/repository_setup.md).
- Repeatable GitHub setup commands are in [community/github_setup_commands.md](community/github_setup_commands.md).
- Dependabot and the weekly maintenance loop are documented in [community/maintenance.md](community/maintenance.md).
- Starter issue drafts are maintained in [community/starter_issues.md](community/starter_issues.md), and at least 5 live starter issues are open for OS testing, docs, benchmark reports, and Smart Connections compatibility.
- Repeatable starter issue creation commands are in [community/starter_issue_commands.md](community/starter_issue_commands.md).
- Discussion seed drafts are maintained in [community/discussion_seeds.md](community/discussion_seeds.md), with repeatable creation commands in [community/discussion_commands.md](community/discussion_commands.md).
- Tester onboarding points to [testing_guide.md](testing_guide.md) for the ten-minute fixture, CLI, doctor, and real-vault smoke-test path.
- Compatibility reporting points to [compatibility.md](compatibility.md) so external testers know which OS/backend cells still need reports.

## Current Public Launch Links

- Release: https://github.com/ToussaintKnight/obsidian-high-recall-skill/releases/tag/v0.1.0
- Share page: https://toussaintknight.github.io/obsidian-high-recall-skill/
- Tester discussion: https://github.com/ToussaintKnight/obsidian-high-recall-skill/discussions
- Windows install test: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/1
- Linux install test: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/2
- macOS install test: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/3
- Benchmark reports: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/4
- Privacy redaction tests: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/5
- OHS first-run diagnostics: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/6
- Smart Connections compatibility: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/7
- Obsidian Forum launch task: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/8

Repeatable GitHub release commands are in [releases/publish_release.md](releases/publish_release.md).
Full copy-ready launch posts are in [marketing/community_launch_posts.md](marketing/community_launch_posts.md).
Codespaces no-vault sandbox: https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1
Launch experiment and conversion tracking are in [marketing/launch_experiment.md](marketing/launch_experiment.md).
Landscape positioning and reply templates are in [marketing/landscape_positioning.md](marketing/landscape_positioning.md).
Repeatable GitHub metric collection is documented in [metrics/collection.md](metrics/collection.md).
Repository setup notes are in [community/repository_setup.md](community/repository_setup.md).
Repeatable GitHub setup commands are in [community/github_setup_commands.md](community/github_setup_commands.md).
Copy-ready starter issue drafts are in [community/starter_issues.md](community/starter_issues.md).
Repeatable starter issue creation commands are in [community/starter_issue_commands.md](community/starter_issue_commands.md).
Repeatable discussion seed commands are in [community/discussion_commands.md](community/discussion_commands.md).

## Obsidian Forum Draft

Title:

```text
Local-first high-recall search for Obsidian vaults, usable from Codex and CLI
```

Body:

~~~markdown
I built a small local-first tool for a problem I keep hitting: when an Obsidian vault gets large, AI agents and normal search can miss relevant notes.

Obsidian High Recall favors recall over precision. It reuses Smart Connections vectors when available, falls back to obsidian-hybrid-search, and can merge both result sets. Raw notes, snippets, queries, and private benchmark labels stay local.

Repo: https://github.com/ToussaintKnight/obsidian-high-recall-skill
Project page: https://toussaintknight.github.io/obsidian-high-recall-skill/
Testing guide: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/testing_guide.md

Demo GIF: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/demo/fixture_demo.gif

Try the safe no-vault demo first:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

For full fixture validation:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm test
```

Then run it on your vault:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

I am looking for 5-10 testers with different vault sizes and operating systems. Aggregate benchmark reports are welcome, but please do not share private note paths, snippets, or queries.
~~~

## Channels

- Obsidian Forum: Share & Showcase.
- Local-first AI and PKM communities.
- Codex/agent workflow communities.
- Researcher tooling circles where recall over private notes is a real pain.
- Existing Obsidian, Smart Connections, local-first AI, and agent-workflow threads where a complementary high-recall recall layer is directly relevant.

## What To Measure

- GitHub views, not only clones.
- Install success rate on Windows/macOS/Linux.
- Number of users who run the fixture benchmark.
- Number of anonymized benchmark reports.
- Issues that reveal real compatibility gaps.

Baseline metrics are recorded in [metrics/launch_baseline.md](metrics/launch_baseline.md). External collaboration strategy is recorded in [community/external_contribution_strategy.md](community/external_contribution_strategy.md).
Channel-by-channel conversion rules are recorded in [marketing/launch_experiment.md](marketing/launch_experiment.md).
