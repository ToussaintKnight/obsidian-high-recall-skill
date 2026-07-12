# Launch Experiment Plan

Use this plan to turn launch activity into measured learning instead of scattered posts. The goal is not simply to collect stars; it is to find the channels that produce serious users who can run the fixture, test a real vault, and report useful results.

## Why This Exists

The initial traffic signal was asymmetric: many clone events, almost no human page views, and zero stars. That means install/scanner traffic was not converting into visible human evaluation. This plan measures the human funnel directly.

## Primary Hypothesis

Obsidian users, local-first AI users, and agent-workflow users will care when the hook is framed as:

> Find the notes your AI agent or normal search would otherwise miss, while keeping raw Obsidian notes local.

The first external milestone is 20 serious users, not 600 stars. A serious user is someone who completes at least one of these actions:

- runs the public fixture;
- runs one real-vault query;
- posts a privacy-safe tester report;
- posts an anonymized benchmark report;
- opens a reproducible issue;
- stars or watches after reading the README or project page.

## Channel Order

| Order | Channel | Reason | Post source |
|---:|---|---|---|
| 1 | Obsidian Forum Share & Showcase | Highest fit for vault search and Smart Connections users. | [community_launch_posts.md](community_launch_posts.md) |
| 2 | Obsidian/PKM Reddit or Discord | Broader PKM audience after forum wording is tested. | [community_launch_posts.md](community_launch_posts.md) |
| 3 | Local-first AI / agent workflow community | Fits privacy and agent-context framing. | [community_launch_posts.md](community_launch_posts.md) |
| 4 | Personal LinkedIn/X | Builds author signal after the first external thread exists. | [community_launch_posts.md](community_launch_posts.md) |
| 5 | Hacker News | Use only after 2-3 external install reports, so comments can point to real tester data. | [community_launch_posts.md](community_launch_posts.md) |

Post one channel at a time. Wait at least 24 hours before judging early conversion unless the post is clearly inactive.

## Pre-Post Checklist

Run:

```bash
npm test
npm run privacy:scan
npm run site:check
npm run community:check
```

Then verify:

- README first screen still has the pain statement, demo GIF, fixture command, privacy model, and benchmark limitations.
- Project page loads the demo GIF, architecture image, benchmark table, and GitHub CTA.
- GitHub issue chooser shows tester feedback, bug report, benchmark report, and feature request templates.
- `docs/marketing/social_preview.png` is set as the repository social preview.
- Post copy includes the Codespaces no-vault sandbox, public fixture command, and privacy warning.

## Measurement Window

Record a baseline immediately before each post, then collect results after 24 hours and 7 days.

| Metric | Baseline | 24h | 7d | Source |
|---|---:|---:|---:|---|
| Stars | TBD | TBD | TBD | GitHub repo page/API |
| Forks | TBD | TBD | TBD | GitHub repo page/API |
| Watchers | TBD | TBD | TBD | GitHub repo page/API |
| Unique views | TBD | TBD | TBD | GitHub traffic API |
| Total views | TBD | TBD | TBD | GitHub traffic API |
| Unique clones | TBD | TBD | TBD | GitHub traffic API |
| Fixture reports | TBD | TBD | TBD | issues/discussions |
| Real-vault tester reports | TBD | TBD | TBD | issues/discussions |
| Benchmark reports | TBD | TBD | TBD | benchmark-report issues |
| Actionable issues | TBD | TBD | TBD | issue labels |

If GitHub auth is available, collect traffic with:

```bash
npm run github:metrics -- --collect
```

Details are in [../metrics/collection.md](../metrics/collection.md). If auth is unavailable, record the public repo page counts and leave private traffic fields as `TBD`.

## Conversion Metrics

Use these ratios after each channel:

| Ratio | Formula | Interpretation |
|---|---|---|
| Star conversion | `new stars / new unique views` | Did the repo page convince readers? |
| Tester conversion | `tester reports / new unique views` | Did readers become useful early users? |
| Fixture conversion | `fixture reports / post clicks or new unique views` | Did the quickstart feel low-friction? |
| Codespaces conversion | `Codespaces opens or reports / post clicks or new unique views` | Did the browser sandbox reduce first-run friction? |
| Issue quality | `actionable issues / total issues` | Did the channel produce useful feedback? |
| Benchmark yield | `benchmark reports / tester reports` | Did advanced users trust the reporting path? |

Do not over-optimize for clone count. Clone traffic can come from automation, dependency installs, and scanners. Unique views, tester reports, and benchmark reports are stronger signals of human adoption.

## Decision Rules

- Continue a channel if it produces at least one serious user, one actionable issue, or clear qualitative interest.
- Revise copy if views rise but stars/tester reports stay flat.
- Improve onboarding if readers ask setup questions already covered by docs.
- Delay Hacker News if there are no external install reports yet.
- Open follow-up issues for repeated friction instead of trying to answer every problem in the launch post.

## After-Action Template

Copy this block below the tracking table in [community_launch_posts.md](community_launch_posts.md) after each post.

```markdown
### Channel After-Action: <channel>

- Post URL:
- Date:
- Baseline stars / 24h / 7d:
- Baseline unique views / 24h / 7d:
- Fixture reports:
- Real-vault tester reports:
- Benchmark reports:
- Actionable issues opened:
- Main objections:
- What to change before the next channel:
```

## Related Files

- Baseline metrics: [../metrics/launch_baseline.md](../metrics/launch_baseline.md)
- Metrics collection: [../metrics/collection.md](../metrics/collection.md)
- Copy-ready launch posts: [community_launch_posts.md](community_launch_posts.md)
- Landscape positioning and reply kit: [landscape_positioning.md](landscape_positioning.md)
- Launch playbook: [../LAUNCH.md](../LAUNCH.md)
- Repository setup checklist: [../community/repository_setup.md](../community/repository_setup.md)
- External contribution strategy: [../community/external_contribution_strategy.md](../community/external_contribution_strategy.md)
