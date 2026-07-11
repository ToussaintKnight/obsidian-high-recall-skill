#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const skillDir = path.join(root, "skills", "obsidian-high-recall");
const issues = [];

function relPath(file) {
  return file.replaceAll("\\", "/");
}

function repoPath(rel) {
  return path.join(root, rel);
}

function requireFile(rel) {
  const file = repoPath(rel);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    issues.push(`Missing required file: ${rel}`);
    return "";
  }
  const text = fs.readFileSync(file, "utf8");
  if (!text.trim()) {
    issues.push(`Required file is empty: ${rel}`);
  }
  return text;
}

function parseSimpleYamlBlock(text, rel) {
  const fields = new Map();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) {
      issues.push(`${rel} has unsupported frontmatter line: ${line}`);
      continue;
    }
    const [, key, rawValue] = match;
    fields.set(key, rawValue.replace(/^["']|["']$/g, "").trim());
  }
  return fields;
}

const requiredFiles = [
  "skills/obsidian-high-recall/SKILL.md",
  "skills/obsidian-high-recall/agents/openai.yaml",
  "skills/obsidian-high-recall/references/backend.md",
  "skills/obsidian-high-recall/references/eval_cases.example.json",
  "skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs",
  "skills/obsidian-high-recall/scripts/evaluate_recall.mjs",
  "skills/obsidian-high-recall/scripts/rrf_union.mjs",
];

for (const rel of requiredFiles) {
  requireFile(rel);
}

const skillMd = requireFile("skills/obsidian-high-recall/SKILL.md");
const frontmatter = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
if (!frontmatter) {
  issues.push("SKILL.md must start with YAML frontmatter delimited by ---.");
} else {
  const fields = parseSimpleYamlBlock(frontmatter[1], "SKILL.md");
  const keys = [...fields.keys()].sort();
  const expected = ["description", "name"];
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    issues.push(`SKILL.md frontmatter should only contain name and description, found: ${keys.join(", ")}`);
  }
  if (fields.get("name") !== "obsidian-high-recall") {
    issues.push('SKILL.md frontmatter name must be "obsidian-high-recall".');
  }
  const description = fields.get("description") || "";
  for (const term of ["Obsidian", "Codex", "recall"]) {
    if (!description.toLowerCase().includes(term.toLowerCase())) {
      issues.push(`SKILL.md description should include trigger term "${term}".`);
    }
  }
}

if (skillMd.split(/\r?\n/).length > 500) {
  issues.push("SKILL.md should stay under 500 lines for progressive disclosure.");
}

const requiredSkillMentions = [
  "scripts/obsidian_high_recall.mjs",
  "scripts/evaluate_recall.mjs",
  "references/backend.md",
  "doctor --json",
  "--backend both",
  "--json",
  "rrf-union",
  "Smart Connections",
  "obsidian-hybrid-search",
];

for (const needle of requiredSkillMentions) {
  if (!skillMd.includes(needle)) {
    issues.push(`SKILL.md should mention ${needle}.`);
  }
}

for (const forbidden of ["README.md", "CHANGELOG.md", "CONTRIBUTING.md", "SECURITY.md", "SUPPORT.md"]) {
  const file = path.join(skillDir, forbidden);
  if (fs.existsSync(file)) {
    issues.push(`Skill folder should not include repo-level documentation: ${relPath(path.relative(root, file))}`);
  }
}

const openaiYaml = requireFile("skills/obsidian-high-recall/agents/openai.yaml");
for (const field of ["display_name", "short_description", "default_prompt"]) {
  if (!new RegExp(`^\\s*${field}:\\s*["']?[^\\r\\n"']+["']?\\s*$`, "m").test(openaiYaml)) {
    issues.push(`agents/openai.yaml must define interface.${field}.`);
  }
}
if (!openaiYaml.includes("$obsidian-high-recall")) {
  issues.push("agents/openai.yaml default_prompt should reference $obsidian-high-recall.");
}
if (/TODO|TBD|placeholder/i.test(openaiYaml)) {
  issues.push("agents/openai.yaml should not contain placeholder text.");
}

const backendRef = requireFile("skills/obsidian-high-recall/references/backend.md");
for (const needle of ["obsidian-hybrid-search", "OBSIDIAN_VAULT_PATH", "semantic", "hybrid", "fulltext", "Smart Connections"]) {
  if (!backendRef.includes(needle)) {
    issues.push(`references/backend.md should mention ${needle}.`);
  }
}

const evalCasesText = requireFile("skills/obsidian-high-recall/references/eval_cases.example.json");
try {
  const cases = JSON.parse(evalCasesText);
  if (!Array.isArray(cases) || cases.length < 1) {
    issues.push("references/eval_cases.example.json must be a non-empty array.");
  } else {
    for (const [index, item] of cases.entries()) {
      if (!item || typeof item.id !== "string" || typeof item.query !== "string" || !Array.isArray(item.gold)) {
        issues.push(`references/eval_cases.example.json case ${index} must include id, query, and gold[].`);
      } else if (!item.gold.length || item.gold.some((gold) => typeof gold !== "string" || !gold.trim())) {
        issues.push(`references/eval_cases.example.json case ${index} must include non-empty string gold labels.`);
      }
    }
  }
} catch (error) {
  issues.push(`references/eval_cases.example.json is not valid JSON: ${error.message}`);
}

const packageJson = JSON.parse(requireFile("package.json"));
if (packageJson.bin?.["obsidian-high-recall"] !== "skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs") {
  issues.push("package.json bin.obsidian-high-recall should point at the skill wrapper.");
}
if (packageJson.bin?.["obsidian-high-recall-eval"] !== "skills/obsidian-high-recall/scripts/evaluate_recall.mjs") {
  issues.push("package.json bin.obsidian-high-recall-eval should point at the evaluator.");
}
if (!packageJson.files?.includes("skills/obsidian-high-recall")) {
  issues.push('package.json files must include "skills/obsidian-high-recall".');
}

if (issues.length) {
  throw new Error(`Skill structure smoke failed:\n- ${issues.join("\n- ")}`);
}

console.log("Skill structure smoke passed: SKILL.md, agent metadata, references, scripts, and package hooks checked.");
