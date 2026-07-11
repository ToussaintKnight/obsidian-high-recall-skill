import fs from "node:fs";
import path from "node:path";

const recipes = fs.readFileSync(path.join("docs", "recipes.md"), "utf8");
const requiredRecipes = [
  "# Usage Recipes",
  "Fast daily recall",
  "Maximum recall",
  "Privacy-Safe Bug Report",
  "Benchmark Your Own Vault",
  "Tune Read Burden",
  "--backend auto --limit 120",
  "--backend both --limit 200 --per-channel 80",
  "$obsidian-high-recall",
  "privacy.safeToShare: false",
  "doctor --json",
  "evaluate_recall.mjs",
  "Precision@K, Recall@K, F1, MRR",
  "Do not publish real-vault JSON recall packs",
  "examples/README.md",
  "benchmark/reporting_guide.md",
];

for (const snippet of requiredRecipes) {
  if (!recipes.includes(snippet)) {
    throw new Error(`docs/recipes.md is missing expected snippet: ${snippet}`);
  }
}

const readme = fs.readFileSync("README.md", "utf8");
for (const snippet of ["Usage recipes", "[docs/recipes.md](docs/recipes.md)"]) {
  if (!readme.includes(snippet)) {
    throw new Error(`README.md is missing recipes link/snippet: ${snippet}`);
  }
}

const zhReadme = fs.readFileSync("README.zh-CN.md", "utf8");
if (!zhReadme.includes("[docs/recipes.md](docs/recipes.md)")) {
  throw new Error("README.zh-CN.md is missing docs/recipes.md link.");
}

const install = fs.readFileSync(path.join("docs", "install.md"), "utf8");
if (!install.includes("[recipes.md](recipes.md)")) {
  throw new Error("docs/install.md is missing recipes.md link.");
}

console.log("Recipes docs smoke passed.");
