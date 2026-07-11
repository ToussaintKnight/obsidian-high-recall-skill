#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = process.cwd();
const blockedFilenames = new Set(["raw_runs.json", "cases.local.json", "eval_cases.local.json"]);

function runGit(args) {
  const proc = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  if (proc.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed:\n${proc.stderr || proc.stdout}`);
  }
  return proc.stdout.split("\0").filter(Boolean);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function localPathPatterns() {
  const patterns = [
    {
      label: "Windows user absolute path",
      re: /[A-Za-z]:\\Users\\[^\\\s"'<>]+/i,
    },
    {
      label: "Windows project/workspace absolute path",
      re: /[A-Za-z]:\\(?:Projects|Playground|Vaults|Obsidian|OneDrive|Dropbox)\\/i,
    },
    {
      label: "file URI absolute path",
      re: /file:\/\/\//i,
    },
  ];

  for (const absolutePath of unique([os.homedir(), repoRoot, path.dirname(repoRoot)])) {
    if (absolutePath && absolutePath.length > 5) {
      patterns.push({
        label: "current machine absolute path",
        re: new RegExp(escapeRegExp(absolutePath), "i"),
      });
    }
  }

  const username = process.env.USERNAME || process.env.USER || "";
  const commonUsernames = new Set(["root", "runner", "actions", "user", "users", "admin"]);
  if (username.length >= 5 && !commonUsernames.has(username.toLowerCase())) {
    patterns.push({
      label: "current local username in home path",
      re: new RegExp(`(?:[A-Za-z]:\\\\Users\\\\|/Users/|/home/)${escapeRegExp(username)}(?:[\\\\/]|$)`, "i"),
    });
  }

  return patterns;
}

function secretPatterns() {
  const githubClassic = "gh" + "p_";
  const githubFineGrained = "github" + "_pat_";
  const keyNames = [
    `${"OPENAI"}_API_KEY`,
    `${"ANTHROPIC"}_API_KEY`,
    "GITHUB_TOKEN",
    "GH_TOKEN",
  ];
  return [
    {
      label: "GitHub classic token",
      re: new RegExp(`${githubClassic}[A-Za-z0-9_]{20,}`),
    },
    {
      label: "GitHub fine-grained token",
      re: new RegExp(`${githubFineGrained}[A-Za-z0-9_]{20,}`),
    },
    {
      label: "OpenAI-style secret key",
      re: /sk-[A-Za-z0-9_-]{20,}/,
    },
    {
      label: "AWS access key",
      re: /AKIA[0-9A-Z]{16}/,
    },
    {
      label: "API key assignment",
      re: new RegExp(`(?:${keyNames.join("|")})\\s*[:=]\\s*["']?[^\\s"']{8,}`, "i"),
    },
  ];
}

function candidateFiles() {
  return runGit(["ls-files", "-co", "--exclude-standard", "-z"]).filter((file) => {
    const normalized = file.replace(/\\/g, "/");
    return !normalized.startsWith(".git/") && !normalized.startsWith(".tmp/");
  });
}

function scanFile(file, patterns, leaks) {
  const absolute = path.join(repoRoot, file);
  if (!fs.existsSync(absolute) || fs.statSync(absolute).isDirectory()) return;

  const basename = path.basename(file);
  if (blockedFilenames.has(basename)) {
    leaks.push({ file, label: `private evaluation artifact filename: ${basename}` });
    return;
  }

  const buffer = fs.readFileSync(absolute);
  const text = buffer.toString("latin1");
  for (const pattern of patterns) {
    const match = text.match(pattern.re);
    if (match) {
      leaks.push({
        file,
        label: pattern.label,
        sample: match[0].slice(0, 120),
      });
    }
  }
}

const patterns = [...localPathPatterns(), ...secretPatterns()];
const leaks = [];
for (const file of candidateFiles()) scanFile(file, patterns, leaks);

if (leaks.length) {
  console.error("Privacy leak scan failed. Remove or redact these public-file hits:");
  for (const leak of leaks) {
    const sample = leak.sample ? ` (${leak.sample})` : "";
    console.error(`- ${leak.file}: ${leak.label}${sample}`);
  }
  process.exit(1);
}

console.log(`Privacy leak scan passed: ${candidateFiles().length} public candidate files checked.`);
