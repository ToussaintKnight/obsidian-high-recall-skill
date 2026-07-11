#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

function gitFiles() {
  const proc = spawnSync("git", ["ls-files", "-z"], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20,
  });
  if (proc.status !== 0) {
    throw new Error(`git ls-files failed:\n${proc.stderr || proc.stdout}`);
  }
  return proc.stdout.split("\0").filter(Boolean);
}

function stripFencedCode(markdown) {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  return lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return "";
      }
      return inFence ? "" : line;
    })
    .join("\n");
}

function isExternalTarget(target) {
  return (
    /^#/u.test(target) ||
    /^[a-z][a-z0-9+.-]*:/iu.test(target) ||
    target.startsWith("//")
  );
}

function normalizeTarget(rawTarget) {
  let target = rawTarget.trim();
  if (!target || isExternalTarget(target)) return null;
  if (target.startsWith("<") && target.endsWith(">")) target = target.slice(1, -1).trim();
  target = target.split("#")[0].trim();
  if (!target) return null;
  const titleMatch = target.match(/^([^"' ]+)(?:\s+["'][^"']*["'])$/u);
  if (titleMatch) target = titleMatch[1];
  return decodeURIComponent(target);
}

function targetExists(fromFile, target) {
  if (path.isAbsolute(target)) return false;
  const absolute = path.resolve(repoRoot, path.dirname(fromFile), target);
  const relative = path.relative(repoRoot, absolute);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) return false;
  return fs.existsSync(absolute);
}

const files = gitFiles().filter((file) => /\.md$/iu.test(file));
const failures = [];
const markdownLinkPattern = /!?\[[^\]\n]*\]\(([^)\n]+)\)/gu;

for (const file of files) {
  const text = stripFencedCode(fs.readFileSync(path.join(repoRoot, file), "utf8"));
  for (const match of text.matchAll(markdownLinkPattern)) {
    const target = normalizeTarget(match[1]);
    if (!target) continue;
    if (!targetExists(file, target)) {
      failures.push(`${file}: missing relative link target ${match[1].trim()}`);
    }
  }
}

if (failures.length) {
  console.error("Markdown link check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Markdown link check passed: ${files.length} markdown files checked.`);
