#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repo = "ToussaintKnight/obsidian-high-recall-skill";
const [owner, name] = repo.split("/");
const sourceFile = path.join("docs", "community", "discussion_seeds.md");

function parseDiscussions(markdown) {
  return markdown
    .split(/\n(?=## \d+\. )/u)
    .filter((block) => /^## \d+\. /u.test(block.trim()))
    .map((block) => {
      const title = block.match(/^## \d+\. (.+)$/mu)?.[1]?.trim();
      const preferredCategory = block.match(/^Category:\s*(.+)$/mu)?.[1]?.trim();
      const body = block
        .replace(/^## \d+\. .+\n/u, "")
        .replace(/^Category:\s*.+\n+/mu, "")
        .trim();
      if (!title) throw new Error(`Could not parse discussion title from block:\n${block}`);
      if (!preferredCategory) throw new Error(`Discussion "${title}" has no Category line.`);
      if (!body.includes("Privacy guardrail:")) {
        throw new Error(`Discussion "${title}" is missing a privacy guardrail.`);
      }
      return { title, preferredCategory, body };
    });
}

const discussions = parseDiscussions(fs.readFileSync(sourceFile, "utf8"));

function quote(value) {
  return `'${String(value).replace(/'/gu, "'\\''")}'`;
}

function commandText() {
  const lines = [
    "# Authenticate first:",
    "gh auth status",
    "",
    "# Review structured discussion seed plan:",
    "npm run github:discussions -- --json",
    "",
    "# Create missing discussions:",
    "npm run github:discussions -- --apply",
    "",
    "# Discussion seeds:",
  ];

  for (const discussion of discussions) {
    lines.push(
      `# - ${discussion.title}`,
      `#   preferred category: ${discussion.preferredCategory}`,
      `#   source: ${sourceFile}`,
      `#   gh api graphql <createDiscussion mutation> --field title=${quote(discussion.title)}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

function plan() {
  return {
    repo,
    sourceFile,
    count: discussions.length,
    discussions,
  };
}

function runGh(args, options = {}) {
  const proc = spawnSync("gh", args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
  if (proc.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
  }
  return proc;
}

function queryDiscussionState() {
  const query = `
query($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    id
    discussionCategories(first: 25) {
      nodes { id name }
    }
    discussions(first: 100) {
      nodes { title }
    }
  }
}`;
  const proc = runGh([
    "api",
    "graphql",
    "-f",
    `query=${query}`,
    "-F",
    `owner=${owner}`,
    "-F",
    `name=${name}`,
  ]);
  const parsed = JSON.parse(proc.stdout);
  const repository = parsed.data?.repository;
  if (!repository?.id) throw new Error(`Could not load repository discussion state for ${repo}.`);
  return repository;
}

function pickCategory(categories, preferred) {
  const exact = categories.find((category) => category.name.toLowerCase() === preferred.toLowerCase());
  if (exact) return exact;
  const general = categories.find((category) => category.name.toLowerCase() === "general");
  return general || categories[0];
}

function apply() {
  runGh(["auth", "status"]);
  const state = queryDiscussionState();
  const categories = state.discussionCategories?.nodes || [];
  if (!categories.length) {
    throw new Error(`No Discussion categories found for ${repo}. Enable GitHub Discussions first.`);
  }

  const existingTitles = new Set((state.discussions?.nodes || []).map((discussion) => discussion.title));
  const mutation = `
mutation($repositoryId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
  createDiscussion(input: {repositoryId: $repositoryId, categoryId: $categoryId, title: $title, body: $body}) {
    discussion { title url }
  }
}`;

  const created = [];
  const skipped = [];

  for (const discussion of discussions) {
    if (existingTitles.has(discussion.title)) {
      skipped.push(discussion.title);
      continue;
    }
    const category = pickCategory(categories, discussion.preferredCategory);
    if (!category?.id) throw new Error(`Could not choose Discussion category for ${discussion.title}.`);
    const proc = runGh([
      "api",
      "graphql",
      "-f",
      `query=${mutation}`,
      "-F",
      `repositoryId=${state.id}`,
      "-F",
      `categoryId=${category.id}`,
      "-f",
      `title=${discussion.title}`,
      "-f",
      `body=${`${discussion.body}\n\n---\nSource: ${sourceFile}`}`,
    ]);
    const response = JSON.parse(proc.stdout);
    created.push({
      title: response.data?.createDiscussion?.discussion?.title || discussion.title,
      url: response.data?.createDiscussion?.discussion?.url,
      category: category.name,
    });
  }

  console.log(JSON.stringify({ repo, created, skipped }, null, 2));
}

const args = new Set(process.argv.slice(2));

if (args.has("--json")) {
  console.log(JSON.stringify(plan(), null, 2));
} else if (args.has("--apply")) {
  apply();
} else {
  process.stdout.write(commandText());
}
