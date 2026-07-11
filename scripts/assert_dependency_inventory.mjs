import fs from "node:fs";
import path from "node:path";

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, text, required) {
  const missing = required.filter((snippet) => !text.includes(snippet));
  if (missing.length) {
    throw new Error(`${file} is missing required dependency-inventory text:\n- ${missing.join("\n- ")}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const rootPackage = packageLock.packages?.[""] || {};

for (const field of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
  if (packageJson[field] && Object.keys(packageJson[field]).length > 0) {
    throw new Error(`package.json has ${field}; update docs/dependency_inventory.md before adding committed dependencies.`);
  }
  if (rootPackage[field] && Object.keys(rootPackage[field]).length > 0) {
    throw new Error(`package-lock root has ${field}; update docs/dependency_inventory.md before adding committed dependencies.`);
  }
}

const packageEntries = Object.keys(packageLock.packages || {});
if (packageEntries.length !== 1 || packageEntries[0] !== "") {
  throw new Error("package-lock.json includes installed dependency entries; update dependency inventory and this gate.");
}

const source = read(path.join("skills", "obsidian-high-recall", "scripts", "obsidian_high_recall.mjs"));
requireIncludes("obsidian_high_recall.mjs", source, [
  "const SMART_MODEL_KEY = \"TaylorAI/bge-micro-v2\"",
  "obsidian-hybrid-search",
  "@huggingface/transformers@4.2.0",
  "Codex\", \"obsidian-high-recall\"",
  "hf-cache",
  "LOCALAPPDATA",
  "XDG_CACHE_HOME",
]);

const inventory = read(path.join("docs", "dependency_inventory.md"));
requireIncludes("docs/dependency_inventory.md", inventory, [
  "# Dependency And Network Inventory",
  "no committed runtime dependencies",
  "Runtime Download Points",
  "GitHub-backed run",
  "OHS fallback",
  "Smart vector search",
  "@huggingface/transformers@4.2.0",
  "TaylorAI/bge-micro-v2",
  "obsidian-hybrid-search",
  "Local Write Locations",
  "Codex/obsidian-high-recall/<vault-hash>.db",
  "node-runtime/hf-cache",
  "npm_config_cache",
  ".smart-env",
  "Dependency Review Checklist",
  "privacy_threat_model.md",
]);

for (const file of ["README.md", "README.zh-CN.md", "SECURITY.md", path.join("docs", "privacy_threat_model.md"), path.join("docs", "faq.md")]) {
  const text = read(file);
  if (!text.includes("dependency_inventory.md")) {
    throw new Error(`${file} should link to docs/dependency_inventory.md.`);
  }
}

console.log("Dependency inventory smoke passed.");
