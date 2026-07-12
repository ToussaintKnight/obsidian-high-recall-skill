# Community Launch Posts

Use these drafts when posting outside GitHub. Lead with the project page, not the implementation details. The goal is to convert human readers into fixture runs, real-vault tests, benchmark reports, and stars/watchers.

Project page:

https://toussaintknight.github.io/obsidian-high-recall-skill/

Repository:

https://github.com/ToussaintKnight/obsidian-high-recall-skill

Testing guide:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/testing_guide.md

Usage recipes:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/recipes.md

FAQ:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/faq.md

Output examples:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/examples/README.md

Tester discussion:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/discussions/9

Codespaces no-vault sandbox:

https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

## Launch Sequence

Use [launch_experiment.md](launch_experiment.md) to record baseline metrics, 24-hour results, 7-day results, conversion ratios, and after-action notes for each channel.

1. Obsidian Forum Share & Showcase.
2. Obsidian-focused Reddit or PKM community.
3. AI-agent / local-first tooling community.
4. Personal LinkedIn/X post.
5. Hacker News only after the first 2-3 external testers confirm install success.

Post one channel at a time so traffic and stars can be attributed. Record before/after counts in the tracking table below.

## Obsidian Forum

Title:

```text
Local-first high-recall search for large Obsidian vaults
```

Body:

~~~markdown
I built Obsidian High Recall for a problem I keep hitting: once a vault gets large, normal search and AI-agent memory can miss the note that actually matters.

Project page:
https://toussaintknight.github.io/obsidian-high-recall-skill/

Repo:
https://github.com/ToussaintKnight/obsidian-high-recall-skill

Testing guide:
https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/testing_guide.md

Usage recipes:
https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/recipes.md

FAQ:
https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/faq.md

Output examples:
https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/examples/README.md

Browser sandbox:
https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

It is a local-first recall-first search wrapper. It reuses Smart Connections vectors when available, falls back to local hybrid/fulltext search, and can merge both result sets when recall matters more than latency.

Privacy model:
- raw notes stay local,
- private queries stay local,
- private snippets and gold labels stay local,
- public benchmark artifacts are aggregate/anonymized only.

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

Then try one broad real-vault query:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

I am looking for testers across Windows/macOS/Linux, different vault sizes, and different Smart Connections states. If it works for you, a star/watch on GitHub helps others discover it. If it fails, please open an issue with OS, Node version, Obsidian version, and whether Smart Connections is installed/indexed. Please do not share private note paths, snippets, raw queries, vault names, or gold labels.
~~~

## Reddit / PKM

Title options:

```text
I built a local-first high-recall search tool for large Obsidian vaults
```

```text
Obsidian High Recall: find notes your AI agent would otherwise miss
```

Body:

~~~markdown
I released a small local-first tool for large Obsidian vaults:

https://toussaintknight.github.io/obsidian-high-recall-skill/

Browser sandbox:
https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

The problem: when a vault gets large, normal search and agent memory can miss relevant notes. This tool intentionally favors recall over precision. It reuses Smart Connections vectors when available, falls back to local hybrid/fulltext search, and returns broad context packs for Codex or CLI workflows.

Safe no-vault demo:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

Full fixture validation:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm test
```

Privacy: raw notes, private queries, snippets, and labels stay local. Published benchmark data is aggregate/anonymized.

I am looking for install reports and real-vault recall feedback. If it helps, a GitHub star/watch is useful social proof; if it breaks, please open an issue with your OS/Node/Obsidian/Smart Connections setup.
~~~

## Hacker News

Use after at least a few external install reports.

Title:

```text
Show HN: Local-first high-recall search for Obsidian vaults
```

Body:

~~~markdown
I built Obsidian High Recall, a local-first recall-first search wrapper for large Obsidian vaults:

https://toussaintknight.github.io/obsidian-high-recall-skill/

Browser sandbox:
https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

It reuses Smart Connections vectors when available, falls back to local hybrid/fulltext search, and returns broad context packs for agent/CLI workflows. The goal is not perfect precision; it is avoiding silent misses when a relevant note exists somewhere in a large private vault.

There is a safe no-vault demo and a public fixture vault so people can inspect output, then test install/evaluator behavior without sharing private notes:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

Full validation:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm test
```

Privacy model: raw notes, private queries, snippets, and gold labels stay local. Public benchmark artifacts are aggregate/anonymized only.
~~~

## Short Social Post

```text
I released Obsidian High Recall: local-first high-recall search for large Obsidian vaults.

It reuses Smart Connections vectors when available, falls back locally, includes a public fixture benchmark, and keeps raw notes/private queries local.

Looking for testers:
https://toussaintknight.github.io/obsidian-high-recall-skill/

Browser sandbox:
https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1
```

## Follow-Up Reply

Use this when someone asks what feedback is useful:

```text
The most useful report is:
- OS and Node version
- Obsidian version
- whether Smart Connections is installed and fully indexed
- approximate vault size
- whether `npm test` passed
- whether the ten-minute testing guide was clear
- whether one broad real-vault query found notes you would otherwise have missed

Please do not share private note paths, snippets, raw queries, vault names, or gold labels.
```

## Tracking Table

| Channel | Post URL | Date | Stars before | Stars after 24h | Unique views before | Unique views after 24h | Notes |
|---|---|---:|---:|---:|---:|---:|---|
| Obsidian Forum | TBD | TBD | 0 | TBD | TBD | TBD | First serious-user channel |
| Reddit / PKM | TBD | TBD | TBD | TBD | TBD | TBD | Post after forum response |
| Codex GitHub Discussions | https://github.com/openai/codex/discussions/31169 | 2026-07-05 | 0 | TBD | 1 | TBD | Show-and-Tell tester call for local-first vault recall |
| Codex Obsidian feature request | https://github.com/openai/codex/issues/18294#issuecomment-4886301723 | 2026-07-05 | 0 | TBD | 1 | TBD | Prior-art comment on first-class Obsidian integration request |
| HN | TBD | TBD | TBD | TBD | TBD | TBD | Use after first install reports |
