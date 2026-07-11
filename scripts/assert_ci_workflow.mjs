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

console.log("CI workflow smoke passed.");
