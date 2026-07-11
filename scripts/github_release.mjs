#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repo = "ToussaintKnight/obsidian-high-recall-skill";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const tag = `v${pkg.version}`;
const releaseNotes = path.join("docs", "releases", `${tag}.md`);

function plan() {
  return {
    repo,
    version: pkg.version,
    tag,
    title: tag,
    releaseNotes,
    prerequisites: [
      "local commits are pushed",
      "CI is green",
      "gh auth status succeeds",
      "npm test passes",
      "npm run privacy:scan passes",
      "npm run release:check passes",
    ],
  };
}

function commandText() {
  return `# Authenticate and verify local release gates:
gh auth status
npm test
npm run privacy:scan
npm run release:check

# Inspect existing release:
gh release view ${tag} --repo ${repo}

# Create release if missing:
gh release create ${tag} --repo ${repo} --title ${tag} --notes-file ${releaseNotes} --latest
`;
}

function run(command, args, options = {}) {
  const proc = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
  if (proc.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
  }
  return proc;
}

function apply() {
  if (!fs.existsSync(releaseNotes)) {
    throw new Error(`Missing release notes: ${releaseNotes}`);
  }

  run("gh", ["auth", "status"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["test"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "privacy:scan"]);
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "release:check"]);

  const existing = spawnSync("gh", ["release", "view", tag, "--repo", repo, "--json", "url,tagName,name"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024,
  });

  if (existing.status === 0) {
    console.log(existing.stdout.trim());
    return;
  }

  const created = run("gh", [
    "release",
    "create",
    tag,
    "--repo",
    repo,
    "--title",
    tag,
    "--notes-file",
    releaseNotes,
    "--latest",
  ]);
  process.stdout.write(created.stdout);
}

const args = new Set(process.argv.slice(2));

if (args.has("--json")) {
  console.log(JSON.stringify(plan(), null, 2));
} else if (args.has("--apply")) {
  apply();
} else {
  process.stdout.write(commandText());
}
