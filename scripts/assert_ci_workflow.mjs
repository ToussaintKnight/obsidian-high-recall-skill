#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const workflow = fs.readFileSync(path.join(".github", "workflows", "ci.yml"), "utf8");
const required = [
  "ubuntu-latest",
  "windows-latest",
  "macos-latest",
  "npm ci",
  "npm test",
];

const missing = required.filter((item) => !workflow.includes(item));
if (missing.length) {
  throw new Error(`CI workflow is missing required entries:\n- ${missing.join("\n- ")}`);
}

if (!/fail-fast:\s*false/.test(workflow)) {
  throw new Error("CI workflow should keep fail-fast disabled so all OS results are visible.");
}

const codeqlPath = path.join(".github", "workflows", "codeql.yml");
if (!fs.existsSync(codeqlPath)) {
  throw new Error("CodeQL workflow is missing: .github/workflows/codeql.yml");
}

const codeql = fs.readFileSync(codeqlPath, "utf8");
const requiredCodeql = [
  "name: CodeQL",
  "push:",
  "pull_request:",
  "schedule:",
  "security-events: write",
  "github/codeql-action/init@v3",
  "github/codeql-action/analyze@v3",
  "languages: javascript-typescript",
];
const missingCodeql = requiredCodeql.filter((item) => !codeql.includes(item));
if (missingCodeql.length) {
  throw new Error(`CodeQL workflow is missing required entries:\n- ${missingCodeql.join("\n- ")}`);
}

if (!/cron:\s*["']?\d+\s+\d+\s+\*\s+\*\s+\d["']?/.test(codeql)) {
  throw new Error("CodeQL workflow should include a weekly scheduled cron.");
}

const scorecardPath = path.join(".github", "workflows", "scorecard.yml");
if (!fs.existsSync(scorecardPath)) {
  throw new Error("OpenSSF Scorecard workflow is missing: .github/workflows/scorecard.yml");
}

const scorecard = fs.readFileSync(scorecardPath, "utf8");
const requiredScorecard = [
  "name: OpenSSF Scorecard",
  "push:",
  "schedule:",
  "permissions: read-all",
  "security-events: write",
  "id-token: write",
  "actions/checkout@v4",
  "persist-credentials: false",
  "ossf/scorecard-action@v2.4.3",
  "results_file: scorecard.sarif",
  "results_format: sarif",
  "publish_results: true",
  "actions/upload-artifact@v4",
  "github/codeql-action/upload-sarif@v3",
];
const missingScorecard = requiredScorecard.filter((item) => !scorecard.includes(item));
if (missingScorecard.length) {
  throw new Error(`OpenSSF Scorecard workflow is missing required entries:\n- ${missingScorecard.join("\n- ")}`);
}

if (!/cron:\s*["']?\d+\s+\d+\s+\*\s+\*\s+\d["']?/.test(scorecard)) {
  throw new Error("OpenSSF Scorecard workflow should include a weekly scheduled cron.");
}

for (const readmePath of ["README.md", "README.zh-CN.md"]) {
  const readme = fs.readFileSync(readmePath, "utf8");
  for (const snippet of [
    "[![CodeQL]",
    "actions/workflows/codeql.yml/badge.svg",
    "actions/workflows/codeql.yml",
    "[![OpenSSF Scorecard]",
    "api.scorecard.dev/projects/github.com/ToussaintKnight/obsidian-high-recall-skill/badge",
    "scorecard.dev/viewer/?uri=github.com/ToussaintKnight/obsidian-high-recall-skill",
  ]) {
    if (!readme.includes(snippet)) {
      throw new Error(`${readmePath} is missing CodeQL badge snippet: ${snippet}`);
    }
  }
}

console.log("CI workflow smoke passed.");
