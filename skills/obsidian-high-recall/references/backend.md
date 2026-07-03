# Backend Reference

This skill wraps `obsidian-hybrid-search` instead of implementing a vector store from scratch.

Useful direct commands:

```bash
npx -y obsidian-hybrid-search --db <db> status --recent --errors
npx -y obsidian-hybrid-search --db <db> reindex --force
npx -y obsidian-hybrid-search --db <db> search --mode semantic --threshold 0 --limit 80 --json "query"
npx -y obsidian-hybrid-search --db <db> search --mode hybrid --threshold 0 --limit 80 --anchors --json "query one" "query two"
npx -y obsidian-hybrid-search --db <db> read "vault-relative/path.md"
```

Required environment:

```bash
OBSIDIAN_VAULT_PATH=<absolute vault path>
```

Search modes used by the wrapper:

- `semantic`: broad latent-space recall.
- `hybrid`: semantic + BM25 + title/alias fusion.
- `fulltext`: exact/proper-noun/acronym safety net.
- `title`: title and alias recall.
- `--tag`: tag-filtered semantic recall when query terms imply likely tags.

Known behavior:

- `obsidian-hybrid-search` can parse Obsidian frontmatter and may reject Templater syntax in templates. This is not fatal for knowledge recall.
- `--rerank` downloads a large cross-encoder model on first use. Do not enable by default for smoke tests.
- `Smart Connections` is an Obsidian UI plugin. Its local index is useful if a bridge exists, but Codex cannot assume it is directly callable unless the session exposes a corresponding MCP/CLI.
