# Comparison And Fit

Obsidian High Recall is not a replacement for Obsidian, Smart Connections, or vault-native agent tools. It is a portable recall layer for moments when an agent or CLI needs broad local context and missing a relevant note is worse than reading extra results.

## Short Version

Use this project when:

- You have a large local Obsidian vault.
- You want a Codex/CLI-readable recall pack, not only an Obsidian UI.
- You care more about recall than precision for the current task.
- You want raw notes, snippets, private queries, and labels to stay local.
- You want a public fixture and evaluator before trying the tool on private notes.

Use another path when:

- You only need exact lookup inside Obsidian.
- You want a polished chat UI inside Obsidian.
- Your vault is small enough that native search already finds everything.
- You need hosted, multi-user enterprise search with centralized permissions.

## Tool Relationship

| Path | Primary strength | Limitation for high-recall agent work | How Obsidian High Recall fits |
|---|---|---|---|
| Obsidian built-in search | Fast exact search, syntax search, and interactive vault browsing | Exact search can miss paraphrases, aliases, bilingual phrasing, or loosely related notes | Adds broad recall packs that an agent or CLI can consume before writing, planning, or coding |
| Smart Connections | Local semantic index and Obsidian-native AI workflows | Its best experience is inside Obsidian; external agents still need a reliable bridge and output contract | Reuses Smart Connections vectors when available and returns ranked JSON/context packs |
| obsidian-hybrid-search | Local hybrid/fulltext retrieval and reusable CLI search | Can be slower and is one backend rather than a full workflow with privacy/reporting conventions | Uses OHS as fallback or union channel when extra latency is acceptable |
| Vault-native agent clients | Bring agents into Obsidian and improve interactive workflows | The agent still benefits from a recall-first retrieval step before acting on a broad task | Complements these tools by producing high-recall local context that can be passed to an agent |
| General RAG scripts | Flexible custom retrieval pipelines | Often lack Obsidian-specific setup, fixture tests, privacy policy, and public benchmark/reporting shape | Provides a portable skill, CLI, demo vault, evaluator, privacy model, and contribution workflow |

## Decision Guide

| User need | Recommended path |
|---|---|
| Find one exact note, phrase, or tag while working in Obsidian | Use Obsidian built-in search first |
| Ask an Obsidian-native assistant to work with visible notes | Use your preferred Obsidian AI workflow |
| Give Codex broad local context before planning, writing, coding, or summarizing | Use `--backend auto --limit 120` |
| Run a high-stakes recall pass where missing a note is costly | Use `--backend both --limit 200` and accept more latency |
| Compare retrieval behavior on your own vault | Use `obsidian-high-recall-eval` with private cases and share aggregate-only results |

## Why Recall First

Precision is useful when the user wants a clean shortlist. This project optimizes a different stage: the broad retrieval step before an agent makes a decision. In that stage, a false negative can distort the whole answer, while a false positive usually just adds reading burden.

That tradeoff is visible in the benchmark docs: RRF union can improve mean Recall/F1 at K=20, Smart is much faster and has stronger first-hit behavior, and wider candidate pools can increase read burden without monotonic recall gains. The intended workflow is therefore:

1. Start with fast Smart/`auto` recall for daily work.
2. Use union/OHS when missing a note is more costly than waiting.
3. Read/open promising notes before making strong claims.
4. Share only aggregate benchmark metrics if reporting results publicly.

## Privacy Boundary

The public repository should contain code, fixture data, aggregate metrics, and anonymized figures. It should not contain private vault names, raw note paths, snippets, raw queries, gold labels, run logs, or local database files. See [SECURITY.md](../SECURITY.md), [privacy_threat_model.md](privacy_threat_model.md), and [benchmark/reporting_guide.md](benchmark/reporting_guide.md).
