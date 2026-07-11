# Compatibility Matrix

This page tracks what has been validated publicly and what still needs tester reports. It separates CI fixture coverage from real-vault coverage because the public fixture proves package wiring, while real vaults prove Obsidian, Smart Connections, OHS, and private-note workflows.

## Status Labels

| Status | Meaning |
|---|---|
| `CI fixture pass` | GitHub Actions or local public fixture test passes without private vault data. |
| `Tester pass` | A public tester reported success with privacy-safe details. |
| `Partial` | Core command works, but one backend, OS path, or first-run path needs follow-up. |
| `Needs report` | No privacy-safe public report is available yet. |
| `Blocked` | A known issue prevents use in this environment. |

## Public Compatibility Matrix

| Environment | Fixture `npm test` | CLI query fixture | `doctor --json` real vault | Smart backend real vault | OHS backend real vault | Notes |
|---|---|---|---|---|---|---|
| Windows, Node 20+ | `CI fixture pass` | `CI fixture pass` | `Needs report` | `Needs report` | `Needs report` | Need clean Windows tester reports with Smart indexed and not indexed. |
| macOS, Node 20+ | `CI fixture pass` | `CI fixture pass` | `Needs report` | `Needs report` | `Needs report` | Need path quoting and Obsidian config discovery reports. |
| Linux desktop, Node 20+ | `CI fixture pass` | `CI fixture pass` | `Needs report` | `Needs report` | `Needs report` | Need distro, shell, and OHS first-run reports. |
| WSL, Node 20+ | `Needs report` | `Needs report` | `Needs report` | `Needs report` | `Needs report` | Useful if vault path crosses Windows/Linux boundaries. |
| Codex skill install | `Needs report` | `Needs report` | `Needs report` | `Needs report` | `Needs report` | Need reports from `$skill-installer` and manual skill install paths. |

## Backend Compatibility Notes

| Backend | Expected support | What testers should check |
|---|---|---|
| `smart` | Works fastest when Smart Connections `.smart-env` vectors exist; fixture can use lexical fallback. | Whether `doctor --json` reports embedded Smart sources/blocks and whether `query --backend smart` returns useful context. |
| `ohs` | Works when first-run package/model downloads and local OHS index creation succeed. | Whether `status`, `reindex`, and `query --backend ohs` complete; report only redacted errors. |
| `auto` | Uses Smart when vectors exist, otherwise OHS fallback. | Whether backend selection matches the user's Smart index state. |
| `both` | Highest-recall union path, with higher latency and more returned context. | Whether the extra recall is worth latency/noise on broad real-vault queries. |

## How To Add A Report

1. Start with [install.md](install.md).
2. Run the public fixture from [testing_guide.md](testing_guide.md).
3. Run `doctor --json` on your vault and manually confirm it contains no private paths, note names, snippets, raw queries, vault names, usernames, tokens, or gold labels.
4. Open a [tester feedback issue](https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new?template=tester_feedback.yml).
5. Include operating system, Node.js version, Obsidian version, Smart Connections indexed/not indexed, backend used, fixture pass/fail, and qualitative real-vault outcome.

Do not attach `query --json` recall packs from a real vault. The output contract marks them as `privacy.safeToShare: false`.

## Maintainer Update Rules

- Keep this page conservative: do not mark `Tester pass` without a public, privacy-safe report.
- Link issue numbers in the notes column once reports exist.
- Use broad vault size buckets only.
- If a report exposes private data, remove the private details before linking or summarizing it.
- Re-run `npm run community:check`, `npm run docs:links`, and `npm run privacy:scan` after editing this page.
