# Launch Metrics Collection

Use this when posting to Obsidian, PKM, local-first AI, Codex, or Hacker News channels. The goal is to measure serious-user conversion, not just clone traffic.

## Dry Run

Review the metric plan:

```bash
npm run github:metrics
npm run github:metrics -- --json
```

## Collect Snapshot

After `gh auth login -h github.com` succeeds:

```bash
npm run github:metrics -- --collect
```

Archive snapshots locally outside committed docs:

```bash
New-Item -ItemType Directory -Force .tmp | Out-Null
npm run github:metrics -- --collect > .tmp/launch-metrics-YYYY-MM-DD-channel.json
```

Do not commit raw traffic snapshots unless they have been reviewed for privacy and are intentionally public.

## When To Collect

Collect one snapshot immediately before each channel post, one after 24 hours, and one after 7 days.

| Window | Why |
|---|---|
| Baseline | Separates existing repo traffic from the channel. |
| 24h | Shows immediate conversion and setup friction. |
| 7d | Captures slower readers, bookmarks, and follow-up discussion. |

## Included Signals

The script collects:

- stars, forks, watchers;
- open issues and open pull requests;
- discussion and release counts;
- total and unique views from the GitHub traffic API;
- total and unique clones from the GitHub traffic API;
- tester-feedback, benchmark, bug/diagnostics, and community/launch issue counts.

Traffic APIs require repository access. If auth is unavailable or insufficient, record public repo page counts manually and leave private traffic fields as `TBD`.

## Conversion Formulas

Use the same ratios in [../marketing/launch_experiment.md](../marketing/launch_experiment.md):

| Ratio | Formula |
|---|---|
| Star conversion | `new stars / new unique views` |
| Tester conversion | `tester reports / new unique views` |
| Fixture conversion | `fixture reports / post clicks or new unique views` |
| Issue quality | `actionable issues / total issues` |
| Benchmark yield | `benchmark reports / tester reports` |

Clone count is diagnostic, not success. Clone traffic can come from dependency installs, scanners, bots, or agent tooling. Unique views, tester reports, benchmark reports, and useful issues are stronger launch signals.
