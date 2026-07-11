import fs from "node:fs";
import path from "node:path";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required launch experiment file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, text, required) {
  const missing = required.filter((snippet) => !text.includes(snippet));
  if (missing.length) {
    throw new Error(`${file} is missing required launch experiment text:\n- ${missing.join("\n- ")}`);
  }
}

const experimentPath = path.join("docs", "marketing", "launch_experiment.md");
const experiment = read(experimentPath);

requireIncludes(experimentPath, experiment, [
  "# Launch Experiment Plan",
  "many clone events, almost no human page views, and zero stars",
  "20 serious users",
  "Obsidian Forum Share & Showcase",
  "Pre-Post Checklist",
  "npm test",
  "npm run privacy:scan",
  "npm run site:check",
  "npm run community:check",
  "Measurement Window",
  "GitHub traffic API",
  "gh api repos/ToussaintKnight/obsidian-high-recall-skill/traffic/views",
  "Conversion Metrics",
  "Star conversion",
  "Tester conversion",
  "Decision Rules",
  "After-Action Template",
  "community_launch_posts.md",
  "../metrics/launch_baseline.md",
]);

const marketingReadme = read(path.join("docs", "marketing", "README.md"));
requireIncludes("docs/marketing/README.md", marketingReadme, [
  "launch_experiment.md",
  "Launch experiment plan",
]);

const launchPlaybook = read(path.join("docs", "LAUNCH.md"));
requireIncludes("docs/LAUNCH.md", launchPlaybook, [
  "marketing/launch_experiment.md",
  "npm run launch:check",
  "GitHub views, not only clones",
]);

const rootReadme = read("README.md");
requireIncludes("README.md", rootReadme, [
  "Launch experiment plan",
  "docs/marketing/launch_experiment.md",
]);

const zhReadme = read("README.zh-CN.md");
requireIncludes("README.zh-CN.md", zhReadme, [
  "Launch experiment plan",
  "docs/marketing/launch_experiment.md",
]);

console.log("Launch experiment smoke passed.");
