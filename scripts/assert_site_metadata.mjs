#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const siteUrl = "https://toussaintknight.github.io/obsidian-high-recall-skill/";
const socialImage = `${siteUrl}marketing/social_preview.png`;
const index = fs.readFileSync(path.join("docs", "index.html"), "utf8");
const robots = fs.readFileSync(path.join("docs", "robots.txt"), "utf8");
const sitemap = fs.readFileSync(path.join("docs", "sitemap.xml"), "utf8");

const requiredIndexSnippets = [
  `<link rel="canonical" href="${siteUrl}">`,
  `<meta name="robots" content="index,follow">`,
  `<meta property="og:url" content="${siteUrl}">`,
  `<meta property="og:image" content="${socialImage}">`,
  `<meta property="og:image:alt"`,
  `<meta name="twitter:card" content="summary_large_image">`,
  `<meta name="twitter:image" content="${socialImage}">`,
  `<script type="application/ld+json">`,
  `"@type": "SoftwareSourceCode"`,
  `"codeRepository": "https://github.com/ToussaintKnight/obsidian-high-recall-skill"`,
  "docs/examples/README.md",
  "Output examples",
  "docs/recipes.md",
  "Usage recipes",
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

console.log("Site metadata smoke passed.");
