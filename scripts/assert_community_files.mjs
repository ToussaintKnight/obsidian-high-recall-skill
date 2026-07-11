#!/usr/bin/env node
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
  ".github/dependabot.yml",
  ".github/labels.yml",
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/benchmark_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/tester_feedback.yml",
  "docs/community/repository_setup.md",
  "docs/community/starter_issues.md",
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
  ".github/dependabot.yml",
  "GitHub Pages",
  "Security advisories",
  "compatibility matrix",
]);

const roadmap = read("ROADMAP.md");
if (roadmap.includes("Add CI, issue templates")) {
  throw new Error("ROADMAP.md still describes existing community files as future work.");
}

console.log(`Community file smoke passed: ${requiredFiles.length} files checked.`);
