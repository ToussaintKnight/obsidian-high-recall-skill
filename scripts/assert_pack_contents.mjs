#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import path from "node:path";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const proc = spawnSync(npmBin, ["pack", "--dry-run", "--json", "--cache", path.join(".tmp", "npm-cache")], {
  encoding: "utf8",
  shell: process.platform === "win32",
  maxBuffer: 1024 * 1024 * 10,
});

if (proc.status !== 0) {
  throw new Error(`npm pack --dry-run failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
}

const payload = JSON.parse(proc.stdout);
const pack = payload[0];
const files = new Set((pack.files || []).map((file) => file.path));
const required = [
  "README.md",
  "README.zh-CN.md",
  "CHANGELOG.md",
  "docs/positioning.md",
  "docs/testing_guide.md",
  "docs/cli_reference.md",
  "docs/output_contract.md",
  "docs/privacy_threat_model.md",
  "docs/troubleshooting.md",
  "docs/benchmark/reporting_guide.md",
  "docs/community/maintenance.md",
  "docs/robots.txt",
  "docs/sitemap.xml",
  "docs/demo/fixture_demo.gif",
  "docs/demo/fixture_walkthrough.md",
  "docs/architecture/architecture_option_b_archify.png",
  "docs/fixtures/README.md",
  "docs/fixtures/demo_cases.json",
  "skills/obsidian-high-recall/SKILL.md",
  "skills/obsidian-high-recall/agents/openai.yaml",
  "skills/obsidian-high-recall/references/backend.md",
  "skills/obsidian-high-recall/references/eval_cases.example.json",
  "skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs",
  "skills/obsidian-high-recall/scripts/evaluate_recall.mjs",
  "skills/obsidian-high-recall/scripts/rrf_union.mjs",
];

const missing = required.filter((file) => !files.has(file));
if (missing.length) {
  throw new Error(`Package dry-run is missing required files:\n- ${missing.join("\n- ")}`);
}

const maxCompressedBytes = 1_500_000;
if (pack.size > maxCompressedBytes) {
  throw new Error(`Package dry-run size ${pack.size} exceeds ${maxCompressedBytes} bytes.`);
}

console.log(`Package dry-run smoke passed: ${pack.entryCount} files, ${pack.size} bytes.`);
