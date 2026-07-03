#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const skillDir = path.resolve(__dirname, "..");
const wrapper = path.join(skillDir, "scripts", "obsidian_high_recall.mjs");
const cli = parseArgs(process.argv.slice(2));
const outDir = path.resolve(cli.outDir || "obsidian_recall_eval");
fs.mkdirSync(outDir, { recursive: true });

const defaultCases = [
  {
    id: "example-topic",
    query: "broad natural language query for this topic",
    gold: ["Known-Relevant-Note-Title"],
  },
];

const cases = cli.casesFile ? loadCases(cli.casesFile) : defaultCases;
const ks = [10, 20, 50];

function parseArgs(argv) {
  const opts = { outDir: null, casesFile: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--cases") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --cases");
      opts.casesFile = argv[i];
    } else if (arg === "-h" || arg === "--help") {
      console.log(`Usage:
  evaluate_recall.mjs [out-dir] [--cases cases.json]

Cases JSON shape:
  [
    {"id":"example","query":"natural language query","gold":["note-title-or-path-substring"]}
  ]`);
      process.exit(0);
    } else if (!opts.outDir) {
      opts.outDir = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  return opts;
}

function loadCases(filePath) {
  const resolved = path.resolve(filePath);
  const parsed = JSON.parse(fs.readFileSync(resolved, "utf8"));
  if (!Array.isArray(parsed)) throw new Error("--cases file must contain a JSON array");
  for (const item of parsed) {
    if (!item?.id || !item?.query || !Array.isArray(item?.gold) || !item.gold.length) {
      throw new Error("Each case must include id, query, and a non-empty gold array");
    }
  }
  return parsed;
}

function runCase(backend, query) {
  const t0 = Date.now();
  const proc = spawnSync(
    "node",
    [
      wrapper,
      "query",
      query,
      "--backend",
      backend,
      "--limit",
      "80",
      "--per-channel",
      "30",
      "--neighbor-seeds",
      "0",
      "--json",
    ],
    {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 100,
      shell: false,
    },
  );
  const ms = Date.now() - t0;
  if (proc.status !== 0) {
    return { backend, ms, error: (proc.stderr || proc.stdout).slice(0, 2000) };
  }
  const stdout = proc.stdout.trim();
  const start = stdout.indexOf("{");
  const json = JSON.parse(stdout.slice(start));
  return { backend, ms, json };
}

function score(results, gold, k) {
  const top = results.slice(0, k);
  const paths = results.map((r) => r.path || "");
  const ranks = {};
  for (const g of gold) {
    const idx = paths.findIndex((p) => p.includes(g));
    ranks[g] = idx >= 0 ? idx + 1 : null;
  }
  const relevantRetrieved = gold.filter((g) => ranks[g] && ranks[g] <= k).length;
  const precision = relevantRetrieved / Math.max(1, top.length);
  const recall = relevantRetrieved / gold.length;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const firstRank = Math.min(...Object.values(ranks).filter(Boolean));
  const mrr = Number.isFinite(firstRank) ? 1 / firstRank : 0;
  return { precision, recall, f1, relevantRetrieved, retrieved: top.length, goldTotal: gold.length, mrr, ranks };
}

const raw = [];
const metrics = [];

for (const testCase of cases) {
  for (const backend of ["smart", "ohs"]) {
    const run = runCase(backend, testCase.query);
    raw.push({ case: testCase.id, backend, query: testCase.query, gold: testCase.gold, ...run });
    if (run.error) {
      metrics.push({ case: testCase.id, backend, k: 0, ms: run.ms, error: run.error });
      continue;
    }
    const results = run.json.results || [];
    for (const k of ks) {
      const s = score(results, testCase.gold, k);
      metrics.push({
        case: testCase.id,
        backend,
        k,
        ms: run.ms,
        precision: s.precision,
        recall: s.recall,
        f1: s.f1,
        mrr: s.mrr,
        relevantRetrieved: s.relevantRetrieved,
        retrieved: s.retrieved,
        goldTotal: s.goldTotal,
        ranks: s.ranks,
        channels: run.json.channels,
      });
    }
  }
}

fs.writeFileSync(path.join(outDir, "raw_runs.json"), JSON.stringify(raw, null, 2), "utf8");
fs.writeFileSync(path.join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2), "utf8");

const header = ["case", "backend", "k", "ms", "precision", "recall", "f1", "mrr", "relevantRetrieved", "retrieved", "goldTotal"];
const rows = [header.join(",")];
for (const m of metrics.filter((x) => x.k)) {
  rows.push(
    header
      .map((h) => {
        const value = m[h];
        return typeof value === "string" ? JSON.stringify(value) : value;
      })
      .join(","),
  );
}
fs.writeFileSync(path.join(outDir, "metrics.csv"), rows.join("\n"), "utf8");

console.log(JSON.stringify({ outDir, metrics: metrics.filter((m) => m.k === 20) }, null, 2));
