import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const cli = path.join("skills", "obsidian-high-recall", "scripts", "obsidian_high_recall.mjs");
const fixtureVault = path.join("docs", "fixtures", "demo-vault");

function runJson(args) {
  const proc = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    shell: false,
    maxBuffer: 1024 * 1024 * 10,
  });
  if (proc.status !== 0) {
    throw new Error(`Command failed (${proc.status}): ${args.join(" ")}\n${proc.stderr || proc.stdout}`);
  }
  try {
    return JSON.parse(proc.stdout);
  } catch (err) {
    throw new Error(`Command did not return JSON for args ${args.join(" ")}:\n${proc.stdout}\n${err.message}`);
  }
}

const pack = runJson([
  "query",
  "data collection for embodied AI",
  "--vault",
  fixtureVault,
  "--backend",
  "smart",
  "--limit",
  "5",
  "--json",
]);

for (const field of [
  "schemaVersion",
  "query",
  "generatedAt",
  "vault",
  "db",
  "privacy",
  "backend",
  "index",
  "expansions",
  "profile",
  "searchPlan",
  "channels",
  "results",
  "resultCountBeforeLimit",
]) {
  if (!(field in pack)) throw new Error(`Recall pack is missing top-level field: ${field}`);
}

if (pack.schemaVersion !== "0.1") throw new Error(`Unexpected recall pack schemaVersion: ${pack.schemaVersion}`);
if (pack.privacy?.safeToShare !== false) throw new Error("Recall pack must declare privacy.safeToShare=false.");
if (pack.privacy?.rawQueryIncluded !== true) throw new Error("Recall pack must declare rawQueryIncluded=true.");
if (!Array.isArray(pack.results) || pack.results.length === 0) throw new Error("Fixture recall pack should include results.");

for (const field of [
  "path",
  "title",
  "tags",
  "snippet",
  "bestScore",
  "bestRank",
  "channels",
  "matchedBy",
  "channelRanks",
  "links",
  "backlinks",
  "urls",
  "anchors",
  "graphReasons",
  "recallScore",
]) {
  if (!(field in pack.results[0])) throw new Error(`Recall result is missing field: ${field}`);
}

const doctor = runJson(["doctor", "--vault", fixtureVault, "--json"]);
if (doctor.schemaVersion !== "0.1") throw new Error(`Unexpected doctor schemaVersion: ${doctor.schemaVersion}`);
if (doctor.privacy?.safeToShare !== true) throw new Error("Doctor report must declare privacy.safeToShare=true.");
for (const field of ["runtime", "vault", "smart", "ohs", "recommendations"]) {
  if (!(field in doctor)) throw new Error(`Doctor report is missing top-level field: ${field}`);
}

const contract = fs.readFileSync(path.join("docs", "output_contract.md"), "utf8");
for (const snippet of [
  "# Output Contract",
  "Current schema version: `0.1`",
  "`obsidian-high-recall query",
  "\"safeToShare\": false",
  "Result Shape",
  "Ranking Semantics",
  "Doctor Report",
  "Public Sharing Rules",
  "raw_runs.json",
]) {
  if (!contract.includes(snippet)) {
    throw new Error(`docs/output_contract.md is missing expected snippet: ${snippet}`);
  }
}

console.log("Output contract smoke passed.");
