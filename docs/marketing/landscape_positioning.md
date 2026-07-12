# Landscape Positioning And Reply Kit

Use this when joining existing Obsidian, local-first AI, PKM, and agent-workflow discussions. The goal is to enter useful conversations without overclaiming, duplicating a launch post, or asking people to expose private notes.

## Purpose

Obsidian High Recall should be framed as a complementary recall layer:

> It helps agents and humans find local Obsidian notes that normal search or agent memory might miss, while keeping raw notes, snippets, labels, and private queries local.

Do not present it as a replacement for Obsidian, Smart Connections, or vault-native agent clients. Those tools own the in-app experience. This project owns a portable high-recall context pack for CLI/Codex workflows and privacy-safe evaluation.

## Adjacent Conversations

| Conversation | What people already care about | Useful angle for Obsidian High Recall |
|---|---|---|
| Obsidian agent hosts and plugins | Running agents inside the vault, command palette actions, session export, vault references, WSL or terminal integration. | "This can sit before the agent step as a recall-first local context pack, especially when missing a relevant note is worse than reading extra results." |
| Research and exploration agents | Broad exploration across notes, web, and tools; multi-agent synthesis; cost and token control. | "Use high-recall local note retrieval before synthesis so the agent starts from private memory instead of only web or current-context evidence." |
| Smart Connections and semantic search users | Reusing a local semantic index, avoiding another plugin, improving recall on broad queries. | "This reuses Smart Connections vectors when available, then adds a CLI/Codex bridge, obsidian-hybrid-search fallback, union ranking, and recall-oriented evaluation." |
| Local-first AI and privacy RAG | Keeping private data on device, understanding what leaves the machine, reproducible privacy claims. | "Raw notes stay local; public artifacts are fixture outputs, anonymized aggregate metrics, doctor reports, and docs." |
| Codex and terminal-agent workflows | Getting enough context before planning, coding, writing, or summarizing from private notes. | "Run one broad recall query, inspect the returned pack, then let the agent work with better context." |

## Reply Principles

- Lead with the user's pain: missed notes in a large vault, not Codex internals.
- Acknowledge the host project's value before mentioning this repo.
- State the complementary role: high-recall local note recall, not a replacement UI.
- Prefer the Codespaces link when a browser-based no-vault trial is easier than asking someone to install locally.
- Include one safe test command, preferably `npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo` for a no-vault fixture demo.
- Point advanced users to `npm test` before real-vault testing.
- Ask for privacy-safe setup reports, not raw note content.
- Do not ask for raw notes, snippets, private queries, vault names, note paths, usernames, tokens, or gold labels.
- Measure each external reply with `npm run github:metrics -- --collect` and the tracking table in [community_launch_posts.md](community_launch_posts.md).

## Copy-Ready Replies

### Obsidian Plugin Or Agent-Host Thread

This is a useful direction: bringing agents closer to the vault removes a lot of context-switching.

One complementary piece I have been working on is high-recall local retrieval before the agent acts. Obsidian High Recall is not an Obsidian UI replacement; it produces a local recall pack from a vault, reuses Smart Connections vectors when available, and falls back to local search when needed.

Safe fixture demo:

https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

Repo: https://github.com/ToussaintKnight/obsidian-high-recall-skill

I am looking for privacy-safe reports about OS, Node version, Obsidian version, Smart Connections indexed/not indexed, and whether broad recall found notes normal search missed. Please do not share private note snippets, paths, vault names, or raw queries.

### Smart Connections Search Thread

Smart Connections is already the best local semantic layer for many Obsidian users. The gap I wanted to cover is agent/CLI reuse: when Codex or another terminal workflow needs broad context, it should be able to reuse the local Smart index instead of building a separate search system.

Obsidian High Recall uses Smart Connections vectors when available, adds local fallback/union retrieval, and returns a ranked JSON context pack. The goal is recall first, precision second.

Try the public fixture first:

https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

Then, if it looks useful, run one broad real-vault query locally and report only setup/result metadata, not private notes.

### Local-First AI Or Privacy RAG Thread

The main design constraint here is that raw Obsidian notes should remain local. The public repo includes fixture data, redacted examples, anonymized benchmark summaries, and privacy-safe doctor reports, but not raw private snippets or note paths.

For people building local-first agent workflows, this project is a recall-first preflight step: retrieve a broad local context pack before the model writes, plans, or summarizes.

Safe fixture demo:

https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

Threat model and privacy docs: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/privacy_threat_model.md

### Codex Or CLI Agent Memory Thread

For Codex-style workflows, the useful unit is often a context pack rather than a chat UI. Obsidian High Recall takes a broad local query, searches the vault with Smart/OHS/fallback channels, dedupes and ranks hits, then returns a JSON pack the agent can inspect before acting.

Safe fixture demo:

https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo
```

For a real vault, start with the testing guide and keep reports privacy-safe: OS, Node version, backend, pass/fail, and qualitative recall behavior only.

### Benchmark Or Evaluation Thread

The benchmark is intentionally modest: small manually labelled recall tasks, private vault data excluded, aggregate/anonymized metrics published. Precision is conservative because useful but unlabelled notes count as false positives.

The public value is not a universal Obsidian benchmark. It is a repeatable evaluation path for high-recall local search:

```bash
npm test
```

For real-vault reports, please use the benchmark-report template and avoid raw note names, snippets, paths, private queries, or gold labels.

## Search Prompts For Finding Threads

Use these prompts to find relevant conversations. Prefer replying where the topic is already active and the project is genuinely relevant.

```text
site:forum.obsidian.md agent Obsidian vault AI
site:forum.obsidian.md Smart Connections search recall
site:github.com/openai/codex Obsidian vault
site:reddit.com/r/ObsidianMD local AI search vault
site:reddit.com/r/LocalLLaMA Obsidian local-first RAG
```

## Do Not Do

- Do not claim this replaces Smart Connections, Obsidian search, or vault-native agent clients.
- Do not post the private-vault benchmark headline without caveats about small sample size, private domain skew, and conservative precision.
- Do not ask users to share raw notes, snippets, private queries, vault names, note paths, usernames, tokens, or gold labels.
- Do not optimize for clones. Ask for tester reports, benchmark reports, actionable issues, and stars/watch only after useful evaluation.
- Do not drop the same launch post into unrelated threads. Tailor replies to the host discussion.

## Measure After Each Reply

Before replying, record the baseline if GitHub auth is available:

```bash
npm run github:metrics -- --collect
```

After 24 hours and 7 days, record:

- new GitHub views;
- stars/watch changes;
- fixture demo reports;
- real-vault tester reports;
- benchmark reports;
- actionable issues;
- whether the thread produced a better phrase, objection, or docs gap.

Track the result in [community_launch_posts.md](community_launch_posts.md) and use [launch_experiment.md](launch_experiment.md) for conversion ratios.
