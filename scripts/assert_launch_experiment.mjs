import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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
  "npm run github:metrics -- --collect",
  "../metrics/collection.md",
  "Conversion Metrics",
  "Star conversion",
  "Tester conversion",
  "Decision Rules",
  "After-Action Template",
  "community_launch_posts.md",
  "../metrics/launch_baseline.md",
]);

const metricsCollection = read(path.join("docs", "metrics", "collection.md"));
requireIncludes("docs/metrics/collection.md", metricsCollection, [
  "# Launch Metrics Collection",
  "npm run github:metrics",
  "npm run github:metrics -- --json",
  "npm run github:metrics -- --collect",
  "Baseline",
  "24h",
  "7d",
  "Star conversion",
  "Clone count is diagnostic",
]);

const marketingReadme = read(path.join("docs", "marketing", "README.md"));
requireIncludes("docs/marketing/README.md", marketingReadme, [
  "launch_experiment.md",
  "landscape_positioning.md",
  "../metrics/collection.md",
  "Launch experiment plan",
  "Landscape positioning and reply kit",
  "npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo",
  "Conversion Ladder",
  "Star/watch the repo",
]);

const launchPlaybook = read(path.join("docs", "LAUNCH.md"));
requireIncludes("docs/LAUNCH.md", launchPlaybook, [
  "marketing/launch_experiment.md",
  "marketing/landscape_positioning.md",
  "metrics/collection.md",
  "npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo",
  "npm run github:metrics -- --collect",
  "npm run launch:check",
  "GitHub views, not only clones",
]);

const rootReadme = read("README.md");
requireIncludes("README.md", rootReadme, [
  "Launch experiment plan",
  "docs/marketing/launch_experiment.md",
  "docs/marketing/landscape_positioning.md",
  "docs/metrics/collection.md",
  "npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo",
  "Early tester path",
  "star/watch the repo",
]);

const zhReadme = read("README.zh-CN.md");
requireIncludes("README.zh-CN.md", zhReadme, [
  "Launch experiment plan",
  "docs/marketing/launch_experiment.md",
  "docs/marketing/landscape_positioning.md",
  "docs/metrics/collection.md",
  "npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo",
  "早期 tester 路径",
  "star/watch 这个 repo",
]);

const communityPosts = read(path.join("docs", "marketing", "community_launch_posts.md"));
requireIncludes("docs/marketing/community_launch_posts.md", communityPosts, [
  "Try the safe no-vault demo first",
  "npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo",
  "For full fixture validation",
]);

const landscape = read(path.join("docs", "marketing", "landscape_positioning.md"));
requireIncludes("docs/marketing/landscape_positioning.md", landscape, [
  "# Landscape Positioning And Reply Kit",
  "Adjacent Conversations",
  "Reply Principles",
  "Copy-Ready Replies",
  "Obsidian agent hosts and plugins",
  "Smart Connections and semantic search users",
  "Local-first AI and privacy RAG",
  "npx --yes github:ToussaintKnight/obsidian-high-recall-skill demo",
  "Do not ask for raw notes",
  "npm run github:metrics -- --collect",
  "community_launch_posts.md",
]);

const site = read(path.join("docs", "index.html"));
requireIncludes("docs/index.html", site, [
  "try one broad real-vault query",
  "star/watch the repo",
]);

const packageJson = JSON.parse(read("package.json"));
if (packageJson.scripts?.["github:metrics"] !== "node scripts/github_launch_metrics.mjs") {
  throw new Error("package.json must expose github:metrics for repeatable launch metric collection.");
}

const metricsPlanProc = spawnSync(process.execPath, ["scripts/github_launch_metrics.mjs", "--json"], {
  encoding: "utf8",
  maxBuffer: 1024 * 1024,
});
if (metricsPlanProc.status !== 0) {
  throw new Error(`github_launch_metrics --json failed:\n${metricsPlanProc.stderr || metricsPlanProc.stdout}`);
}
const metricsPlan = JSON.parse(metricsPlanProc.stdout);
if (metricsPlan.repo !== "ToussaintKnight/obsidian-high-recall-skill") {
  throw new Error(`Launch metrics plan has wrong repo: ${metricsPlan.repo}`);
}
const planText = JSON.stringify(metricsPlan);
for (const required of ["stars", "unique views", "tester-feedback issues"]) {
  if (!planText.includes(required)) {
    throw new Error(`Launch metrics plan missing signal: ${required}`);
  }
}

console.log("Launch experiment smoke passed.");
