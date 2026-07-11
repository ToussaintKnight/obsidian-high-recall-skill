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
  ".github/pull_request_template.md",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/benchmark_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/tester_feedback.yml",
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
    "Troubleshooting before filing",
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
]);

const roadmap = read("ROADMAP.md");
if (roadmap.includes("Add CI, issue templates")) {
  throw new Error("ROADMAP.md still describes existing community files as future work.");
}

console.log(`Community file smoke passed: ${requiredFiles.length} files checked.`);
