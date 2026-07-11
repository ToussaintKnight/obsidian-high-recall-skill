#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = pkg.version;
const changelog = fs.readFileSync("CHANGELOG.md", "utf8");
const releasePath = path.join("docs", "releases", `v${version}.md`);

if (!fs.existsSync(releasePath)) {
  throw new Error(`Missing release notes for package version ${version}: ${releasePath}`);
}

const releaseNotes = fs.readFileSync(releasePath, "utf8");
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
];
const missingRelease = requiredReleaseSnippets.filter((snippet) => !releaseNotes.includes(snippet));
if (missingRelease.length) {
  throw new Error(`${releasePath} is missing required snippets:\n- ${missingRelease.join("\n- ")}`);
}

if (!Array.isArray(pkg.files) || !pkg.files.includes("CHANGELOG.md")) {
  throw new Error("package.json files must include CHANGELOG.md.");
}

console.log(`Release docs smoke passed for v${version}.`);
