# Publish GitHub Release

Use this after local commits are pushed, CI is green, and `gh auth login -h github.com` succeeds. It makes the GitHub release step repeatable instead of relying on manual UI copy-paste.

## Dry Run

Print the release commands:

```bash
npm run github:release
```

Print the structured plan:

```bash
npm run github:release -- --json
```

## Apply

Create the release if it does not already exist:

```bash
npm run github:release -- --apply
```

Apply mode runs:

- `gh auth status`;
- `npm test`;
- `npm run privacy:scan`;
- `npm run release:check`;
- `gh release view v0.2.0`;
- `gh release create v0.2.0 --notes-file docs/releases/v0.2.0.md --latest` if the release is missing.

## Release Notes Source

The release notes source is [v0.2.0.md](v0.2.0.md). Keep it aligned with:

- [CHANGELOG.md](../../CHANGELOG.md);
- `package.json` version;
- privacy and install limitations;
- public fixture demo command.

## Manual Checks

After applying, verify:

- the release page is public;
- the release links to the fixture demo command;
- CI is green on the pushed commit;
- release notes do not include private vault names, note paths, snippets, raw queries, labels, usernames, tokens, or local paths.
