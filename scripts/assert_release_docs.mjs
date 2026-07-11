#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;
const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
const releasePath = path.join("docs", "releases", `v${version}.md`);
const publishReleasePath = path.join("docs", "releases", "publish_release.md");

if (!fs.existsSync(releasePath)) {
  throw new Error(`Missing release notes for package version ${version}: ${releasePath}`);
}
if (!fs.existsSync(publishReleasePath)) {
  throw new Error(`Missing GitHub release publishing guide: ${publishReleasePath}`);
}

const releaseNotes = fs.readFileSync(releasePath, "utf8");
const publishRelease = fs.readFileSync(publishReleasePath, "utf8");
const requiredChangelogSnippets = [
  "# Changelog",
  "## Unreleased",
  `## ${version}`,
];
const missingChangelog = requiredChangelogSnippets.filter((snippet) => !changelog.includes(snippet));
if (missingChangelog.length) {
  throw new Error(`CHANGELOG.md is missing required snippets:\n- ${missingChangelog.join("\n- ")}`);
}

const requiredReleaseSnippets = [
  `# v${version}`,
  "First public release",
  "Privacy Notes",
  "Limitations",
  "docs/npm_publish.md",
];
const missingRelease = requiredReleaseSnippets.filter((snippet) => !releaseNotes.includes(snippet));
if (missingRelease.length) {
  throw new Error(`${releasePath} is missing required snippets:\n- ${missingRelease.join("\n- ")}`);
}

if (!Array.isArray(pkg.files) || !pkg.files.includes("CHANGELOG.md")) {
  throw new Error("package.json files must include CHANGELOG.md.");
}

if (pkg.scripts?.["github:release"] !== "node scripts/github_release.mjs") {
  throw new Error("package.json must expose github:release for repeatable release publishing.");
}

const requiredPublishSnippets = [
  "# Publish GitHub Release",
  "npm run github:release",
  "npm run github:release -- --json",
  "npm run github:release -- --apply",
  "npm test",
  "npm run privacy:scan",
  "npm run release:check",
  `gh release create v${version}`,
  `docs/releases/v${version}.md`,
];
const missingPublish = requiredPublishSnippets.filter((snippet) => !publishRelease.includes(snippet));
if (missingPublish.length) {
  throw new Error(`${publishReleasePath} is missing required snippets:\n- ${missingPublish.join("\n- ")}`);
}

const releasePlanProc = spawnSync(process.execPath, ["scripts/github_release.mjs", "--json"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024,
});
if (releasePlanProc.status !== 0) {
  throw new Error(`github_release --json failed:\n${releasePlanProc.stderr || releasePlanProc.stdout}`);
}
const releasePlan = JSON.parse(releasePlanProc.stdout);
if (releasePlan.repo !== "ToussaintKnight/obsidian-high-recall-skill") {
  throw new Error(`GitHub release plan has wrong repo: ${releasePlan.repo}`);
}
if (releasePlan.tag !== `v${version}` || releasePlan.releaseNotes !== releasePath) {
  throw new Error(`GitHub release plan is not aligned with package version ${version}.`);
}

console.log(`Release docs smoke passed for v${version}.`);
