#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const forbiddenTrackedPathPatterns = [
  {
    label: "raw evaluator run output",
    re: /(^|[\\/])raw_runs\.json$/i,
  },
  {
    label: "local evaluator output directory",
    re: /(^|[\\/])obsidian_recall_eval([\\/]|$)/i,
  },
  {
    label: "temporary test output",
    re: /(^|[\\/])\.tmp([\\/]|$)/i,
  },
  {
    label: "Smart Connections private cache",
    re: /(^|[\\/])\.smart-env([\\/]|$)/i,
  },
  {
    label: "local database",
    re: /\.(db|sqlite|sqlite3)$/i,
  },
  {
    label: "local/private evaluation labels",
    re: /(^|[\\/])(cases|eval_cases)\.local\.json$/i,
  },
];

const textFilePattern = /\.(cjs|css|csv|html|js|json|md|mjs|svg|txt|yaml|yml|cff)$/i;
const sensitiveTextPatterns = [
  {
    label: "Windows user home path",
    re: /[A-Za-z]:\\Users\\[^\\\s"'`<>]+/g,
  },
  {
    label: "macOS user home path",
    re: /\/Users\/[^/\s"'`<>]+/g,
  },
  {
    label: "Linux user home path",
    re: /\/home\/[^/\s"'`<>]+/g,
  },
  {
    label: "GitHub token-like value",
    re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/g,
  },
  {
    label: "fine-grained GitHub token-like value",
    re: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/g,
  },
  {
    label: "OpenAI token-like value",
    re: /\bsk-[A-Za-z0-9_-]{20,}\b/g,
  },
];

function gitLsFiles() {
  const proc = spawnSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  if (proc.status !== 0) {
    throw new Error(proc.stderr || proc.stdout || "git ls-files failed");
  }
  return proc.stdout.split("\0").filter(Boolean);
}

function lineAndColumn(text, index) {
  const before = text.slice(0, index);
  const lines = before.split(/\r?\n/);
  return { line: lines.length, column: lines[lines.length - 1].length + 1 };
}

const problems = [];
const files = gitLsFiles();

for (const file of files) {
  const normalized = file.replace(/\\/g, "/");
  for (const pattern of forbiddenTrackedPathPatterns) {
    if (pattern.re.test(normalized)) {
      problems.push(`${file}: tracked ${pattern.label}`);
    }
  }

  if (!textFilePattern.test(file)) continue;
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }
  for (const pattern of sensitiveTextPatterns) {
    pattern.re.lastIndex = 0;
    let match;
    while ((match = pattern.re.exec(text))) {
      const loc = lineAndColumn(text, match.index);
      problems.push(`${file}:${loc.line}:${loc.column}: ${pattern.label}`);
    }
  }
}

if (problems.length) {
  console.error("Privacy scan failed. Remove private/local artifacts before publishing:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`Privacy scan passed: ${files.length} tracked or unignored files checked.`);
