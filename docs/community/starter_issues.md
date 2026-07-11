# Starter Issues

Use these issue drafts to keep the project easy for outside testers to enter. They are intentionally small, privacy-safe, and measurable. When creating the live GitHub issues, keep private vault contents out of the issue body and ask contributors to report only aggregate or redacted data.

## 1. Windows Install And Fixture Smoke Test

Labels: `good first issue`, `windows`, `tester-feedback`

Goal: Verify a clean Windows machine can install dependencies and run the public fixture without private vault data.

Checklist:

- Run `npm ci`.
- Run `npm test`.
- Run `node skills/obsidian-high-recall/scripts/evaluate_recall.mjs .tmp/fixture-eval --vault docs/fixtures/demo-vault --cases docs/fixtures/demo_cases.json --backends smart --ks 5,10 --limit 20 --per-channel 20 --neighbor-seeds 0`.
- Report OS version, Node.js version, and pass/fail summary.

Privacy note: use only the fixture vault. Do not paste local paths or private vault names.

## 2. macOS Install And Fixture Smoke Test

Labels: `good first issue`, `macos`, `tester-feedback`

Goal: Verify the same fixture path on macOS, including shell quoting for vault paths.

Checklist:

- Run `npm ci`.
- Run `npm test`.
- Report whether `obsidian-high-recall --help` and `obsidian-high-recall-eval --help` work after install.
- Note any path or permission problems.

Privacy note: redact usernames and local paths from command output.

## 3. Linux Install And Fixture Smoke Test

Labels: `good first issue`, `linux`, `tester-feedback`

Goal: Verify the package on a common Linux desktop or WSL environment.

Checklist:

- Run `npm ci`.
- Run `npm test`.
- Run `npm pack --dry-run`.
- Report OS distribution, shell, Node.js version, and pass/fail summary.

Privacy note: use only the public fixture or privacy-safe doctor output.

## 4. Smart Connections Compatibility Report

Labels: `smart-connections`, `compatibility`, `tester-feedback`

Goal: Collect aggregate compatibility reports across Smart Connections versions and vault states.

Checklist:

- State Smart Connections version if known.
- State whether Smart Connections has finished indexing.
- Run `obsidian-high-recall doctor --vault "/absolute/path/to/your-vault" --json` and paste only privacy-safe output.
- Report whether Smart backend, OHS fallback, or both were used.

Privacy note: do not share note names, snippets, raw queries, or vault names.

## 5. Anonymized Benchmark Report

Labels: `benchmark`, `research`, `tester-feedback`

Goal: Add aggregate real-vault evidence without exposing private notes.

Checklist:

- Follow [docs/benchmark/reporting_guide.md](../benchmark/reporting_guide.md).
- Share approximate vault size and backend settings.
- Share aggregate metrics only: Precision@K, Recall@K, F1, MRR, and latency.
- Include language mix if safe, using broad counts only.

Privacy note: never attach `raw_runs.json`, local cases files, raw snippets, private labels, raw queries, or note paths.

## 6. OHS First-Run Diagnostics

Labels: `ohs`, `diagnostics`, `good first issue`

Goal: Improve the docs and error messages for users whose OHS index is missing, stale, or slow on first run.

Checklist:

- Start from [docs/troubleshooting.md](../troubleshooting.md).
- Reproduce with the public fixture when possible.
- Identify any unclear error message or missing next step.
- Propose a docs or CLI message improvement.

Privacy note: use fixture examples or redact all local paths.

## 7. Privacy Redaction Checklist Test

Labels: `privacy`, `documentation`, `good first issue`

Goal: Stress-test whether bug reports, benchmark reports, screenshots, and logs are safe enough to post publicly.

Checklist:

- Review `SECURITY.md`, `SUPPORT.md`, issue templates, and [docs/benchmark/reporting_guide.md](../benchmark/reporting_guide.md).
- List any place where a user may accidentally paste private data.
- Suggest wording that makes the safer path clearer.
- Confirm `npm run privacy:scan` still passes if files change.

Privacy note: do not include real private examples; use synthetic placeholders.

## 8. Obsidian Forum Launch Feedback

Labels: `community`, `documentation`, `launch`

Goal: Make the launch post understandable to Obsidian users who do not care about Codex internals.

Checklist:

- Review [docs/marketing/community_launch_posts.md](../marketing/community_launch_posts.md).
- Check that the first paragraph states the user pain clearly.
- Check that the post includes a fixture demo, privacy model, install command, benchmark caveat, and tester ask.
- Suggest edits that reduce jargon.

Privacy note: launch screenshots and examples must use the fixture vault or synthetic content only.
