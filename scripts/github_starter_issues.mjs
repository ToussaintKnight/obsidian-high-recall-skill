#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repo = "ToussaintKnight/obsidian-high-recall-skill";
const sourceFile = path.join("docs", "community", "starter_issues.md");

function parseLabels(line) {
  return [...line.matchAll(/`([^`]+)`/gu)].map((match) => match[1]);
}

function parseIssues(markdown) {
  const blocks = markdown
    .split(/\n(?=## \d+\. )/u)
    .filter((block) => /^## \d+\. /u.test(block.trim()));

  return blocks.map((block) => {
    const title = block.match(/^## \d+\. (.+)$/mu)?.[1]?.trim();
    const labelsLine = block.match(/^Labels:\s*(.+)$/mu)?.[1] || "";
    const body = block
      .replace(/^## \d+\. .+\n/u, "")
      .trim();
    if (!title) throw new Error(`Could not parse starter issue title from block:\n${block}`);
    const labels = parseLabels(labelsLine);
    if (!labels.length) throw new Error(`Starter issue "${title}" has no labels.`);
    return { title, labels, body };
  });
}

const issues = parseIssues(fs.readFileSync(sourceFile, "utf8"));

function quote(value) {
  return `'${String(value).replace(/'/gu, "'\\''")}'`;
}

function commandText() {
  const lines = [
    "# Authenticate first:",
    "gh auth status",
    "",
    "# Review structured starter issue plan:",
    "npm run github:issues -- --json",
    "",
    "# Create missing starter issues:",
    "npm run github:issues -- --apply",
    "",
    "# Issues to create if missing:",
  ];

  for (const issue of issues) {
    lines.push(
      `# - ${issue.title}`,
      `#   labels: ${issue.labels.join(", ")}`,
      `#   gh issue create --repo ${repo} --title ${quote(issue.title)} --body-file <generated-body-file> ${issue.labels.map((label) => `--label ${quote(label)}`).join(" ")}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

function plan() {
  return {
    repo,
    sourceFile,
    count: issues.length,
    issues,
  };
}

function runGh(args, options = {}) {
  const proc = spawnSync("gh", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 10,
    ...options,
  });
  if (proc.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
  }
  return proc;
}

function existingOpenTitles() {
  const proc = runGh([
    "issue",
    "list",
    "--repo",
    repo,
    "--state",
    "open",
    "--limit",
    "200",
    "--json",
    "title",
  ]);
  return new Set(JSON.parse(proc.stdout).map((issue) => issue.title));
}

function safeTempRoot() {
  const root = path.resolve(".tmp", "github-starter-issues");
  fs.mkdirSync(root, { recursive: true });
  return fs.mkdtempSync(path.join(root, "run-"));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 72);
}

function apply() {
  runGh(["auth", "status"]);
  const existing = existingOpenTitles();
  const tempRoot = safeTempRoot();
  const created = [];
  const skipped = [];

  for (const issue of issues) {
    if (existing.has(issue.title)) {
      skipped.push(issue.title);
      continue;
    }
    const bodyPath = path.join(tempRoot, `${slug(issue.title)}.md`);
    fs.writeFileSync(bodyPath, `${issue.body}\n\n---\nSource: ${sourceFile}\n`, "utf8");
    const args = [
      "issue",
      "create",
      "--repo",
      repo,
      "--title",
      issue.title,
      "--body-file",
      bodyPath,
      ...issue.labels.flatMap((label) => ["--label", label]),
    ];
    const proc = runGh(args);
    created.push({ title: issue.title, url: proc.stdout.trim() });
  }

  console.log(JSON.stringify({ repo, created, skipped }, null, 2));
}

const args = new Set(process.argv.slice(2));

if (args.has("--json")) {
  console.log(JSON.stringify(plan(), null, 2));
} else if (args.has("--apply")) {
  apply();
} else {
  process.stdout.write(commandText());
}
