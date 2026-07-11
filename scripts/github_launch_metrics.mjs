#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const repo = "ToussaintKnight/obsidian-high-recall-skill";
const [owner, name] = repo.split("/");

function commandText() {
  return `# Review the launch metrics collection plan:
npm run github:metrics -- --json

# Collect a snapshot after gh auth succeeds:
gh auth status
npm run github:metrics -- --collect

# Suggested local archive path:
# npm run github:metrics -- --collect > .tmp/launch-metrics-YYYY-MM-DD-channel.json
`;
}

function plan() {
  return {
    repo,
    purpose: "Collect repeatable launch funnel metrics before a post, after 24h, and after 7d.",
    publicSignals: [
      "stars",
      "forks",
      "watchers",
      "open issues",
      "open pull requests",
      "discussion count",
      "release count",
    ],
    privateTrafficSignals: [
      "total views",
      "unique views",
      "total clones",
      "unique clones",
    ],
    communitySignals: [
      "tester-feedback issues",
      "benchmark issues",
      "bug/diagnostic issues",
      "discussion count",
    ],
    commands: [
      "npm run github:metrics -- --json",
      "npm run github:metrics -- --collect",
    ],
  };
}

function run(command, args, options = {}) {
  const proc = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
  if (proc.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
  }
  return proc;
}

function tryRunJson(command, args) {
  const proc = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 20,
  });
  if (proc.status !== 0) {
    return {
      ok: false,
      error: (proc.stderr || proc.stdout || "").trim(),
    };
  }
  return {
    ok: true,
    data: JSON.parse(proc.stdout || "{}"),
  };
}

function collectGraphqlState() {
  const query = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    nameWithOwner
    stargazerCount
    forkCount
    watchers { totalCount }
    issues(states: OPEN) { totalCount }
    pullRequests(states: OPEN) { totalCount }
    discussions { totalCount }
    releases { totalCount }
    latestRelease { tagName url }
    hasIssuesEnabled
    hasDiscussionsEnabled
    homepageUrl
    description
  }
}`;
  const proc = run("gh", [
    "api",
    "graphql",
    "-f",
    `query=${query}`,
    "-F",
    `owner=${owner}`,
    "-F",
    `name=${name}`,
  ]);
  const parsed = JSON.parse(proc.stdout);
  const repository = parsed.data?.repository;
  if (!repository?.nameWithOwner) {
    throw new Error(`Could not collect repository state for ${repo}.`);
  }
  return repository;
}

function countIssueLabels(issues) {
  const counts = {
    sampledIssues: issues.length,
    testerFeedback: 0,
    benchmarkReports: 0,
    bugOrDiagnostics: 0,
    communityLaunch: 0,
  };
  for (const issue of issues) {
    const labels = new Set((issue.labels || []).map((label) => label.name));
    if (labels.has("tester-feedback")) counts.testerFeedback += 1;
    if (labels.has("benchmark")) counts.benchmarkReports += 1;
    if (labels.has("bug") || labels.has("diagnostics")) counts.bugOrDiagnostics += 1;
    if (labels.has("community") || labels.has("launch")) counts.communityLaunch += 1;
  }
  return counts;
}

function collect() {
  run("gh", ["auth", "status"]);
  const repository = collectGraphqlState();
  const views = tryRunJson("gh", ["api", `repos/${repo}/traffic/views`]);
  const clones = tryRunJson("gh", ["api", `repos/${repo}/traffic/clones`]);
  const issues = tryRunJson("gh", [
    "issue",
    "list",
    "--repo",
    repo,
    "--state",
    "all",
    "--limit",
    "200",
    "--json",
    "number,title,state,labels,createdAt",
  ]);

  const issueSignals = issues.ok
    ? countIssueLabels(issues.data)
    : { sampledIssues: null, testerFeedback: null, benchmarkReports: null, bugOrDiagnostics: null, communityLaunch: null };

  const snapshot = {
    repo,
    collectedAt: new Date().toISOString(),
    repository: {
      stars: repository.stargazerCount,
      forks: repository.forkCount,
      watchers: repository.watchers?.totalCount,
      openIssues: repository.issues?.totalCount,
      openPullRequests: repository.pullRequests?.totalCount,
      discussions: repository.discussions?.totalCount,
      releases: repository.releases?.totalCount,
      latestRelease: repository.latestRelease,
      hasIssuesEnabled: repository.hasIssuesEnabled,
      hasDiscussionsEnabled: repository.hasDiscussionsEnabled,
      homepageUrl: repository.homepageUrl,
      description: repository.description,
    },
    traffic: {
      views: views.ok ? views.data : null,
      clones: clones.ok ? clones.data : null,
      accessIssues: [
        ...(!views.ok ? [`views: ${views.error}`] : []),
        ...(!clones.ok ? [`clones: ${clones.error}`] : []),
      ],
    },
    issueSignals,
    conversionInputs: {
      starConversion: "new stars / new unique views",
      testerConversion: "tester reports / new unique views",
      benchmarkYield: "benchmark reports / tester reports",
      note: "Fill post clicks and community impressions manually from the launch channel.",
    },
  };

  console.log(JSON.stringify(snapshot, null, 2));
}

const args = new Set(process.argv.slice(2));

if (args.has("--json")) {
  console.log(JSON.stringify(plan(), null, 2));
} else if (args.has("--collect") || args.has("--apply")) {
  collect();
} else {
  process.stdout.write(commandText());
}
