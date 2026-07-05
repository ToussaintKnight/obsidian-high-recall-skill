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
const ks = cli.ks;

function parseArgs(argv) {
  const opts = {
    outDir: null,
    casesFile: null,
    vault: null,
    backends: ["smart", "ohs", "rrf-union"],
    ks: [10, 20, 50],
    limit: 80,
    perChannel: 30,
    neighborSeeds: 0,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--cases") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --cases");
      opts.casesFile = argv[i];
    } else if (arg === "--vault") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --vault");
      opts.vault = argv[i];
    } else if (arg === "--backends") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --backends");
      opts.backends = parseList(argv[i]);
    } else if (arg === "--ks") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --ks");
      opts.ks = parseList(argv[i]).map((value) => Number(value));
    } else if (arg === "--limit") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --limit");
      opts.limit = Number(argv[i]);
    } else if (arg === "--per-channel") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --per-channel");
      opts.perChannel = Number(argv[i]);
    } else if (arg === "--neighbor-seeds") {
      i += 1;
      if (!argv[i]) throw new Error("Missing value for --neighbor-seeds");
      opts.neighborSeeds = Number(argv[i]);
    } else if (arg === "-h" || arg === "--help") {
      console.log(`Usage:
  evaluate_recall.mjs [out-dir] [--cases cases.json] [--vault vault-path]
  evaluate_recall.mjs [out-dir] --vault docs/fixtures/demo-vault --cases docs/fixtures/demo_cases.json --backends smart

Cases JSON shape:
  [
    {"id":"example","query":"natural language query","gold":["note-title-or-path-substring"]}
  ]

Options:
  --backends LIST        Comma-separated smart,ohs,rrf-union. Default: smart,ohs,rrf-union.
  --ks LIST              Comma-separated K values. Default: 10,20,50.
  --limit N              Wrapper result limit. Default: 80.
  --per-channel N        Per-channel candidate limit. Default: 30.
  --neighbor-seeds N     Graph-neighbor seeds. Default: 0.`);
      process.exit(0);
    } else if (!opts.outDir) {
      opts.outDir = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }
  validateOptions(opts);
  return opts;
}

function parseList(value) {
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function validateOptions(opts) {
  const allowed = new Set(["smart", "ohs", "rrf-union"]);
  for (const backend of opts.backends) {
    if (!allowed.has(backend)) throw new Error(`Unsupported backend: ${backend}`);
  }
  if (!opts.backends.length) throw new Error("--backends must include at least one backend");
  if (!opts.ks.length || opts.ks.some((k) => !Number.isFinite(k) || k < 1)) {
    throw new Error("--ks must contain positive integers");
  }
  if (!Number.isFinite(opts.limit) || opts.limit < 1) throw new Error("--limit must be positive");
  if (!Number.isFinite(opts.perChannel) || opts.perChannel < 1) throw new Error("--per-channel must be positive");
  if (!Number.isFinite(opts.neighborSeeds) || opts.neighborSeeds < 0) throw new Error("--neighbor-seeds must be non-negative");
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

function runBackend(backend, query, opts) {
  const t0 = Date.now();
  const args = [
    wrapper,
    "query",
    query,
    "--backend",
    backend,
    "--limit",
    String(opts.limit),
    "--per-channel",
    String(opts.perChannel),
    "--neighbor-seeds",
    String(opts.neighborSeeds),
    "--json",
  ];
  if (opts.vault) args.push("--vault", opts.vault);
  const proc = spawnSync(
    "node",
    args,
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

function runCase(backend, query, opts, cache) {
  const key = `${backend}\0${query}`;
  if (cache.has(key)) return cache.get(key);

  let run;
  if (backend === "rrf-union") {
    const smart = runCase("smart", query, opts, cache);
    const ohs = runCase("ohs", query, opts, cache);
    if (smart.error || ohs.error) {
      const error = [
        smart.error ? `smart: ${smart.error}` : null,
        ohs.error ? `ohs: ${ohs.error}` : null,
      ]
        .filter(Boolean)
        .join("\n");
      run = { backend, ms: smart.ms + ohs.ms, error };
    } else {
      run = {
        backend,
        ms: smart.ms + ohs.ms,
        json: makeRrfUnion([smart, ohs]),
      };
    }
  } else {
    run = runBackend(backend, query, opts);
  }

  cache.set(key, run);
  return run;
}

function makeRrfUnion(runs, rrfK = 60) {
  const records = new Map();
  for (const run of runs) {
    const results = run.json?.results || [];
    results.forEach((result, idx) => {
      const rank = idx + 1;
      const key = result.path || result.title || `${run.backend}-${idx}`;
      if (!records.has(key)) {
        records.set(key, {
          ...result,
          channels: [],
          channelRanks: {},
          matchedBy: [],
          rrfScore: 0,
        });
      }
      const rec = records.get(key);
      rec.rrfScore += 1 / (rrfK + rank);
      rec.channels = unique([...(rec.channels || []), run.backend, ...(result.channels || [])]);
      rec.matchedBy = unique([...(rec.matchedBy || []), ...(result.matchedBy || [])]);
      rec.channelRanks = { ...(rec.channelRanks || {}), [run.backend]: rank };
      rec.bestScore = Math.max(Number(rec.bestScore || 0), Number(result.bestScore || result.score || 0));
      rec.bestRank = Math.min(Number(rec.bestRank || rank), Number(result.bestRank || rank));
      rec.snippet ||= result.snippet || null;
      rec.title ||= result.title || null;
    });
  }
  const merged = [...records.values()]
    .sort((a, b) => b.rrfScore - a.rrfScore || (a.bestRank || 999999) - (b.bestRank || 999999))
    .map((result, idx) => ({
      ...result,
      rank: idx + 1,
      recallScore: Number((result.rrfScore * 1000).toFixed(3)),
      rrfScore: Number(result.rrfScore.toFixed(6)),
    }));

  return {
    query: runs[0]?.json?.query || null,
    generatedAt: new Date().toISOString(),
    backend: {
      selected: "rrf-union",
      primary: "smart+ohs",
      package: "derived by evaluator",
    },
    channels: runs.map((run) => ({ channel: run.backend, count: run.json?.results?.length || 0 })),
    results: merged,
    resultCountBeforeLimit: merged.length,
  };
}

function unique(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (!value) continue;
    const key = String(value).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
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
  const cache = new Map();
  for (const backend of cli.backends) {
    const run = runCase(backend, testCase.query, cli, cache);
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
fs.writeFileSync(path.join(outDir, "metrics.csv"), `${rows.join("\n")}\n`, "utf8");

const summaryK = ks.includes(20) ? 20 : ks[0];
console.log(JSON.stringify({ outDir, backends: cli.backends, ks, metrics: metrics.filter((m) => m.k === summaryK) }, null, 2));
