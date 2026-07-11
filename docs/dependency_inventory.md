# Dependency And Network Inventory

This page documents what Obsidian High Recall depends on, when it may touch the network, and where it writes derived runtime data. It is meant to make the local-first privacy model auditable before a user points the tool at a private vault.

## Summary

- The npm package has no committed runtime dependencies in `package.json` or `package-lock.json`.
- The wrapper itself uses Node.js built-in modules.
- Optional backends can trigger first-run package/model downloads.
- Raw notes, snippets, note paths, queries, and labels are not intentionally uploaded by this wrapper.
- Third-party package managers, npm packages, model downloads, Obsidian plugins, and the local operating system are not sandboxed by this project.

## Direct Package Dependencies

| Component | Declared where | Network at install? | Notes |
|---|---|---:|---|
| Node.js built-ins | source code imports | no | `node:child_process`, `node:fs`, `node:path`, `node:os`, and related built-ins. |
| npm package dependencies | `package.json` / `package-lock.json` | no committed deps | The published package currently ships scripts, docs, fixtures, and skill files without third-party dependencies declared in `package.json`. |

## Runtime Download Points

| Trigger | Command/path | What may be downloaded | Where it goes | Avoidance path |
|---|---|---|---|---|
| GitHub-backed run | `npx --yes github:ToussaintKnight/obsidian-high-recall-skill ...` | this package from GitHub | npm cache | Clone the repo and run `node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs ...`. |
| OHS fallback | `--backend ohs`, `--backend both`, or `--backend auto` when Smart vectors are missing | `obsidian-hybrid-search` plus its runtime/model dependencies | npm cache and OHS local DB path | Use `--backend smart` for fixture/no-download smoke tests, or preinstall/cache OHS in a controlled environment. |
| Smart vector search | `--backend smart` or `auto` when Smart vectors exist and embeddings are needed | `@huggingface/transformers@4.2.0` and model files for `TaylorAI/bge-micro-v2` | runtime dir and `hf-cache` under the local cache path | Run fixture `--backend smart` without `.smart-env` for lexical fallback, or pre-provision model/cache files. |
| OHS reranker | `--rerank` with OHS hybrid mode | larger reranker/model assets managed by OHS | OHS/npm/model caches | Avoid `--rerank` for first-run smoke tests. |

## Local Write Locations

Default paths are derived from `LOCALAPPDATA`, `XDG_CACHE_HOME`, or `~/.cache`.

| Data | Default location shape | Contains private data? | Notes |
|---|---|---:|---|
| OHS database | `Codex/obsidian-high-recall/<vault-hash>.db` under the local cache base | yes, derived index | Rebuild locally instead of sharing. You can override with `--db`. |
| Smart runtime packages | `Codex/obsidian-high-recall/node-runtime` under the local cache base | no note contents by design | Used for `@huggingface/transformers@4.2.0`. |
| Hugging Face model cache | `Codex/obsidian-high-recall/node-runtime/hf-cache` | model files, not note contents by design | Used by local feature extraction. |
| npm cache | npm default cache or `npm_config_cache` | package manager cache | Set `npm_config_cache=.tmp/npm-cache` when the default cache is blocked. |
| Smart Connections cache | `<vault>/.smart-env` | yes, private derived index | Owned by Smart Connections; this tool reads it when available. |
| Evaluation output | user-chosen output directory | yes by default | Keep `raw_runs.json`, metrics, and local cases files private unless anonymized. |

## Commands That Should Not Need Private-Vault Network Access

These are the recommended first checks before touching a private vault:

```bash
npm test
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault docs/fixtures/demo-vault --json
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI" --vault docs/fixtures/demo-vault --backend smart --limit 10
```

The public fixture uses lexical fallback under `--backend smart`; it does not require a private vault or Smart Connections `.smart-env`.

## Dependency Review Checklist

Before using the tool with a highly sensitive vault:

- Read [SECURITY.md](../SECURITY.md) and [privacy_threat_model.md](privacy_threat_model.md).
- Run the public fixture first.
- Review the package manager and model download paths allowed in your environment.
- Prefer local clone commands over GitHub-backed `npx` if you want to inspect code before running it.
- Use `--backend smart` for no-OHS smoke testing.
- Use `doctor --json` for public diagnostics instead of raw query output.
- Do not publish `.smart-env`, OHS databases, recall packs, `raw_runs.json`, or private local cases files.

## Related Docs

- FAQ: [faq.md](faq.md)
- Install guide: [install.md](install.md)
- Troubleshooting: [troubleshooting.md](troubleshooting.md)
- Output contract: [output_contract.md](output_contract.md)
- Privacy threat model: [privacy_threat_model.md](privacy_threat_model.md)
