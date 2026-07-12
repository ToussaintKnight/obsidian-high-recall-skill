#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";

const repo = "ToussaintKnight/obsidian-high-recall-skill";
const description = "Local-first high-recall search for Obsidian vaults, usable from Codex and CLI.";
const homepage = "https://toussaintknight.github.io/obsidian-high-recall-skill/";
const topics = [
  "obsidian",
  "obsidian-md",
  "local-first",
  "search",
  "semantic-search",
  "vector-search",
  "hybrid-search",
  "rag",
  "local-rag",
  "pkm",
  "knowledge-management",
  "codex",
  "codex-skill",
  "smart-connections",
  "ai-agents",
  "ai-memory",
  "agent-memory",
  "retrieval",
  "research-tools",
  "local-ai",
];

function parseLabels(text) {
  return text
    .split(/\n(?=- name: )/u)
    .map((block) => {
      const name = block.match(/^- name:\s*(.+)$/mu)?.[1]?.trim();
      const color = block.match(/^  color:\s*(.+)$/mu)?.[1]?.trim();
      const descriptionText = block.match(/^  description:\s*(.+)$/mu)?.[1]?.trim();
      if (!name || !color || !descriptionText) return null;
      return { name, color, description: descriptionText };
    })
    .filter(Boolean);
}

const labels = parseLabels(fs.readFileSync(".github/labels.yml", "utf8"));

function quote(value) {
  return `'${String(value).replace(/'/gu, "'\\''")}'`;
}

function commandText() {
  const lines = [
    "# Authenticate first:",
    "gh auth status",
    "",
    "# Repo about box and feature toggles:",
    [
      "gh api -X PATCH",
      `repos/${repo}`,
      `-f description=${quote(description)}`,
      `-f homepage=${quote(homepage)}`,
      "-F has_issues=true",
      "-F has_discussions=true",
      "-F has_wiki=false",
    ].join(" "),
    "",
    "# Topics:",
    [
      "gh api -X PUT",
      `repos/${repo}/topics`,
      "-H 'Accept: application/vnd.github+json'",
      ...topics.map((topic) => `-f names[]=${quote(topic)}`),
    ].join(" "),
    "",
    "# Labels:",
  ];

  for (const label of labels) {
    lines.push(
      `gh label create ${quote(label.name)} --repo ${repo} --color ${quote(label.color)} --description ${quote(label.description)} || gh label edit ${quote(label.name)} --repo ${repo} --color ${quote(label.color)} --description ${quote(label.description)}`,
    );
  }

  lines.push(
    "",
    "# Manual GitHub UI checks:",
    "# - Set social preview to docs/marketing/social_preview.png.",
    "# - Confirm GitHub Pages serves the docs/ site.",
    "# - Confirm security advisories are enabled.",
    "# - Confirm the v0.1.0 release is visible.",
    "# - Confirm the issue chooser and tester discussion links resolve.",
    "# - Run npm run github:discussions -- --apply and confirm seeded Discussions exist.",
  );

  return `${lines.join("\n")}\n`;
}

function plan() {
  return {
    repo,
    description,
    homepage,
    topics,
    labels,
    manualChecks: [
      "Set social preview to docs/marketing/social_preview.png.",
      "Confirm GitHub Pages serves the docs/ site.",
      "Confirm security advisories are enabled.",
      "Confirm the v0.1.0 release is visible.",
      "Confirm the issue chooser and tester discussion links resolve.",
      "Run npm run github:discussions -- --apply and confirm seeded Discussions exist.",
    ],
  };
}

function runGh(args, options = {}) {
  const proc = spawnSync("gh", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 10,
    ...options,
  });
  if (proc.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
  }
  return proc;
}

function apply() {
  runGh(["auth", "status"]);
  runGh([
    "api",
    "-X",
    "PATCH",
    `repos/${repo}`,
    "-f",
    `description=${description}`,
    "-f",
    `homepage=${homepage}`,
    "-F",
    "has_issues=true",
    "-F",
    "has_discussions=true",
    "-F",
    "has_wiki=false",
  ]);
  runGh([
    "api",
    "-X",
    "PUT",
    `repos/${repo}/topics`,
    "-H",
    "Accept: application/vnd.github+json",
    ...topics.flatMap((topic) => ["-f", `names[]=${topic}`]),
  ]);

  for (const label of labels) {
    const create = spawnSync("gh", [
      "label",
      "create",
      label.name,
      "--repo",
      repo,
      "--color",
      label.color,
      "--description",
      label.description,
    ], {
      encoding: "utf8",
      shell: process.platform === "win32",
      maxBuffer: 1024 * 1024,
    });
    if (create.status !== 0) {
      runGh([
        "label",
        "edit",
        label.name,
        "--repo",
        repo,
        "--color",
        label.color,
        "--description",
        label.description,
      ]);
    }
  }

  console.log(`GitHub setup applied for ${repo}. Manual UI checks still remain; see docs/community/github_setup_commands.md.`);
}

const args = new Set(process.argv.slice(2));

if (args.has("--json")) {
  console.log(JSON.stringify(plan(), null, 2));
} else if (args.has("--apply")) {
  apply();
} else {
  process.stdout.write(commandText());
}
