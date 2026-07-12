#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function requireFile(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required community file: ${file}`);
  }
  return read(file);
}

function requireIncludes(file, text, required) {
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) {
    throw new Error(`${file} is missing required text:\n- ${missing.join("\n- ")}`);
  }
}

const requiredFiles = [
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "SUPPORT.md",
  "ROADMAP.md",
  "CITATION.cff",
  "docs/testing_guide.md",
  "docs/compatibility.md",
  "docs/community/maintenance.md",
  "docs/community/github_setup_commands.md",
  "docs/community/starter_issue_commands.md",
  "docs/community/discussion_commands.md",
  "scripts/github_setup_commands.mjs",
  "scripts/github_starter_issues.mjs",
  "scripts/github_discussions.mjs",
  ".github/dependabot.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/scorecard.yml",
  ".github/labels.yml",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/benchmark_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/tester_feedback.yml",
  "docs/community/repository_setup.md",
  "docs/community/starter_issues.md",
  "docs/community/discussion_seeds.md",
];

for (const file of requiredFiles) requireFile(file);

const issueTemplates = [
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/benchmark_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/tester_feedback.yml",
];

for (const file of issueTemplates) {
  requireIncludes(file, read(file), [
    "Do not paste",
    "private note",
    "vault",
  ]);
}

requireIncludes(
  ".github/ISSUE_TEMPLATE/config.yml",
  read(".github/ISSUE_TEMPLATE/config.yml"),
  [
    "blank_issues_enabled: false",
    "Testing guide",
    "Troubleshooting before filing",
    "Compatibility matrix",
    "Tester discussion",
    "Security and privacy concern",
  ],
);

requireIncludes(
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  read(".github/ISSUE_TEMPLATE/bug_report.yml"),
  [
    "Operating system",
    "Node.js version",
    "Obsidian and Smart Connections status",
    "Privacy-safe doctor output",
    "Expected behavior",
    "Actual behavior",
  ],
);

requireIncludes(
  ".github/ISSUE_TEMPLATE/benchmark_report.yml",
  read(".github/ISSUE_TEMPLATE/benchmark_report.yml"),
  [
    "docs/benchmark/reporting_guide.md",
    "Aggregate metrics",
    "Precision@K, Recall@K, F1, MRR, latency",
  ],
);

requireIncludes(
  ".github/ISSUE_TEMPLATE/tester_feedback.yml",
  read(".github/ISSUE_TEMPLATE/tester_feedback.yml"),
  [
    "Install and fixture smoke test passed",
    "Real-vault recall worked",
    "Privacy-safe doctor output",
    "vault_size",
    "compatibility_cell",
  ],
);

requireIncludes(
  ".github/pull_request_template.md",
  read(".github/pull_request_template.md"),
  [
    "npm test",
    "npm run privacy:scan",
    "No private vault contents",
    "CHANGELOG.md",
  ],
);

const starterIssues = read("docs/community/starter_issues.md");
const issueSections = starterIssues.match(/^## \d+\. /gmu) ?? [];
if (issueSections.length < 8) {
  throw new Error(`starter_issues.md should contain at least 8 starter issues, found ${issueSections.length}.`);
}
requireIncludes("docs/community/starter_issues.md", starterIssues, [
  "Windows Install And Fixture Smoke Test",
  "Smart Connections Compatibility Report",
  "Anonymized Benchmark Report",
  "Privacy Redaction Checklist Test",
  "Obsidian Forum Launch Feedback",
  "Compatibility Matrix Report",
  "docs/testing_guide.md",
]);

const discussionSeeds = read("docs/community/discussion_seeds.md");
const discussionSections = discussionSeeds.match(/^## \d+\. /gmu) ?? [];
if (discussionSections.length < 4) {
  throw new Error(`discussion_seeds.md should contain at least 4 discussion seeds, found ${discussionSections.length}.`);
}
requireIncludes("docs/community/discussion_seeds.md", discussionSeeds, [
  "# Discussion Seeds",
  "Tester Call: Real Vault Smoke Reports",
  "Q&A: Install, Backends, And Privacy",
  "Share: Recall Wins And Misses",
  "Roadmap Feedback: What Should Matter For v0.2",
  "Privacy guardrail:",
  "Do not paste private note paths",
]);
const discussionCategoryLines = discussionSeeds.match(/^Category:\s*.+$/gmu) ?? [];
if (discussionCategoryLines.length !== discussionSections.length) {
  throw new Error("Every discussion seed must include exactly one Category line.");
}

const maintenance = read("docs/community/maintenance.md");
requireIncludes("docs/community/maintenance.md", maintenance, [
  "# Maintenance Playbook",
  "Weekly Loop",
  "Dependabot",
  ".github/dependabot.yml",
  "npm test",
  "npm run privacy:scan",
  "npm run demo:check",
  "npm run release:check",
  "Issue Triage",
  "Security And Privacy Maintenance",
  "At least five live starter issues",
]);

const dependabot = read(".github/dependabot.yml");
requireIncludes(".github/dependabot.yml", dependabot, [
  "version: 2",
  "package-ecosystem: npm",
  "package-ecosystem: github-actions",
  "interval: weekly",
  "dependencies",
  "security",
]);

const testingGuide = read("docs/testing_guide.md");
requireIncludes("docs/testing_guide.md", testingGuide, [
  "# Testing Guide",
  "compatibility.md",
  "Ten-Minute Path",
  "npm test",
  "doctor --vault",
  "tester_feedback.yml",
  "What Not To Report",
  "raw_runs.json",
  "cases.local.json",
  "Privacy concern",
  "benchmark/reporting_guide.md",
]);

const compatibility = read("docs/compatibility.md");
requireIncludes("docs/compatibility.md", compatibility, [
  "# Compatibility Matrix",
  "CI fixture pass",
  "Tester pass",
  "Needs report",
  "Windows, Node 20+",
  "macOS, Node 20+",
  "Linux desktop, Node 20+",
  "Codex skill install",
  "Smart backend real vault",
  "OHS backend real vault",
  "tester_feedback.yml",
  "privacy.safeToShare: false",
]);

const labelsText = read(".github/labels.yml");
const labelNames = [...labelsText.matchAll(/^- name:\s*([^\r\n]+)/gmu)].map((match) => match[1].trim());
const labelSet = new Set(labelNames);
const requiredLabels = [
  "bug",
  "enhancement",
  "documentation",
  "good first issue",
  "tester-feedback",
  "benchmark",
  "privacy",
  "security",
  "dependencies",
  "windows",
  "macos",
  "linux",
  "smart-connections",
  "compatibility",
  "research",
  "ohs",
  "diagnostics",
  "community",
  "launch",
];
const missingRequiredLabels = requiredLabels.filter((label) => !labelSet.has(label));
if (missingRequiredLabels.length) {
  throw new Error(`.github/labels.yml is missing required labels:\n- ${missingRequiredLabels.join("\n- ")}`);
}

const templateLabelMatches = issueTemplates.flatMap((file) => {
  const text = read(file);
  return [...text.matchAll(/^labels:\s*\[([^\]]+)\]/gmu)].flatMap((match) =>
    match[1]
      .split(",")
      .map((label) => label.trim().replace(/^["']|["']$/gu, ""))
      .filter(Boolean)
      .map((label) => ({ file, label })),
  );
});

const starterLabelMatches = [...starterIssues.matchAll(/^Labels:\s*(.+)$/gmu)].flatMap((match) =>
  [...match[1].matchAll(/`([^`]+)`/gu)].map((labelMatch) => ({
    file: "docs/community/starter_issues.md",
    label: labelMatch[1],
  })),
);

const missingReferencedLabels = [...templateLabelMatches, ...starterLabelMatches]
  .filter(({ label }) => !labelSet.has(label))
  .map(({ file, label }) => `${file}: ${label}`);
if (missingReferencedLabels.length) {
  throw new Error(`Referenced labels are missing from .github/labels.yml:\n- ${missingReferencedLabels.join("\n- ")}`);
}

const repoSetup = read("docs/community/repository_setup.md");
requireIncludes("docs/community/repository_setup.md", repoSetup, [
  "Local-first high-recall search for Obsidian vaults, usable from Codex and CLI.",
  "docs/marketing/social_preview.png",
  ".github/labels.yml",
  "github_setup_commands.md",
  "starter_issue_commands.md",
  "discussion_commands.md",
  "npm run github:issues -- --apply",
  "npm run github:discussions -- --apply",
  "npm run github:setup -- --apply",
  ".github/dependabot.yml",
  "GitHub Pages",
  "Security advisories",
  "compatibility matrix",
]);

const packageJson = JSON.parse(read("package.json"));
if (packageJson.scripts?.["github:setup"] !== "node scripts/github_setup_commands.mjs") {
  throw new Error("package.json must expose github:setup for repeatable repository setup.");
}
if (packageJson.scripts?.["github:issues"] !== "node scripts/github_starter_issues.mjs") {
  throw new Error("package.json must expose github:issues for repeatable starter issue creation.");
}
if (packageJson.scripts?.["github:discussions"] !== "node scripts/github_discussions.mjs") {
  throw new Error("package.json must expose github:discussions for repeatable Discussion seed creation.");
}

const githubSetupDocs = read("docs/community/github_setup_commands.md");
requireIncludes("docs/community/github_setup_commands.md", githubSetupDocs, [
  "# GitHub Setup Commands",
  "npm run github:setup",
  "node scripts/github_setup_commands.mjs",
  "node scripts/github_setup_commands.mjs --json",
  "npm run github:setup -- --apply",
  ".github/labels.yml",
  "docs/marketing/social_preview.png",
  "GitHub Pages",
  "security advisories",
  "Code scanning",
  "OpenSSF Scorecard",
  "npm run github:discussions -- --apply",
  "npm run community:check",
]);

const setupPlanProc = spawnSync(process.execPath, ["scripts/github_setup_commands.mjs", "--json"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 5,
});
if (setupPlanProc.status !== 0) {
  throw new Error(`github_setup_commands --json failed:\n${setupPlanProc.stderr || setupPlanProc.stdout}`);
}
const setupPlan = JSON.parse(setupPlanProc.stdout);
for (const field of ["repo", "description", "homepage", "topics", "labels", "manualChecks"]) {
  if (!(field in setupPlan)) throw new Error(`GitHub setup plan missing field: ${field}`);
}
if (setupPlan.repo !== "ToussaintKnight/obsidian-high-recall-skill") {
  throw new Error(`GitHub setup plan has wrong repo: ${setupPlan.repo}`);
}
for (const topic of ["obsidian", "local-first", "rag", "pkm", "codex", "smart-connections", "ai-agents", "semantic-search"]) {
  if (!setupPlan.topics.includes(topic)) throw new Error(`GitHub setup plan missing topic: ${topic}`);
}
if (setupPlan.labels.length !== labelNames.length) {
  throw new Error(`GitHub setup plan label count ${setupPlan.labels.length} does not match labels.yml count ${labelNames.length}.`);
}
for (const label of labelNames) {
  if (!setupPlan.labels.some((item) => item.name === label)) {
    throw new Error(`GitHub setup plan missing label from labels.yml: ${label}`);
  }
}

const starterIssueDocs = read("docs/community/starter_issue_commands.md");
requireIncludes("docs/community/starter_issue_commands.md", starterIssueDocs, [
  "# Starter Issue Commands",
  "npm run github:issues",
  "npm run github:issues -- --json",
  "npm run github:issues -- --apply",
  "starter_issues.md",
  "doctor --json",
  "npm run community:check",
  "at least five starter issues",
]);

const starterIssuePlanProc = spawnSync(process.execPath, ["scripts/github_starter_issues.mjs", "--json"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 5,
});
if (starterIssuePlanProc.status !== 0) {
  throw new Error(`github_starter_issues --json failed:\n${starterIssuePlanProc.stderr || starterIssuePlanProc.stdout}`);
}
const starterIssuePlan = JSON.parse(starterIssuePlanProc.stdout);
if (starterIssuePlan.repo !== "ToussaintKnight/obsidian-high-recall-skill") {
  throw new Error(`Starter issue plan has wrong repo: ${starterIssuePlan.repo}`);
}
if (starterIssuePlan.count !== issueSections.length || starterIssuePlan.issues.length !== issueSections.length) {
  throw new Error(`Starter issue plan count does not match starter_issues.md: ${starterIssuePlan.count} vs ${issueSections.length}`);
}
for (const title of [
  "Windows Install And Fixture Smoke Test",
  "Smart Connections Compatibility Report",
  "Anonymized Benchmark Report",
  "Privacy Redaction Checklist Test",
  "Obsidian Forum Launch Feedback",
  "Compatibility Matrix Report",
]) {
  if (!starterIssuePlan.issues.some((issue) => issue.title === title)) {
    throw new Error(`Starter issue plan missing title: ${title}`);
  }
}
for (const issue of starterIssuePlan.issues) {
  if (!issue.body.includes("Privacy note:")) {
    throw new Error(`Starter issue "${issue.title}" is missing privacy note in generated body.`);
  }
  for (const label of issue.labels) {
    if (!labelSet.has(label)) {
      throw new Error(`Starter issue "${issue.title}" references unknown label: ${label}`);
    }
  }
}

const discussionDocs = read("docs/community/discussion_commands.md");
requireIncludes("docs/community/discussion_commands.md", discussionDocs, [
  "# Discussion Commands",
  "npm run github:discussions",
  "npm run github:discussions -- --json",
  "npm run github:discussions -- --apply",
  "discussion_seeds.md",
  "tester coordination",
  "Privacy Guardrail",
  "npm run community:check",
  "GitHub GraphQL API",
]);

const discussionPlanProc = spawnSync(process.execPath, ["scripts/github_discussions.mjs", "--json"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 5,
});
if (discussionPlanProc.status !== 0) {
  throw new Error(`github_discussions --json failed:\n${discussionPlanProc.stderr || discussionPlanProc.stdout}`);
}
const discussionPlan = JSON.parse(discussionPlanProc.stdout);
if (discussionPlan.repo !== "ToussaintKnight/obsidian-high-recall-skill") {
  throw new Error(`Discussion seed plan has wrong repo: ${discussionPlan.repo}`);
}
if (discussionPlan.count !== discussionSections.length || discussionPlan.discussions.length !== discussionSections.length) {
  throw new Error(`Discussion seed plan count does not match discussion_seeds.md: ${discussionPlan.count} vs ${discussionSections.length}`);
}
for (const title of [
  "Tester Call: Real Vault Smoke Reports",
  "Q&A: Install, Backends, And Privacy",
  "Share: Recall Wins And Misses",
  "Roadmap Feedback: What Should Matter For v0.2",
]) {
  if (!discussionPlan.discussions.some((discussion) => discussion.title === title)) {
    throw new Error(`Discussion seed plan missing title: ${title}`);
  }
}
for (const discussion of discussionPlan.discussions) {
  if (!discussion.preferredCategory || !discussion.body.includes("Privacy guardrail:")) {
    throw new Error(`Discussion seed "${discussion.title}" is missing category or privacy guardrail.`);
  }
}

const roadmap = read("ROADMAP.md");
if (roadmap.includes("Add CI, issue templates")) {
  throw new Error("ROADMAP.md still describes existing community files as future work.");
}

console.log(`Community file smoke passed: ${requiredFiles.length} files checked.`);
