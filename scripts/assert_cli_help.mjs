import { spawnSync } from "node:child_process";
import path from "node:path";

const cli = path.join("skills", "obsidian-high-recall", "scripts", "obsidian_high_recall.mjs");

for (const args of [[], ["help"], ["--help"]]) {
  const proc = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    shell: false,
  });
  if (proc.status !== 0) {
    throw new Error(`Expected help command ${JSON.stringify(args)} to exit 0, got ${proc.status}\n${proc.stderr || proc.stdout}`);
  }
  if (!proc.stdout.includes("Usage:") || !proc.stdout.includes("obsidian_high_recall.mjs query")) {
    throw new Error(`Help output for ${JSON.stringify(args)} did not include expected usage text.`);
  }
  if (/Could not resolve Obsidian vault/.test(proc.stderr + proc.stdout)) {
    throw new Error(`Help command ${JSON.stringify(args)} attempted to resolve a vault.`);
  }
}

console.log("CLI help smoke passed.");
