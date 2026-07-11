import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const cli = path.join("skills", "obsidian-high-recall", "scripts", "obsidian_high_recall.mjs");
const evalCli = path.join("skills", "obsidian-high-recall", "scripts", "evaluate_recall.mjs");

for (const args of [[], ["help"], ["--help"]]) {
  const proc = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    shell: false,
  });
  if (proc.status !== 0) {
    throw new Error(`Expected help command ${JSON.stringify(args)} to exit 0, got ${proc.status}\n${proc.stderr || proc.stdout}`);
  }
  if (
    !proc.stdout.includes("Usage:") ||
    !proc.stdout.includes("obsidian_high_recall.mjs query") ||
    !proc.stdout.includes("obsidian_high_recall.mjs doctor")
  ) {
    throw new Error(`Help output for ${JSON.stringify(args)} did not include expected usage text.`);
  }
  if (/Could not resolve Obsidian vault/.test(proc.stderr + proc.stdout)) {
    throw new Error(`Help command ${JSON.stringify(args)} attempted to resolve a vault.`);
  }
}

const evalHelp = spawnSync(process.execPath, [evalCli, "--help"], {
  encoding: "utf8",
  shell: false,
});
if (evalHelp.status !== 0) {
  throw new Error(`Expected evaluator help to exit 0, got ${evalHelp.status}\n${evalHelp.stderr || evalHelp.stdout}`);
}
for (const snippet of ["Usage:", "evaluate_recall.mjs", "--backends LIST", "--neighbor-seeds N"]) {
  if (!evalHelp.stdout.includes(snippet)) {
    throw new Error(`Evaluator help output is missing expected snippet: ${snippet}`);
  }
}

const cliReference = fs.readFileSync(path.join("docs", "cli_reference.md"), "utf8");
for (const snippet of [
  "# CLI Reference",
  "obsidian-high-recall",
  "obsidian-high-recall-eval",
  "doctor --json",
  "--backend auto|smart|ohs|both",
  "--profile quick|deep",
  "--neighbor-seeds N",
  "raw_runs.json",
  "Privacy Rules For CLI Use",
]) {
  if (!cliReference.includes(snippet)) {
    throw new Error(`docs/cli_reference.md is missing expected snippet: ${snippet}`);
  }
}

console.log("CLI help smoke passed.");
