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

console.log("CI workflow smoke passed.");
