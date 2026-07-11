import { spawnSync } from "node:child_process";
import path from "node:path";

const cli = path.join("skills", "obsidian-high-recall", "scripts", "obsidian_high_recall.mjs");
const fixtureVault = path.join("docs", "fixtures", "demo-vault");

const proc = spawnSync(process.execPath, [cli, "doctor", "--vault", fixtureVault, "--json"], {
  encoding: "utf8",
  shell: false,
});

if (proc.status !== 0) {
  throw new Error(`doctor command failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
}

let payload;
try {
  payload = JSON.parse(proc.stdout);
} catch (err) {
  throw new Error(`doctor command did not print JSON: ${err.message}\n${proc.stdout}`);
}

if (!payload.privacy?.safeToShare || payload.privacy.rawPathsIncluded || payload.privacy.snippetsIncluded) {
  throw new Error(`doctor output is not marked privacy-safe:\n${proc.stdout}`);
}

if (!payload.vault?.resolved || payload.vault.markdownFiles !== 3) {
  throw new Error(`doctor did not summarize the fixture vault as expected:\n${proc.stdout}`);
}

const unsafePatterns = [
  /[A-Za-z]:\\\\/,
  /[A-Za-z]:\\/,
  /\/Users\//,
  /\/home\//,
  /Embodied AI Data Collection/,
  /Agent Memory Search/,
  /World Models and Simulation/,
];
for (const pattern of unsafePatterns) {
  if (pattern.test(proc.stdout)) {
    throw new Error(`doctor output contained unsafe detail matching ${pattern}:\n${proc.stdout}`);
  }
}

console.log("Doctor smoke passed.");
