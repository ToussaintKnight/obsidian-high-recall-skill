# Discussion Seeds

Use these drafts to seed GitHub Discussions after Discussions are enabled. Discussions are for coordination, questions, and qualitative learning; issues remain the place for actionable bugs, compatibility reports, and benchmark reports.

Do not paste private note paths, snippets, raw queries, vault names, usernames, tokens, or gold labels in any public discussion.

## 1. Tester Call: Real Vault Smoke Reports

Category: General

I am looking for early testers who can run the public fixture and then try one broad query on a real local Obsidian vault.

Start here:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm test
```

Then follow the testing guide:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/testing_guide.md

Useful feedback:

- OS and Node.js version;
- Obsidian version;
- Smart Connections installed/indexed/not installed;
- approximate vault size bucket;
- whether the fixture passed;
- whether one real-vault query found notes you would otherwise have missed.

Privacy guardrail: do not share private note names, snippets, raw queries, local paths, vault names, or gold labels. Use `doctor --json` only when `privacy.safeToShare` is true.

## 2. Q&A: Install, Backends, And Privacy

Category: Q&A

Use this thread for non-bug questions about installation, backend choice, privacy model, dependency downloads, and expected first-run behavior.

Helpful links:

- Install guide: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/install.md
- FAQ: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/faq.md
- Troubleshooting: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/troubleshooting.md
- Dependency inventory: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/docs/dependency_inventory.md
- Privacy model: https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/SECURITY.md

If your report includes a reproducible failure, open an issue with the bug template instead:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new/choose

Privacy guardrail: ask with fixture paths or placeholders. Do not paste raw private output.

## 3. Share: Recall Wins And Misses

Category: Show and tell

Use this thread to share whether the tool found useful notes, missed expected notes, or returned too much noise.

Good reports are qualitative and privacy-safe:

- the broad topic area;
- backend used: `auto`, `smart`, `ohs`, or `both`;
- whether Smart Connections was indexed;
- approximate vault size bucket;
- whether the result changed your workflow;
- what kind of false positives were costly.

For aggregate metrics, use the benchmark report issue template instead:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/issues/new?template=benchmark_report.yml

Privacy guardrail: summarize behavior without note titles, snippets, raw queries, local paths, vault names, or labels.

## 4. Roadmap Feedback: What Should Matter For v0.2

Category: Ideas

The near-term goal is 20 serious users, not a feature pile. Please use this thread to help prioritize the next version based on real workflows.

Useful feedback:

- which backend mode should become easiest to run;
- where install/onboarding still feels risky;
- whether Codex skill usage or CLI usage matters more;
- what compatibility cells in `docs/compatibility.md` matter most;
- whether better ranking controls, better summaries, or better diagnostics would unlock adoption.

Roadmap:

https://github.com/ToussaintKnight/obsidian-high-recall-skill/blob/main/ROADMAP.md

Privacy guardrail: describe workflow classes, not private vault contents.
