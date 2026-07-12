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
    !proc.stdout.includes("obsidian_high_recall.mjs demo") ||
    !proc.stdout.includes("obsidian_high_recall.mjs query") ||
    !proc.stdout.includes("obsidian_high_recall.mjs doctor")
  ) {
    throw new Error(`Help output for ${JSON.stringify(args)} did not include expected usage text.`);
  }
  if (/Could not resolve Obsidian vault/.test(proc.stderr + proc.stdout)) {
    throw new Error(`Help command ${JSON.stringify(args)} attempted to resolve a vault.`);
  }
}

const demoProc = spawnSync(process.execPath, [cli, "demo", "--json"], {
  encoding: "utf8",
  shell: false,
  maxBuffer: 1024 * 1024 * 4,
});
if (demoProc.status !== 0) {
  throw new Error(`Expected demo command to exit 0, got ${demoProc.status}\n${demoProc.stderr || demoProc.stdout}`);
}
const demoPack = JSON.parse(demoProc.stdout);
if (demoPack.backend?.selected !== "smart") {
  throw new Error(`Demo command should default to smart backend, got ${demoPack.backend?.selected}`);
}
if (!demoPack.results?.some((result) => result.title === "Embodied AI Data Collection")) {
  throw new Error("Demo command did not return the expected public fixture result.");
}
if (demoPack.privacy?.safeToShare !== true) {
  throw new Error("Demo query pack should be safe to share because it uses only the redacted public fixture.");
}
if (demoPack.vault !== "<local-fixture-vault-path>" || demoPack.db !== "<local-ohs-db-path>") {
  throw new Error("Demo query pack should redact local fixture and database paths.");
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
  "obsidian-high-recall demo",
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
