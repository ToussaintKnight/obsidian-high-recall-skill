import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const cli = path.join("skills", "obsidian-high-recall", "scripts", "obsidian_high_recall.mjs");
const fixtureVault = path.join("docs", "fixtures", "demo-vault");
const queryExamplePath = path.join("docs", "examples", "fixture_query_pack.redacted.json");
const doctorExamplePath = path.join("docs", "examples", "doctor_report.fixture.json");
const examplesReadmePath = path.join("docs", "examples", "README.md");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function runJson(args) {
  const proc = spawnSync(process.execPath, [cli, ...args], {
    encoding: "utf8",
    shell: false,
    maxBuffer: 1024 * 1024 * 10,
  });
  if (proc.status !== 0) {
    throw new Error(`Command failed (${proc.status}): ${args.join(" ")}\n${proc.stderr || proc.stdout}`);
  }
  return JSON.parse(proc.stdout);
}

function assertNoLocalLeak(file) {
  const text = fs.readFileSync(file, "utf8");
  const blocked = [
    /[A-Za-z]:\\Users\\/,
    /[A-Za-z]:\\(?:Projects|Playground|Vaults|Obsidian|OneDrive|Dropbox)\\/,
    /\/(?:Users|home)\//,
    /file:\/\//,
    /ghp_[A-Za-z0-9_]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /sk-[A-Za-z0-9_-]{20,}/,
  ];
  for (const re of blocked) {
    const match = text.match(re);
    if (match) throw new Error(`${file} contains non-public local/secret-looking text: ${match[0]}`);
  }
}

const queryExample = readJson(queryExamplePath);
const doctorExample = readJson(doctorExamplePath);

for (const file of [queryExamplePath, doctorExamplePath, examplesReadmePath]) {
  if (!fs.existsSync(file)) throw new Error(`Missing public example file: ${file}`);
  assertNoLocalLeak(file);
}

for (const field of ["schemaVersion", "query", "generatedAt", "vault", "db", "privacy", "backend", "index", "channels", "results", "resultCountBeforeLimit"]) {
  if (!(field in queryExample)) throw new Error(`Query example is missing field: ${field}`);
}
if (queryExample.schemaVersion !== "0.1") throw new Error("Query example schemaVersion must be 0.1.");
if (queryExample.privacy?.safeToShare !== false) throw new Error("Query example must keep privacy.safeToShare=false.");
if (queryExample.vault !== "<local-fixture-vault-path>") throw new Error("Query example must redact vault path.");
if (queryExample.db !== "<local-ohs-db-path>") throw new Error("Query example must redact db path.");
if (queryExample.results?.[0]?.title !== "Embodied AI Data Collection") throw new Error("Query example first result should match fixture expected result.");
if (!queryExample.channels?.some((channel) => channel.channel === "lexical")) throw new Error("Query example should include lexical channel.");

for (const field of ["schemaVersion", "generatedAt", "privacy", "runtime", "vault", "smart", "ohs", "recommendations"]) {
  if (!(field in doctorExample)) throw new Error(`Doctor example is missing field: ${field}`);
}
if (doctorExample.privacy?.safeToShare !== true) throw new Error("Doctor example must declare privacy.safeToShare=true.");
if (doctorExample.vault?.markdownFiles !== 3) throw new Error("Doctor fixture example should report 3 markdown files.");
if (doctorExample.ohs?.dbPathRedacted !== true) throw new Error("Doctor fixture example must keep dbPathRedacted=true.");

const liveQuery = runJson([
  "query",
  "data collection for embodied AI robot demonstrations",
  "--vault",
  fixtureVault,
  "--backend",
  "smart",
  "--limit",
  "3",
  "--json",
]);
if (liveQuery.backend?.selected !== queryExample.backend.selected) throw new Error("Query example backend.selected drifted from live fixture output.");
if (liveQuery.backend?.primary !== queryExample.backend.primary) throw new Error("Query example backend.primary drifted from live fixture output.");
if (liveQuery.results?.[0]?.title !== queryExample.results?.[0]?.title) throw new Error("Query example first result drifted from live fixture output.");
if (liveQuery.channels?.[0]?.channel !== queryExample.channels?.[0]?.channel) throw new Error("Query example first channel drifted from live fixture output.");

const liveDoctor = runJson(["doctor", "--vault", fixtureVault, "--json"]);
if (liveDoctor.privacy?.safeToShare !== doctorExample.privacy.safeToShare) throw new Error("Doctor example privacy flag drifted from live fixture output.");
if (liveDoctor.vault?.markdownFiles !== doctorExample.vault.markdownFiles) throw new Error("Doctor example markdown file count drifted from live fixture output.");
if (liveDoctor.smart?.modelKey !== doctorExample.smart.modelKey) throw new Error("Doctor example Smart model key drifted from live fixture output.");

const readme = fs.readFileSync(examplesReadmePath, "utf8");
for (const snippet of [
  "# Public Output Examples",
  "fixture_query_pack.redacted.json",
  "doctor_report.fixture.json",
  "privacy.safeToShare: false",
  "output_contract.md",
  "fixture_walkthrough.md",
]) {
  if (!readme.includes(snippet)) throw new Error(`docs/examples/README.md is missing expected snippet: ${snippet}`);
}

console.log("Public examples smoke passed.");
