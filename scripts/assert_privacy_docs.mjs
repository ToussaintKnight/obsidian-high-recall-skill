#!/usr/bin/env node
import fs from "node:fs";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, required) {
  const text = read(file);
  const missing = required.filter((snippet) => !text.includes(snippet));
  if (missing.length) {
    throw new Error(`${file} is missing required privacy documentation:\n- ${missing.join("\n- ")}`);
  }
}

requireIncludes("SECURITY.md", [
  "Privacy Model",
  "Threat Model",
  "docs/privacy_threat_model.md",
  "docs/dependency_inventory.md",
  "npm run privacy:scan",
  "Security Advisories",
]);

requireIncludes("docs/privacy_threat_model.md", [
  "# Privacy Threat Model",
  "Data Classes",
  "Network Behavior",
  "Main Leak Scenarios",
  "Controls In This Repo",
  "Safe Sharing Checklist",
  "Out Of Scope",
  "dependency_inventory.md",
  "raw_runs.json",
  "metrics.json",
  "metrics.csv",
  "cases.local.json",
  "doctor --json",
]);

requireIncludes("README.md", [
  "docs/privacy_threat_model.md",
  "npm run privacy:scan",
]);

requireIncludes("README.zh-CN.md", [
  "docs/privacy_threat_model.md",
  "npm run privacy:scan",
]);

requireIncludes("docs/LAUNCH.md", [
  "npm run privacy:docs",
  "npm run dependency:check",
  "privacy_threat_model.md",
]);

requireIncludes("SUPPORT.md", [
  "docs/privacy_threat_model.md",
]);

requireIncludes("docs/benchmark/reporting_guide.md", [
  "../privacy_threat_model.md",
]);

console.log("Privacy documentation smoke passed.");
