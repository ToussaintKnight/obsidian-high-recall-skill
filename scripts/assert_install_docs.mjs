import fs from "node:fs";
import path from "node:path";

const install = fs.readFileSync(path.join("docs", "install.md"), "utf8");
const requiredInstallSnippets = [
  "# Installation Guide",
  "Node.js 20",
  "npm test",
  "node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs help",
  "docs/fixtures/demo-vault",
  "doctor --vault",
  "github:ToussaintKnight/obsidian-high-recall-skill",
  "cache permission error",
  "$skill-installer",
  "$obsidian-high-recall",
  "--backend auto",
  "Windows Notes",
  "macOS/Linux Notes",
  "Public redacted output examples",
  "Output schema and privacy flags",
];

for (const snippet of requiredInstallSnippets) {
  if (!install.includes(snippet)) {
    throw new Error(`docs/install.md is missing expected snippet: ${snippet}`);
  }
}

const readme = fs.readFileSync("README.md", "utf8");
for (const snippet of [
  "[docs/install.md](docs/install.md)",
  "Install guide",
]) {
  if (!readme.includes(snippet)) {
    throw new Error(`README.md is missing install guide link/snippet: ${snippet}`);
  }
}

const zhReadme = fs.readFileSync("README.zh-CN.md", "utf8");
if (!zhReadme.includes("[docs/install.md](docs/install.md)")) {
  throw new Error("README.zh-CN.md is missing docs/install.md link.");
}

const testingGuide = fs.readFileSync(path.join("docs", "testing_guide.md"), "utf8");
if (!testingGuide.includes("[install.md](install.md)")) {
  throw new Error("docs/testing_guide.md is missing install.md link.");
}

const troubleshooting = fs.readFileSync(path.join("docs", "troubleshooting.md"), "utf8");
for (const snippet of [
  "npm Or npx Cache Permission Errors",
  "npm_config_cache",
  "avoid `npx .`",
]) {
  if (!troubleshooting.includes(snippet)) {
    throw new Error(`docs/troubleshooting.md is missing npm cache troubleshooting snippet: ${snippet}`);
  }
}

console.log("Install docs smoke passed.");
