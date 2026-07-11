# Discussion Commands

Use this after local commits are pushed, Discussions are enabled, and `gh auth login -h github.com` succeeds. It turns [discussion_seeds.md](discussion_seeds.md) into repeatable GitHub Discussion creation.

Discussions are the public social-proof layer for tester coordination, Q&A, qualitative recall wins/misses, and roadmap feedback. Actionable bugs, compatibility reports, and benchmark reports should still use Issues.

## Dry Run

Print the plan without changing GitHub:

```bash
npm run github:discussions
npm run github:discussions -- --json
```

## Apply

Create missing discussions and skip existing discussions with the same title:

```bash
npm run github:discussions -- --apply
```

Apply mode:

- verifies `gh auth status`;
- reads discussion drafts from [discussion_seeds.md](discussion_seeds.md);
- queries the repository's enabled Discussion categories;
- prefers each draft's requested category and falls back to `General` or the first available category;
- skips open discussions with matching titles;
- creates missing discussions through the GitHub GraphQL API.

## Privacy Guardrail

Keep discussion prompts privacy-safe:

- ask for fixture output, OS/backend summaries, and broad qualitative reports;
- route actionable bugs to issue templates;
- route aggregate metrics to the benchmark report template;
- never ask users to paste private note paths, snippets, raw queries, vault names, usernames, tokens, or gold labels.

## Verification

Before applying:

```bash
npm test
npm run community:check
npm run github:setup -- --json
npm run github:discussions -- --json
```

After applying, verify the live repo has discussion threads for tester calls, install/privacy Q&A, qualitative recall wins/misses, and roadmap feedback.
