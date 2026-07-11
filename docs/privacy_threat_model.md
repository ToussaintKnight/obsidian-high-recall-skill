# Privacy Threat Model

This project is built for private Obsidian vaults. The goal is to make recall better without turning private notes into public benchmark artifacts, support logs, screenshots, or issue comments.

## Data Classes

| Data | Sensitivity | Public policy |
|---|---|---|
| Markdown note contents and snippets | Private | Never publish unless copied from the public fixture vault. |
| Note paths, note titles, vault names, and local usernames | Private | Redact before issues, screenshots, docs, and benchmark reports. |
| Raw queries and private gold labels | Private | Keep local; publish only broad topic summaries if needed. |
| Smart Connections `.smart-env` files | Private derived index | Keep local and do not attach to issues. |
| OHS local database and derived runtime indexes | Private derived index | Keep local and rebuild instead of sharing. |
| `raw_runs.json`, `metrics.json`, `metrics.csv`, and local cases files | Private by default | Do not commit or upload unless manually anonymized into aggregate docs. |
| Public fixture vault and fixture cases | Public | Safe for docs, CI, screenshots, and demos. |
| Aggregate/anonymized benchmark tables and figures | Public after review | Safe only after note identifiers, snippets, paths, raw queries, and labels are removed. |

## Local Data Flow

1. The CLI resolves an Obsidian vault from `--vault`, `OBSIDIAN_VAULT_PATH`, or Obsidian app config.
2. The Smart backend reads local Markdown and local Smart Connections data when available.
3. The OHS backend runs `obsidian-hybrid-search` locally and stores a local database outside the vault.
4. Query results can include snippets, ranks, scores, channels, and note anchors. Treat recall packs as private unless they use the public fixture vault.
5. Evaluation writes local run artifacts. Treat the whole output directory as private until manually anonymized.

## Network Behavior

The wrapper does not intentionally upload vault contents, note snippets, paths, queries, or labels.

Network access can still happen for setup and dependency resolution:

- GitHub-backed `npx` may download this package.
- OHS fallback can download `obsidian-hybrid-search` and model/runtime packages on first use.
- Smart/OHS embedding paths may download local inference packages or model files on first use.

These downloads are dependency-fetching events, not intentional vault-content uploads. The project does not sandbox third-party packages, package managers, Hugging Face model downloads, Obsidian plugins, or the local operating system. Users with highly sensitive vaults should review dependencies and run in a controlled environment.

The concrete runtime download points, cache locations, and review checklist are documented in [dependency_inventory.md](dependency_inventory.md).

## Main Leak Scenarios

- A local benchmark output such as `raw_runs.json`, `metrics.json`, `metrics.csv`, or `cases.local.json` is committed.
- A screenshot or issue comment includes a note title, path, snippet, raw query, vault name, or local username.
- A recall pack is copied into a public discussion without redaction.
- A support log exposes an absolute local path or token.
- A public benchmark table keeps private case ids or note identifiers.
- A generated figure or PNG metadata contains local file paths.

## Controls In This Repo

- `.gitignore` excludes common local run artifacts and private cases files.
- `npm run privacy:scan` checks public candidate files for local paths, common API tokens, private artifact filenames, and blocked local output filenames.
- `doctor --json` is designed for support reports and avoids local paths, snippets, queries, and note names.
- Issue templates and the PR template warn contributors not to paste private note data.
- The public fixture vault supports demos, tests, screenshots, and reproduction without private data.
- Published benchmark docs use aggregate/anonymized metrics only.
- `npm run dependency:check` keeps [dependency_inventory.md](dependency_inventory.md) linked from the main privacy docs.

## Safe Sharing Checklist

Before posting an issue, pull request, benchmark report, screenshot, or launch asset:

```bash
npm run privacy:scan
```

Then manually confirm:

- no private note paths, note titles, note snippets, raw queries, vault names, local usernames, tokens, or private labels;
- no `raw_runs.json`, `metrics.json`, `metrics.csv`, `cases.local.json`, or `eval_cases.local.json`;
- any benchmark table is aggregate or anonymized;
- screenshots use the public fixture vault or synthetic content;
- `doctor --json` output is used instead of raw logs when possible.

## Out Of Scope

This project does not guarantee:

- sandboxing of npm, model, or Obsidian plugin code;
- protection from malware or compromised dependencies;
- encrypted local indexes;
- safe publication of arbitrary recall packs;
- correctness of redaction performed outside this repository.

Use the tool on vaults whose local execution risk matches your environment.
