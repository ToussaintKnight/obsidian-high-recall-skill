# Installation Guide

Use this guide when you want the fastest path from a clean machine to a working Obsidian High Recall query. Start with the public fixture before pointing the tool at a private vault.

## Prerequisites

- Node.js 20 or newer.
- Git, if you want to clone the repository.
- A local Obsidian vault for real-vault use.
- Optional but recommended: Smart Connections installed in Obsidian and fully indexed.
- Optional fallback: temporary network access for first-run `obsidian-hybrid-search` and model/package downloads.

Check Node.js:

```bash
node --version
```

## Recommended Path

1. Clone and run the public fixture:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
cd obsidian-high-recall-skill
npm ci
npm test
```

2. Confirm the CLI help path:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help
```

3. Query the public fixture:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "data collection for embodied AI" --vault docs/fixtures/demo-vault --backend smart --limit 10
```

4. Run a privacy-safe diagnostic on your real vault:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault "/absolute/path/to/your-vault" --json
```

5. Run your first real-vault query locally:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Do not paste real-vault query output into public issues. Use `doctor --json` for public diagnostics.

## Run Without Cloning

GitHub-backed `npx` can run the package directly:

```bash
npx --yes github:ToussaintKnight/obsidian-high-recall-skill query "your broad research query" --vault "/absolute/path/to/your-vault" --backend auto --limit 120
```

Use the clone path if your environment blocks GitHub-backed `npx`, if you want to run `npm test`, or if you plan to contribute.

If `npx` fails with a cache permission error, use the clone path above or set a writable npm cache. See [troubleshooting.md](troubleshooting.md).

## Install As A Codex Skill

Ask Codex:

```text
Use $skill-installer to install https://github.com/ToussaintKnight/obsidian-high-recall-skill/tree/main/skills/obsidian-high-recall
```

Restart Codex after installation. Then ask:

```text
Use $obsidian-high-recall to find a high-recall pack for "data collection for embodied AI".
```

Manual install is also possible from a local clone.

Windows PowerShell:

```powershell
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
New-Item -ItemType Directory -Force "$env:USERPROFILE\.codex\skills" | Out-Null
Copy-Item ".\obsidian-high-recall-skill\skills\obsidian-high-recall" "$env:USERPROFILE\.codex\skills\" -Recurse
```

macOS/Linux:

```bash
git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git
mkdir -p ~/.codex/skills
cp -R ./obsidian-high-recall-skill/skills/obsidian-high-recall ~/.codex/skills/
```

## Backend Setup

`--backend auto` is the default recommended mode.

- If Smart Connections vectors are available, `auto` uses them for fast local recall.
- If Smart Connections vectors are missing, `auto` falls back to OHS.
- Use `--backend both` when missing a relevant note is more costly than extra latency and noise.
- Use `--backend smart` for the public fixture or when you want to avoid OHS first-run downloads.
- Use `--backend ohs` to test OHS fallback directly.

To check Smart/OHS state without reading note contents:

```bash
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault "/absolute/path/to/your-vault" --json
```

## Windows Notes

- Use PowerShell or a terminal that preserves quoted paths.
- Quote vault paths that contain spaces.
- If first-run OHS downloads are blocked, run the public fixture with `--backend smart` first, then retry OHS with a stable network.

## macOS/Linux Notes

- If Obsidian auto-discovery fails, pass `--vault` explicitly.
- If shell expansion changes a path with spaces, wrap the vault path in quotes.
- If model/package downloads fail, confirm network access for the first OHS run.

## Validation Checklist

Before opening an issue, run:

```bash
npm test
node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs doctor --vault "/absolute/path/to/your-vault" --json
```

Then report only privacy-safe fields through the issue templates. Useful setup facts include operating system, Node.js version, Obsidian version, Smart Connections indexed/not indexed, backend used, and whether the public fixture passed.

## Next References

- FAQ: [faq.md](faq.md)
- Command details: [cli_reference.md](cli_reference.md)
- Public redacted output examples: [examples](examples/README.md)
- Copy-paste usage recipes: [recipes.md](recipes.md)
- Output schema and privacy flags: [output_contract.md](output_contract.md)
- Runtime downloads and cache paths: [dependency_inventory.md](dependency_inventory.md)
- Ten-minute tester flow: [testing_guide.md](testing_guide.md)
- Public OS/backend coverage: [compatibility.md](compatibility.md)
- Troubleshooting: [troubleshooting.md](troubleshooting.md)
- Privacy model: [../SECURITY.md](../SECURITY.md)
