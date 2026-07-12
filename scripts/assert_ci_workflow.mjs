#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const actionRefs = {
  checkout: "actions/checkout@34e114876b0b11c390a56381ad16ebd13914f8d5",
  setupNode: "actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020",
  uploadArtifact: "actions/upload-artifact@ea165f8d65b6e75b540449e92b4886f43607fa02",
  codeqlInit: "github/codeql-action/init@641a925cfafe92d0fdf8b239ba4053e3f8d99d6d",
  codeqlAnalyze: "github/codeql-action/analyze@641a925cfafe92d0fdf8b239ba4053e3f8d99d6d",
  codeqlUploadSarif: "github/codeql-action/upload-sarif@641a925cfafe92d0fdf8b239ba4053e3f8d99d6d",
  scorecard: "ossf/scorecard-action@99c09fe975337306107572b4fdf4db224cf8e2f2",
};

function assertWorkflowActionsPinned(workflowPath) {
  const text = fs.readFileSync(workflowPath, "utf8");
  for (const [index, line] of text.split(/\r?\n/).entries()) {
    const match = line.match(/uses:\s+["']?([^"'\s#]+)["']?/);
    if (!match) continue;
    const spec = match[1];
    if (spec.startsWith("./")) continue;
    const atIndex = spec.lastIndexOf("@");
    const ref = atIndex === -1 ? "" : spec.slice(atIndex + 1);
    if (!/^[a-f0-9]{40}$/i.test(ref)) {
      throw new Error(`${workflowPath}:${index + 1} should pin GitHub Action '${spec}' to a 40-character commit SHA.`);
    }
  }
}

function assertCheckoutCredentialsDisabled(workflowPath) {
  const text = fs.readFileSync(workflowPath, "utf8");
  const checkoutUses = [...text.matchAll(/uses:\s+actions\/checkout@[a-f0-9]{40}/gi)];
  for (const [index, checkoutUse] of checkoutUses.entries()) {
    const afterCheckout = text.slice(checkoutUse.index + checkoutUse[0].length);
    const stepBlock = afterCheckout.split(/\n\s*-\s+name:\s+/)[0];
    if (!stepBlock.includes("persist-credentials: false")) {
      throw new Error(`${workflowPath} checkout step ${index + 1} should set persist-credentials: false.`);
    }
  }
}

const workflow = fs.readFileSync(path.join(".github", "workflows", "ci.yml"), "utf8");
const required = [
  "ubuntu-latest",
  "windows-latest",
  "macos-latest",
  "npm ci",
  "npm test",
  "persist-credentials: false",
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
  "persist-credentials: false",
  "security-events: write",
  actionRefs.checkout,
  actionRefs.codeqlInit,
  actionRefs.codeqlAnalyze,
  "languages: javascript-typescript",
];
const missingCodeql = requiredCodeql.filter((item) => !codeql.includes(item));
if (missingCodeql.length) {
  throw new Error(`CodeQL workflow is missing required entries:\n- ${missingCodeql.join("\n- ")}`);
}

if (!/cron:\s*["']?\d+\s+\d+\s+\*\s+\*\s+\d["']?/.test(codeql)) {
  throw new Error("CodeQL workflow should include a weekly scheduled cron.");
}

const codeqlTopLevelPermissions = codeql.match(/permissions:\s*\n([\s\S]*?)\njobs:/)?.[1] ?? "";
if (/security-events:\s*write/.test(codeqlTopLevelPermissions)) {
  throw new Error("CodeQL workflow should scope security-events: write to the analyze job, not top-level permissions.");
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
  actionRefs.checkout,
  "persist-credentials: false",
  actionRefs.scorecard,
  "results_file: scorecard.sarif",
  "results_format: sarif",
  "publish_results: true",
  actionRefs.uploadArtifact,
  actionRefs.codeqlUploadSarif,
];
const missingScorecard = requiredScorecard.filter((item) => !scorecard.includes(item));
if (missingScorecard.length) {
  throw new Error(`OpenSSF Scorecard workflow is missing required entries:\n- ${missingScorecard.join("\n- ")}`);
}

if (!/cron:\s*["']?\d+\s+\d+\s+\*\s+\*\s+\d["']?/.test(scorecard)) {
  throw new Error("OpenSSF Scorecard workflow should include a weekly scheduled cron.");
}

for (const workflowFile of fs.readdirSync(path.join(".github", "workflows"))) {
  if (!workflowFile.endsWith(".yml") && !workflowFile.endsWith(".yaml")) continue;
  const workflowPath = path.join(".github", "workflows", workflowFile);
  assertWorkflowActionsPinned(workflowPath);
  assertCheckoutCredentialsDisabled(workflowPath);
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
