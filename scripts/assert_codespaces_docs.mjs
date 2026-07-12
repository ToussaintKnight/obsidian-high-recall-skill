#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing Codespaces artifact: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, text, snippets) {
  const missing = snippets.filter((snippet) => !text.includes(snippet));
  if (missing.length) {
    throw new Error(`${file} is missing Codespaces snippets:\n- ${missing.join("\n- ")}`);
  }
}

const codespacesUrl = "https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1";
const devcontainerPath = path.join(".devcontainer", "devcontainer.json");
const devcontainer = JSON.parse(read(devcontainerPath));
if (devcontainer.name !== "Obsidian High Recall") {
  throw new Error(".devcontainer/devcontainer.json should name the project.");
}
if (!String(devcontainer.image || "").includes("javascript-node:1-20")) {
  throw new Error(".devcontainer/devcontainer.json should use a Node.js 20 devcontainer image.");
}
if (!String(devcontainer.postCreateCommand || "").includes("npm ci")) {
  throw new Error(".devcontainer/devcontainer.json postCreateCommand should install dependencies.");
}
if (!String(devcontainer.postCreateCommand || "").includes("npm run demo:query")) {
  throw new Error(".devcontainer/devcontainer.json postCreateCommand should run the public demo query.");
}

const codespaces = read(path.join("docs", "codespaces.md"));
requireIncludes("docs/codespaces.md", codespaces, [
  "# Codespaces Demo",
  "[![Open in GitHub Codespaces]",
  codespacesUrl,
  "zero-private-vault smoke test",
  "Codespaces cannot access your local Obsidian vault",
  "npm test",
  "npm run demo:query",
  "docs/fixtures/demo-vault",
  "Smart Connections `.smart-env`",
  "install.md",
]);

const readme = read("README.md");
requireIncludes("README.md", readme, [
  "Codespaces",
  "[![Open in GitHub Codespaces]",
  codespacesUrl,
  "[docs/codespaces.md](docs/codespaces.md)",
  "zero-private-vault",
]);

const zhReadme = read("README.zh-CN.md");
requireIncludes("README.zh-CN.md", zhReadme, [
  "Codespaces",
  "[![Open in GitHub Codespaces]",
  codespacesUrl,
  "[docs/codespaces.md](docs/codespaces.md)",
  "zero-private-vault",
]);

const install = read(path.join("docs", "install.md"));
requireIncludes("docs/install.md", install, [
  "Run In GitHub Codespaces",
  codespacesUrl,
  "docs/codespaces.md",
  "Codespaces cannot access your local Obsidian vault",
]);

const contributing = read("CONTRIBUTING.md");
requireIncludes("CONTRIBUTING.md", contributing, [
  "npm run codespaces:check",
  "docs/codespaces.md",
]);

const site = read(path.join("docs", "index.html"));
requireIncludes("docs/index.html", site, [
  codespacesUrl,
  "Open in Codespaces",
]);

console.log("Codespaces docs smoke passed.");
