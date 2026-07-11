# Launch Playbook

The first distribution goal is not 600 stars. It is 20 serious users who can install the tool, run a query on a real vault, and report whether it found notes they would have missed.

## Positioning

Use this one-liner:

> Local-first high-recall search for Obsidian vaults, designed for AI agents and researchers who cannot afford to miss relevant notes.

Avoid leading with "Codex skill" outside Codex communities. The larger audience is Obsidian users, researchers, PKM users, and local-first AI users.

## Launch Checklist

- README first screen explains the user pain and 30-second demo.
- Demo GIF is visible in the README and uses only public fixture data.
- Social preview card exists at `docs/marketing/social_preview.png`; use it for GitHub social preview and community posts.
- `npm test` passes on the public fixture vault.
- `npm run privacy:scan` passes before release or launch posts are updated.
- `SECURITY.md` explains the privacy model.
- `CONTRIBUTING.md` and issue templates are present.
- A v0.1.0 GitHub release exists with the fixture demo command.
- At least 5 starter issues are open for OS testing, docs, benchmark reports, and Smart Connections compatibility.

## Current Public Launch Links

- Release: https://github.com/ToussaintKnight/obsidian-high-recall-skill/releases/tag/v0.1.0
- Share page: https://toussaintknight.github.io/obsidian-high-recall-skill/
- Tester discussion: https://github.com/ToussaintKnight/obsidian-high-recall-skill/discussions/9
- Windows install test: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/1
- Linux install test: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/2
- macOS install test: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/3
- Benchmark reports: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/4
- Privacy redaction tests: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/5
- OHS first-run diagnostics: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/6
- Smart Connections compatibility: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/7
- Obsidian Forum launch task: https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/8

Full copy-ready launch posts are in [marketing/community_launch_posts.md](marketing/community_launch_posts.md).

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

Demo GIF: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/demo/fixture_demo.gif

Try the public fixture first:

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

## What To Measure

- GitHub views, not only clones.
- Install success rate on Windows/macOS/Linux.
- Number of users who run the fixture benchmark.
- Number of anonymized benchmark reports.
- Issues that reveal real compatibility gaps.

Baseline metrics are recorded in [metrics/launch_baseline.md](metrics/launch_baseline.md). External collaboration strategy is recorded in [community/external_contribution_strategy.md](community/external_contribution_strategy.md).
