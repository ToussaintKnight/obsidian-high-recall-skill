#!/usr/bin/env node
import fs from "node:fs";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required positioning file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, text, required) {
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) {
    throw new Error(`${file} is missing required text:\n- ${missing.join("\n- ")}`);
  }
}

const comparison = read("docs/comparison.md");
requireIncludes("docs/comparison.md", comparison, [
  "# Comparison And Fit",
  "not a replacement",
  "portable recall layer",
  "Obsidian built-in search",
  "Smart Connections",
  "obsidian-hybrid-search",
  "Vault-native agent clients",
  "General RAG scripts",
  "--backend auto --limit 120",
  "--backend both --limit 200",
  "Privacy Boundary",
  "benchmark/reporting_guide.md",
]);

const positioning = read("docs/positioning.md");
requireIncludes("docs/positioning.md", positioning, [
  "comparison.md",
  "How It Relates To Existing Tools",
  "Smart Connections",
  "obsidian-hybrid-search",
]);

const readme = read("README.md");
requireIncludes("README.md", readme, [
  "docs/positioning.md",
  "docs/comparison.md",
  "Comparison and decision guide",
]);

const zhReadme = read("README.zh-CN.md");
requireIncludes("README.zh-CN.md", zhReadme, [
  "docs/positioning.md",
  "docs/comparison.md",
  "Comparison and decision guide",
]);

const marketing = read("docs/marketing/README.md");
requireIncludes("docs/marketing/README.md", marketing, [
  "landscape_positioning.md",
  "../comparison.md",
  "../faq.md",
  "../recipes.md",
  "../examples/README.md",
  "Landscape positioning and reply kit",
  "Comparison and fit guide",
  "FAQ",
  "Usage recipes",
  "Public output examples",
]);

const landscape = read("docs/marketing/landscape_positioning.md");
requireIncludes("docs/marketing/landscape_positioning.md", landscape, [
  "complementary recall layer",
  "not a replacement",
  "Smart Connections",
  "obsidian-hybrid-search",
  "Codex and terminal-agent workflows",
  "Do not claim this replaces Smart Connections",
  "privacy-safe setup reports",
]);

console.log("Positioning docs smoke passed: comparison guide and public entry links checked.");
