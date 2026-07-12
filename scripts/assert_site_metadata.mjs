#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://toussaintknight.github.io/obsidian-high-recall-skill/";
const socialImage = `${siteUrl}marketing/social_preview.png`;
const index = fs.readFileSync(path.join("docs", "index.html"), "utf8");
const robots = fs.readFileSync(path.join("docs", "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join("docs", "sitemap.xml"), "utf8");
const llms = fs.readFileSync(path.join("docs", "llms.txt"), "utf8");

const requiredIndexSnippets = [
  `<link rel="canonical" href="${siteUrl}">`,
  `<link rel="alternate" type="text/plain" title="llms.txt" href="${siteUrl}llms.txt">`,
  `<meta name="robots" content="index,follow">`,
  `<meta name="keywords" content="Obsidian, Obsidian MD, local-first, semantic search, vector search, hybrid search, RAG, local RAG, AI memory, agent memory, Codex skill, Smart Connections, PKM, knowledge management, research tools">`,
  `<meta property="og:url" content="${siteUrl}">`,
  `<meta property="og:image" content="${socialImage}">`,
  `<meta property="og:image:alt"`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:image" content="${socialImage}">`,
  `<script type="application/ld+json">`,
  `"@type": "SoftwareSourceCode"`,
  `"codeRepository": "https://github.com/ToussaintKnight/obsidian-high-recall-skill"`,
  `"keywords": ["Obsidian", "Obsidian MD", "local-first", "semantic search", "vector search", "hybrid search", "RAG", "local RAG", "AI memory", "agent memory", "Codex skill", "Smart Connections", "PKM", "knowledge management", "research tools"]`,
  "docs/faq.md",
  "FAQ",
  "docs/examples/README.md",
  "Output examples",
  "docs/recipes.md",
  "Usage recipes",
  "https://codespaces.new/ToussaintKnight/obsidian-high-recall-skill?quickstart=1",
  "Open in Codespaces",
  "llms.txt",
];

const missingIndex = requiredIndexSnippets.filter((snippet) => !index.includes(snippet));
if (missingIndex.length) {
  throw new Error(`Share page metadata is missing required snippets:\n- ${missingIndex.join("\n- ")}`);
}

if (!fs.existsSync(path.join("docs", "marketing", "social_preview.png"))) {
  throw new Error("Share page social preview image is missing.");
}

if (!robots.includes(`Sitemap: ${siteUrl}sitemap.xml`)) {
  throw new Error("robots.txt does not point to the project sitemap.");
}

if (!sitemap.includes(`<loc>${siteUrl}</loc>`)) {
  throw new Error("sitemap.xml does not include the canonical project page.");
}

if (!sitemap.includes(`<loc>${siteUrl}llms.txt</loc>`)) {
  throw new Error("sitemap.xml does not include llms.txt.");
}

const requiredLlmsSnippets = [
  "# Obsidian High Recall",
  "Local-first high-recall search for Obsidian vaults",
  "## Quick Start",
  "## Discovery Terms",
  "semantic search",
  "agent memory",
  "npm test",
  "## Privacy",
  "Raw notes stay local.",
  "## Feedback Paths",
  "tester_feedback.yml",
  "benchmark_report.yml",
];
const missingLlms = requiredLlmsSnippets.filter((snippet) => !llms.includes(snippet));
if (missingLlms.length) {
  throw new Error(`llms.txt is missing required snippets:\n- ${missingLlms.join("\n- ")}`);
}

console.log("Site metadata smoke passed.");
