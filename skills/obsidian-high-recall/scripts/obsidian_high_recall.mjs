#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const COMMANDS = new Set(["query", "demo", "status", "reindex", "detect", "doctor", "help"]);
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(SCRIPT_DIR, "..", "..", "..");
const DEFAULT_SNIPPET_LENGTH = 320;
const SMART_MODEL_KEY = "TaylorAI/bge-micro-v2";
const OUTPUT_SCHEMA_VERSION = "0.1";
const DEMO_QUERY = "data collection for embodied AI robot demonstrations";

function parseArgs(argv) {
  const opts = {
    command: "query",
    vault: null,
    db: null,
    limit: 120,
    perChannel: 80,
    snippetLength: DEFAULT_SNIPPET_LENGTH,
    neighborSeeds: 25,
    json: false,
    force: false,
    reindex: false,
    autoIndex: true,
    rerank: false,
    profile: "quick",
    backend: "auto",
    backendExplicit: false,
    demo: false,
    extra: [],
    queryParts: [],
  };

  const args = [...argv];
  if (args.length === 0) {
    opts.command = "help";
    return opts;
  }
  if (args[0] && COMMANDS.has(args[0])) {
    opts.command = args.shift();
  }

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    const next = () => {
      if (i + 1 >= args.length) throw new Error(`Missing value for ${a}`);
      i += 1;
      return args[i];
    };

    if (a === "--vault") opts.vault = next();
    else if (a === "--db") opts.db = next();
    else if (a === "--limit") opts.limit = Number(next());
    else if (a === "--per-channel") opts.perChannel = Number(next());
    else if (a === "--snippet-length") opts.snippetLength = Number(next());
    else if (a === "--neighbor-seeds") opts.neighborSeeds = Number(next());
    else if (a === "--json") opts.json = true;
    else if (a === "--force") opts.force = true;
    else if (a === "--reindex") opts.reindex = true;
    else if (a === "--no-auto-index") opts.autoIndex = false;
    else if (a === "--rerank") opts.rerank = true;
    else if (a === "--profile") opts.profile = next();
    else if (a === "--deep") opts.profile = "deep";
    else if (a === "--backend") {
      opts.backend = next();
      opts.backendExplicit = true;
    }
    else if (a === "--extra") opts.extra.push(...splitExtra(next()));
    else if (a === "-h" || a === "--help") {
      printHelp();
      process.exit(0);
    } else {
      opts.queryParts.push(a);
    }
  }

  opts.query = opts.queryParts.join(" ").trim();
  if (!Number.isFinite(opts.limit) || opts.limit < 1) opts.limit = 120;
  if (!Number.isFinite(opts.perChannel) || opts.perChannel < 1) opts.perChannel = 80;
  if (!Number.isFinite(opts.snippetLength) || opts.snippetLength < 80) opts.snippetLength = DEFAULT_SNIPPET_LENGTH;
  if (!Number.isFinite(opts.neighborSeeds) || opts.neighborSeeds < 0) opts.neighborSeeds = 0;
  if (!["quick", "deep"].includes(opts.profile)) throw new Error("--profile must be quick or deep");
  if (!["auto", "smart", "ohs", "both"].includes(opts.backend)) throw new Error("--backend must be auto, smart, ohs, or both");
  return opts;
}

function splitExtra(value) {
  return value
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function printHelp() {
  console.log(`Usage:
  obsidian_high_recall.mjs help
  obsidian_high_recall.mjs detect [--vault PATH] [--db PATH]
  obsidian_high_recall.mjs doctor [--vault PATH] [--json]
  obsidian_high_recall.mjs demo [--json]
  obsidian_high_recall.mjs status [--vault PATH] [--db PATH] [--json]
  obsidian_high_recall.mjs reindex [--vault PATH] [--db PATH] [--force]
  obsidian_high_recall.mjs query "query text" [--vault PATH] [--backend auto] [--limit 120] [--json]

Options:
  --vault PATH          Absolute path to an Obsidian vault.
  --db PATH             Optional OHS database path.
  --extra TEXT           Add comma/semicolon-separated query expansions.
  --rerank              Enable obsidian-hybrid-search reranker for hybrid mode.
  --profile quick|deep  quick is default; deep runs more fan-out calls.
  --deep                Shortcut for --profile deep.
  --backend auto|smart|ohs|both
                       auto prefers Smart Connections vectors when present.
  --neighbor-seeds N    Add links/backlinks from top N results as recall candidates.
  --no-auto-index       Do not auto-reindex when the DB is empty.
`);
}

function defaultDemoVault() {
  const fixture = path.join(PACKAGE_ROOT, "docs", "fixtures", "demo-vault");
  if (!fs.existsSync(fixture)) {
    throw new Error("Public fixture vault is missing from the package. Reinstall or clone the repository, then retry demo.");
  }
  return fixture;
}

function resolveVault(cliVault) {
  const candidates = [];
  if (cliVault) candidates.push(cliVault);
  if (process.env.OBSIDIAN_VAULT_PATH) candidates.push(process.env.OBSIDIAN_VAULT_PATH);
  candidates.push(...vaultsFromObsidianConfig());
  if (fs.existsSync(path.join(process.cwd(), ".obsidian"))) candidates.push(process.cwd());

  for (const candidate of candidates) {
    if (!candidate) continue;
    const resolved = path.resolve(candidate);
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) return resolved;
  }
  throw new Error("Could not resolve Obsidian vault. Pass --vault or set OBSIDIAN_VAULT_PATH.");
}

function vaultsFromObsidianConfig() {
  const configs = [];
  if (process.env.APPDATA) {
    configs.push(path.join(process.env.APPDATA, "obsidian", "obsidian.json"));
    configs.push(path.join(process.env.APPDATA, "Obsidian", "obsidian.json"));
  }
  if (process.platform !== "win32") {
    configs.push(path.join(os.homedir(), "Library", "Application Support", "obsidian", "obsidian.json"));
    configs.push(path.join(os.homedir(), ".config", "obsidian", "obsidian.json"));
  }

  const found = [];
  for (const cfg of configs) {
    try {
      if (!fs.existsSync(cfg)) continue;
      const parsed = JSON.parse(fs.readFileSync(cfg, "utf8"));
      const vaults = Object.values(parsed.vaults || {});
      vaults.sort((a, b) => Number(Boolean(b.open)) - Number(Boolean(a.open)) || (b.ts || 0) - (a.ts || 0));
      for (const v of vaults) if (v?.path) found.push(v.path);
    } catch {
      // Ignore malformed app config and keep searching.
    }
  }
  return found;
}

function defaultDbPath(vault) {
  const hash = crypto.createHash("sha1").update(path.resolve(vault).toLowerCase()).digest("hex").slice(0, 12);
  const base =
    process.env.LOCALAPPDATA ||
    process.env.XDG_CACHE_HOME ||
    path.join(os.homedir(), ".cache");
  return path.join(base, "Codex", "obsidian-high-recall", `${hash}.db`);
}

function ensureDirFor(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function npxBin() {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function runOhs(vault, db, args, { json = false, quiet = false } = {}) {
  ensureDirFor(db);
  const env = { ...process.env, OBSIDIAN_VAULT_PATH: vault };
  env.NODE_OPTIONS = `${env.NODE_OPTIONS || ""} --max-old-space-size=8192`.trim();
  const fullArgs = ["-y", "obsidian-hybrid-search", "--db", db, ...args];
  const proc = spawnSync(npxBin(), fullArgs, {
    cwd: vault,
    env,
    shell: process.platform === "win32",
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 80,
  });
  if (proc.error) throw proc.error;
  if (proc.status !== 0) {
    const details = [proc.stderr, proc.stdout].filter(Boolean).join("\n").trim();
    throw new Error(`obsidian-hybrid-search failed (${proc.status}): ${details}`);
  }
  if (!json) return proc.stdout.trim();
  try {
    return parseJsonOutput(proc.stdout);
  } catch (err) {
    if (!quiet) console.error(proc.stdout);
    throw err;
  }
}

function parseJsonOutput(text) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const starts = [trimmed.indexOf("["), trimmed.indexOf("{")].filter((n) => n >= 0);
  if (!starts.length) throw new Error("No JSON object found in command output.");
  return JSON.parse(trimmed.slice(Math.min(...starts)));
}

function status(vault, db) {
  return runOhs(vault, db, ["status", "--recent", "--errors"], { json: true });
}

function reindex(vault, db, force) {
  return runOhs(vault, db, ["reindex", ...(force ? ["--force"] : [])]);
}

function ensureIndex(vault, db, opts) {
  if (opts.reindex) {
    reindex(vault, db, true);
    return status(vault, db);
  }
  const current = status(vault, db);
  if (opts.autoIndex && (!current || !current.total || !current.chunks)) {
    reindex(vault, db, true);
    return status(vault, db);
  }
  return current;
}

const LEXICON = [
  {
    re: /\u5177\u8eab|embodied|physical\s*ai|robot|\u673a\u5668\u4eba|humanoid|gr00t/i,
    queries: [
      "\u5177\u8eab\u667a\u80fd \u7269\u7406AI \u673a\u5668\u4eba \u57fa\u7840\u6a21\u578b",
      "embodied AI physical AI robotics robot learning",
      "robot foundation model humanoid robot manipulation policy",
      "robot simulation sim-to-real embodiment",
    ],
    terms: ["\u5177\u8eab", "\u5177\u8eab\u667a\u80fd", "\u7269\u7406AI", "\u673a\u5668\u4eba", "embodied AI", "physical AI", "robotics", "robot learning", "humanoid", "GR00T"],
    tags: ["\u5177\u8eab\u667a\u80fd", "embodied AI", "robotics", "\u7269\u7406AI", "\u673a\u5668\u4eba"],
  },
  {
    re: /\u6570\u636e\u91c7\u96c6|\u91c7\u96c6|\u6570\u636e\u96c6|dataset|data\s*collection|demonstration|teleoperation|trajectory|\u8f68\u8ff9|\u9065\u64cd\u4f5c/i,
    queries: [
      "\u6570\u636e\u91c7\u96c6 \u6570\u636e\u96c6 \u6f14\u793a\u6570\u636e \u8f68\u8ff9 \u9065\u64cd\u4f5c",
      "data collection dataset demonstrations trajectories teleoperation",
      "imitation learning real-world data sensor logs robot data engine",
    ],
    terms: ["\u6570\u636e\u91c7\u96c6", "\u91c7\u96c6", "\u6570\u636e\u96c6", "\u6f14\u793a", "\u8f68\u8ff9", "\u9065\u64cd\u4f5c", "data collection", "dataset", "demonstrations", "teleoperation", "trajectories"],
    tags: ["\u6570\u636e\u96c6", "\u673a\u5668\u4eba"],
  },
  {
    re: /\u4e16\u754c\u6a21\u578b|world\s*model|\u4eff\u771f|simulation|sim-to-real|sim2real|isaac|omniverse/i,
    queries: [
      "\u4e16\u754c\u6a21\u578b \u4eff\u771f \u57fa\u5ea7 \u4ea4\u4e92\u5f0f\u73af\u5883 sim-to-real",
      "world model simulation environment simulator sim-to-real",
      "Isaac Sim Omniverse embodied simulation synthetic data",
    ],
    terms: ["\u4e16\u754c\u6a21\u578b", "\u4eff\u771f", "sim-to-real", "simulation", "world model", "Isaac", "Omniverse"],
    tags: ["\u4e16\u754c\u6a21\u578b", "\u4eff\u771f", "3D\u751f\u6210"],
  },
  {
    re: /\u7a7a\u95f4|spatial|3d|\u89c6\u89c9|vision|vlm|\u611f\u77e5|perception/i,
    queries: [
      "\u7a7a\u95f4\u667a\u80fd 3D \u89c6\u89c9 \u611f\u77e5 VLM",
      "spatial intelligence 3D perception vision-language model",
    ],
    terms: ["\u7a7a\u95f4\u667a\u80fd", "3D", "\u89c6\u89c9", "\u611f\u77e5", "spatial", "perception", "VLM"],
    tags: ["3D\u751f\u6210", "computer-vision"],
  },
];

const STOPWORDS = new Set([
  "for",
  "the",
  "and",
  "or",
  "of",
  "to",
  "in",
  "on",
  "a",
  "an",
  "with",
  "from",
  "about",
]);

function unique(values, limit = Infinity) {
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const normalized = String(value || "").trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(normalized);
    if (out.length >= limit) break;
  }
  return out;
}

function expandQuery(query, extras = []) {
  const cleaned = query.replace(/\bfor\b/gi, " ").replace(/\s+/g, " ").trim();
  const tokenTerms = query
    .split(/[\s,;|/\\()[\]{}"'`，。；、：]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && !STOPWORDS.has(s.toLowerCase()));

  const queries = [query, cleaned, ...extras];
  const terms = [...tokenTerms];
  const tags = [];

  for (const entry of LEXICON) {
    if (entry.re.test(query)) {
      queries.push(...entry.queries);
      terms.push(...entry.terms);
      tags.push(...entry.tags);
    }
  }

  return {
    semanticQueries: unique(queries, 24),
    fulltextTerms: unique(terms, 36),
    tags: unique(tags, 12),
  };
}

function searchBatch(vault, db, opts, mode, queries, extraArgs = []) {
  const args = [
    "search",
    "--mode",
    mode,
    "--threshold",
    "0",
    "--limit",
    String(opts.perChannel),
    "--snippet-length",
    String(opts.snippetLength),
    "--anchors",
    "--json",
    ...extraArgs,
  ];
  if (opts.rerank && mode === "hybrid") args.push("--rerank");
  args.push(...queries);
  const result = runOhs(vault, db, args, { json: true });
  return Array.isArray(result) ? result : [];
}

function search(vault, db, opts, mode, queries, extraArgs = []) {
  const cleanQueries = unique(queries).filter(Boolean);
  if (!cleanQueries.length) return [];

  const batchSize =
    mode === "semantic" || mode === "hybrid"
      ? opts.profile === "quick"
        ? 4
        : 1
      : opts.profile === "quick"
        ? 24
        : 6;
  const batches = chunk(cleanQueries, batchSize);
  const out = [];
  for (const batch of batches) {
    try {
      out.push(...searchBatch(vault, db, opts, mode, batch, extraArgs));
    } catch (err) {
      const message = String(err?.message || err);
      if (batch.length > 1 && /heap|memory|Allocation failed|failed/i.test(message)) {
        for (const single of batch) out.push(...searchBatch(vault, db, opts, mode, [single], extraArgs));
      } else {
        throw err;
      }
    }
  }
  return dedupeRawResults(out);
}

function chunk(values, size) {
  const out = [];
  for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size));
  return out;
}

function dedupeRawResults(results) {
  const out = [];
  const seen = new Set();
  for (const result of results) {
    const key = result?.path ? `${result.path}|${result.semanticAnchor?.charStart ?? ""}|${result.bm25Anchor?.charStart ?? ""}` : JSON.stringify(result);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(result);
  }
  return out;
}

function tagSearch(vault, db, opts, tag, query) {
  return search(vault, db, opts, "semantic", [query], ["--tag", tag]);
}

function mergeResults(channelResults, neighborSeeds) {
  const records = new Map();
  const channelWeights = {
    "smart-source": 6,
    "smart-block": 6,
    lexical: 3,
    tag: 5,
    title: 4,
    fulltext: 3,
    semantic: 2,
    hybrid: 2,
    "graph-neighbor": 0.5,
  };

  function get(pathValue) {
    if (!records.has(pathValue)) {
      records.set(pathValue, {
        path: pathValue,
        title: null,
        tags: [],
        snippet: null,
        bestScore: 0,
        bestRank: Number.POSITIVE_INFINITY,
        channels: new Set(),
        matchedBy: new Set(),
        channelRanks: {},
        links: new Set(),
        backlinks: new Set(),
        urls: new Set(),
        anchors: [],
        graphReasons: [],
      });
    }
    return records.get(pathValue);
  }

  for (const { channel, results } of channelResults) {
    results.forEach((result, idx) => {
      if (!result?.path) return;
      const rec = get(result.path);
      rec.title ||= result.title || null;
      rec.snippet ||= result.snippet || null;
      rec.bestScore = Math.max(rec.bestScore, Number(result.score || 0));
      rec.bestRank = Math.min(rec.bestRank, Number(result.rank || idx + 1));
      rec.channels.add(channel);
      rec.channelRanks[channel] = Math.min(rec.channelRanks[channel] || Number.POSITIVE_INFINITY, Number(result.rank || idx + 1));
      for (const item of result.matchedBy || []) rec.matchedBy.add(item);
      for (const tag of result.parsedTags || result.tags || []) rec.tags.push(tag);
      for (const link of [...(result.links || []), ...(result.markdownLinks || [])]) rec.links.add(link);
      for (const backlink of [...(result.backlinks || []), ...(result.markdownBacklinks || [])]) rec.backlinks.add(backlink);
      for (const url of result.urls || []) rec.urls.add(url);
      for (const anchor of result.previewAnchors || []) rec.anchors.push(anchor);
      if (result.semanticAnchor) rec.anchors.push(result.semanticAnchor);
      if (result.bm25Anchor) rec.anchors.push(result.bm25Anchor);
    });
  }

  const seeds = [...records.values()]
    .sort((a, b) => rankScore(b, channelWeights) - rankScore(a, channelWeights) || a.bestRank - b.bestRank)
    .slice(0, neighborSeeds);

  for (const seed of seeds) {
    for (const neighbor of [...seed.links, ...seed.backlinks]) {
      if (!neighbor || records.has(neighbor)) continue;
      const rec = get(neighbor);
      rec.channels.add("graph-neighbor");
      rec.graphReasons.push(`linked with ${seed.path}`);
    }
  }

  return [...records.values()]
    .map((rec) => ({
      path: rec.path,
      title: rec.title,
      tags: unique(rec.tags),
      snippet: rec.snippet,
      bestScore: Number(rec.bestScore.toFixed(6)),
      bestRank: Number.isFinite(rec.bestRank) ? rec.bestRank : null,
      channels: [...rec.channels],
      matchedBy: [...rec.matchedBy],
      channelRanks: Object.fromEntries(Object.entries(rec.channelRanks).map(([k, v]) => [k, Number.isFinite(v) ? v : null])),
      links: [...rec.links],
      backlinks: [...rec.backlinks],
      urls: [...rec.urls],
      anchors: uniqueAnchors(rec.anchors).slice(0, 4),
      graphReasons: rec.graphReasons,
      recallScore: Number(rankScore(rec, channelWeights).toFixed(3)),
    }))
    .sort((a, b) => b.recallScore - a.recallScore || (a.bestRank || 999999) - (b.bestRank || 999999) || b.bestScore - a.bestScore);
}

function rankScore(rec, weights) {
  let score = 0;
  for (const channel of rec.channels) score += weights[channel] || 1;
  score += Math.min(3, (rec.bestScore || 0) * 2);
  if (Number.isFinite(rec.bestRank)) score += Math.max(0, 2 - rec.bestRank / 50);
  return score;
}

function uniqueAnchors(anchors) {
  const out = [];
  const seen = new Set();
  for (const anchor of anchors) {
    if (!anchor) continue;
    const key = `${anchor.kind || ""}|${anchor.headingPath || ""}|${anchor.matchText || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(anchor);
  }
  return out;
}

function detectSmartConnections(vault) {
  const candidates = [
    path.join(vault, ".obsidian", "plugins", "smart-connections"),
    path.join(vault, ".obsidian", "plugins", "smart-lookup"),
    path.join(vault, ".smart-env"),
    path.join(vault, ".smart-connections"),
    path.join(vault, ".obsidian", "plugins", "smart-connections", "data.json"),
  ];
  return candidates.filter((candidate) => fs.existsSync(candidate));
}

function getSmartInfo(vault) {
  const envDir = path.join(vault, ".smart-env");
  const multiDir = path.join(envDir, "multi");
  const info = {
    envDir: fs.existsSync(envDir) ? envDir : null,
    multiDir: fs.existsSync(multiDir) ? multiDir : null,
    files: 0,
    sources: 0,
    blocks: 0,
    embeddedSources: 0,
    embeddedBlocks: 0,
    modelKey: SMART_MODEL_KEY,
  };
  if (!info.multiDir) return info;
  for (const file of fs.readdirSync(info.multiDir)) {
    if (!file.endsWith(".ajson")) continue;
    info.files += 1;
    try {
      const obj = parseAjson(fs.readFileSync(path.join(info.multiDir, file), "utf8"));
      for (const [key, value] of Object.entries(obj)) {
        const hasVec = Array.isArray(value?.embeddings?.[SMART_MODEL_KEY]?.vec);
        if (key.startsWith("smart_sources:")) {
          info.sources += 1;
          if (hasVec) info.embeddedSources += 1;
        } else if (key.startsWith("smart_blocks:")) {
          info.blocks += 1;
          if (hasVec) info.embeddedBlocks += 1;
        }
      }
    } catch {
      // Ignore one bad cache record; Smart Connections can repair it.
    }
  }
  return info;
}

function safeSmartInfo(info) {
  return {
    envDirPresent: Boolean(info.envDir),
    multiDirPresent: Boolean(info.multiDir),
    files: info.files,
    sources: info.sources,
    blocks: info.blocks,
    embeddedSources: info.embeddedSources,
    embeddedBlocks: info.embeddedBlocks,
    modelKey: info.modelKey,
  };
}

function parseAjson(text) {
  let s = text.trim();
  if (!s) return {};
  if (s.endsWith(",")) s = s.slice(0, -1);
  return JSON.parse(`{${s}}`);
}

function loadSmartRecords(vault) {
  const info = getSmartInfo(vault);
  if (!info.multiDir) return { info, records: [] };
  const records = [];
  for (const file of fs.readdirSync(info.multiDir)) {
    if (!file.endsWith(".ajson")) continue;
    let obj;
    try {
      obj = parseAjson(fs.readFileSync(path.join(info.multiDir, file), "utf8"));
    } catch {
      continue;
    }
    for (const [key, value] of Object.entries(obj)) {
      const vec = value?.embeddings?.[SMART_MODEL_KEY]?.vec;
      if (!Array.isArray(vec) || vec.length !== 384) continue;
      const collection = key.startsWith("smart_sources:") ? "source" : key.startsWith("smart_blocks:") ? "block" : null;
      if (!collection) continue;
      const notePath = collection === "source" ? value.path : pathFromSmartBlockKey(value.key || key);
      if (!notePath || !notePath.endsWith(".md")) continue;
      if (isDefaultIgnoredNote(notePath)) continue;
      const lines = Array.isArray(value.lines) ? value.lines : null;
      const title = value.metadata?.title || titleFromPath(notePath);
      records.push({
        key,
        collection,
        path: notePath,
        title,
        lines,
        size: value.size || null,
        tags: normalizeSmartTags(value.metadata?.tags || []),
        vec,
      });
    }
  }
  return { info, records };
}

function normalizeSmartTags(tags) {
  return tags.map((tag) => String(tag).replace(/^#/, "")).filter(Boolean);
}

function pathFromSmartBlockKey(key) {
  const raw = String(key).replace(/^smart_blocks:/, "");
  const match = raw.match(/^(.+?\.md)(?:#.*)?$/);
  return match ? match[1] : null;
}

function titleFromPath(notePath) {
  return path.basename(notePath, path.extname(notePath)).replace(/-/g, " ");
}

function isDefaultIgnoredNote(notePath) {
  const normalized = notePath.replace(/\\/g, "/");
  return (
    normalized.startsWith("_Templates/") ||
    normalized.startsWith(".obsidian/") ||
    normalized.startsWith(".smart-env/") ||
    normalized.endsWith(".excalidraw.md")
  );
}

function readSnippet(vault, notePath, lines, maxLen = DEFAULT_SNIPPET_LENGTH) {
  try {
    const abs = path.join(vault, notePath);
    const all = fs.readFileSync(abs, "utf8").split(/\r?\n/);
    let text;
    if (lines?.length === 2) {
      const start = Math.max(1, Number(lines[0])) - 1;
      const end = Math.min(all.length, Number(lines[1]));
      text = all.slice(start, end).join(" ");
    } else {
      text = all.slice(0, 12).join(" ");
    }
    return compact(text, maxLen);
  } catch {
    return null;
  }
}

function runtimeDir() {
  const base = process.env.LOCALAPPDATA || process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache");
  return path.join(base, "Codex", "obsidian-high-recall", "node-runtime");
}

async function importTransformers() {
  const dir = runtimeDir();
  fs.mkdirSync(dir, { recursive: true });
  const req = createRequire(path.join(dir, "package.json"));
  let resolved = null;
  try {
    resolved = req.resolve("@huggingface/transformers");
  } catch {
    const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
    const proc = spawnSync(npmBin, ["install", "--prefix", dir, "@huggingface/transformers@4.2.0"], {
      encoding: "utf8",
      shell: process.platform === "win32",
      maxBuffer: 1024 * 1024 * 20,
    });
    if (proc.status !== 0) throw new Error(`npm install @huggingface/transformers failed: ${proc.stderr || proc.stdout}`);
    resolved = req.resolve("@huggingface/transformers");
  }
  return import(pathToFileURL(resolved).href);
}

let smartExtractorPromise = null;

async function embedSmartQueries(queries) {
  const { pipeline, env } = await importTransformers();
  env.cacheDir = path.join(runtimeDir(), "hf-cache");
  env.allowLocalModels = false;
  if (!smartExtractorPromise) {
    smartExtractorPromise = pipeline("feature-extraction", SMART_MODEL_KEY, { dtype: "q8" });
  }
  const extractor = await smartExtractorPromise;
  const out = [];
  for (const query of queries) {
    const resp = await extractor(query, { pooling: "mean", normalize: true });
    out.push({ query, vec: Array.from(resp.data) });
  }
  return out;
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length && i < b.length; i += 1) sum += a[i] * b[i];
  return sum;
}

async function smartVectorSearch(vault, opts, expansions) {
  const { info, records } = loadSmartRecords(vault);
  const plan = makeSearchPlan(expansions, { ...opts, profile: opts.profile === "deep" ? "deep" : "quick" });
  const lexical = lexicalSearch(vault, opts, expansions);
  if (!records.length) {
    return {
      info,
      records: [{ channel: "lexical", results: lexical }],
      plan,
    };
  }
  const queryTexts =
    opts.profile === "deep"
      ? unique([...expansions.semanticQueries.slice(0, 8), expansions.fulltextTerms.slice(0, 16).join(" ")])
      : unique([opts.query, expansions.semanticQueries.slice(0, 8).join(" ")]);
  const queryVecs = await embedSmartQueries(queryTexts);
  const sourceLimit = Math.max(10, Math.ceil(opts.perChannel * 0.8));
  const blockLimit = Math.max(20, opts.perChannel * (opts.profile === "deep" ? 4 : 2));
  const source = [];
  const block = [];
  for (const record of records) {
    let best = -Infinity;
    for (const q of queryVecs) best = Math.max(best, dot(q.vec, record.vec));
    const result = {
      path: record.path,
      title: record.title,
      tags: record.tags,
      parsedTags: record.tags,
      snippet: readSnippet(vault, record.path, record.lines, opts.snippetLength),
      score: best,
      scores: { smart: best },
      matchedBy: ["smart-vector"],
      rank: null,
      previewAnchors: record.lines ? [{ kind: "smart", headingPath: record.key.split("#").slice(1).join("#") || null, matchText: null, lineStart: record.lines[0], lineEnd: record.lines[1] }] : [],
    };
    if (record.collection === "source") source.push(result);
    else block.push(result);
  }
  source.sort((a, b) => b.score - a.score).forEach((r, i) => (r.rank = i + 1));
  block.sort((a, b) => b.score - a.score).forEach((r, i) => (r.rank = i + 1));
  return {
    info,
    records: [
      { channel: "smart-source", results: source.slice(0, sourceLimit) },
      { channel: "smart-block", results: block.slice(0, blockLimit) },
      { channel: "lexical", results: lexical },
    ],
    plan,
  };
}

function lexicalSearch(vault, opts, expansions) {
  const terms = expansions.fulltextTerms.filter((t) => t.length >= 2).slice(0, opts.profile === "deep" ? 36 : 18);
  if (!terms.length) return [];
  const files = listMarkdownFiles(vault);
  const results = [];
  for (const rel of files) {
    if (isDefaultIgnoredNote(rel)) continue;
    let text;
    try {
      text = fs.readFileSync(path.join(vault, rel), "utf8");
    } catch {
      continue;
    }
    const lower = text.toLowerCase();
    let hits = 0;
    for (const term of terms) {
      if (lower.includes(term.toLowerCase())) hits += 1;
    }
    if (!hits) continue;
    const lines = text.split(/\r?\n/);
    const hitLine = Math.max(0, lines.findIndex((line) => terms.some((term) => line.toLowerCase().includes(term.toLowerCase()))));
    results.push({
      path: rel,
      title: titleFromPath(rel),
      snippet: compact(lines.slice(hitLine, hitLine + 6).join(" "), opts.snippetLength),
      score: hits / terms.length,
      scores: { lexical: hits },
      matchedBy: ["lexical"],
      rank: null,
      previewAnchors: [{ kind: "lexical", lineStart: hitLine + 1, lineEnd: Math.min(lines.length, hitLine + 6) }],
    });
  }
  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => (r.rank = i + 1));
  return results.slice(0, Math.max(opts.perChannel, 30));
}

function listMarkdownFiles(vault) {
  const out = [];
  const ignoreParts = new Set([".obsidian", ".smart-env", ".git", "node_modules"]);
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignoreParts.has(entry.name)) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(abs);
      else if (entry.isFile() && entry.name.endsWith(".md")) out.push(path.relative(vault, abs).replace(/\\/g, "/"));
    }
  }
  walk(vault);
  return out;
}

async function makePack(vault, db, opts) {
  const expansions = expandQuery(opts.query, opts.extra);
  const smartInfo = getSmartInfo(vault);
  const smartAvailable = smartInfo.embeddedSources + smartInfo.embeddedBlocks > 0;
  const useSmart = opts.backend === "smart" || opts.backend === "both" || (opts.backend === "auto" && smartAvailable);
  const useOhs = opts.backend === "ohs" || opts.backend === "both" || (opts.backend === "auto" && !smartAvailable);
  const indexStatus = useOhs ? ensureIndex(vault, db, opts) : null;
  const plan = makeSearchPlan(expansions, opts);
  const channelResults = [];

  let smartSearchInfo = smartInfo;
  let smartPlan = null;
  if (useSmart) {
    const smart = await smartVectorSearch(vault, opts, expansions);
    smartSearchInfo = smart.info;
    smartPlan = smart.plan;
    channelResults.push(...smart.records);
  }

  if (useOhs) {
    channelResults.push({
      channel: "semantic",
      results: search(vault, db, opts, "semantic", plan.semanticQueries),
    });
    channelResults.push({
      channel: "hybrid",
      results: search(vault, db, opts, "hybrid", plan.hybridQueries),
    });
    channelResults.push({
      channel: "fulltext",
      results: search(vault, db, opts, "fulltext", plan.fulltextTerms),
    });
    channelResults.push({
      channel: "title",
      results: search(vault, db, opts, "title", plan.titleQueries),
    });
    for (const tag of plan.tags) {
      channelResults.push({
        channel: "tag",
        results: tagSearch(vault, db, opts, tag, opts.query),
      });
    }
  }

  const merged = mergeResults(channelResults, opts.neighborSeeds);
  const smartVectorCount = smartSearchInfo.embeddedSources + smartSearchInfo.embeddedBlocks;
  return {
    schemaVersion: OUTPUT_SCHEMA_VERSION,
    query: opts.query,
    generatedAt: new Date().toISOString(),
    vault,
    db,
    privacy: {
      safeToShare: false,
      rawQueryIncluded: true,
      localPathsIncluded: true,
      snippetsIncluded: true,
      noteNamesIncluded: true,
    },
    backend: {
      selected: useSmart && useOhs ? "both" : useSmart ? "smart" : "ohs",
      primary: useSmart ? (smartVectorCount > 0 ? "smart-connections" : "lexical-fallback") : "obsidian-hybrid-search",
      package: useSmart
        ? smartVectorCount > 0
          ? "@huggingface/transformers + Smart Connections .smart-env"
          : "local lexical scan"
        : "obsidian-hybrid-search",
      smartConnectionsDetected: detectSmartConnections(vault),
    },
    index: {
      ohs: indexStatus
        ? {
            total: indexStatus?.total,
            indexed: indexStatus?.indexed,
            chunks: indexStatus?.chunks,
            links: indexStatus?.links,
            model: indexStatus?.model,
            db_size_mb: indexStatus?.db_size_mb,
            errors: indexStatus?.errors || [],
          }
        : null,
      smart: smartSearchInfo,
    },
    expansions,
    profile: opts.profile,
    searchPlan: { ohs: plan, smart: smartPlan },
    channels: channelResults.map((c) => ({ channel: c.channel, count: c.results.length })),
    results: merged.slice(0, opts.limit),
    resultCountBeforeLimit: merged.length,
  };
}

function makeSearchPlan(expansions, opts) {
  if (opts.profile === "deep") {
    return {
      semanticQueries: expansions.semanticQueries.slice(0, 8),
      hybridQueries: expansions.semanticQueries.slice(0, 6),
      fulltextTerms: expansions.fulltextTerms.slice(0, 30),
      titleQueries: [...expansions.semanticQueries, ...expansions.fulltextTerms].slice(0, 18),
      tags: expansions.tags.slice(0, 8),
    };
  }

  const semanticCombined = unique([
    expansions.semanticQueries.slice(0, 8).join(" "),
  ]);
  const hybridCombined = unique([
    expansions.semanticQueries.slice(0, 5).join(" "),
  ]);
  return {
    semanticQueries: [],
    hybridQueries: hybridCombined,
    fulltextTerms: expansions.fulltextTerms.slice(0, 18),
    titleQueries: [],
    tags: [],
  };
}

function printPack(pack) {
  console.log(`Obsidian high-recall pack`);
  console.log(`Vault: ${pack.vault}`);
  console.log(`DB: ${pack.db}`);
  if (pack.index.ohs) console.log(`OHS index: ${pack.index.ohs.indexed}/${pack.index.ohs.total} notes, ${pack.index.ohs.chunks} chunks, model=${pack.index.ohs.model}`);
  if (pack.index.smart) console.log(`Smart index: ${pack.index.smart.embeddedSources}/${pack.index.smart.sources} sources, ${pack.index.smart.embeddedBlocks}/${pack.index.smart.blocks} blocks, model=${pack.index.smart.modelKey}`);
  console.log(`Profile: ${pack.profile}`);
  console.log(`Backend: ${pack.backend.selected}`);
  if (pack.backend.smartConnectionsDetected.length) {
    console.log(`Smart Connections detected: ${pack.backend.smartConnectionsDetected.join("; ")}`);
  } else {
    console.log("Smart Connections detected: no local plugin/index path found");
  }
  console.log(`Expanded queries: ${pack.expansions.semanticQueries.slice(0, 10).join(" | ")}`);
  console.log(`Channels: ${pack.channels.map((c) => `${c.channel}:${c.count}`).join(", ")}`);
  console.log(`Results: ${pack.results.length} shown (${pack.resultCountBeforeLimit} before limit)`);
  console.log("");

  pack.results.forEach((result, idx) => {
    console.log(`${idx + 1}. ${result.title || "(graph neighbor)"}`);
    console.log(`   ${result.path}`);
    console.log(`   channels=${result.channels.join("+")} score=${result.bestScore} rank=${result.bestRank ?? "-"} recall=${result.recallScore}`);
    if (result.tags.length) console.log(`   tags=${result.tags.join(", ")}`);
    if (result.snippet) console.log(`   ${compact(result.snippet, 260)}`);
    if (result.graphReasons.length) console.log(`   ${result.graphReasons.join("; ")}`);
  });
}

function compact(text, max) {
  const s = String(text).replace(/\s+/g, " ").trim();
  return s.length > max ? `${s.slice(0, max - 3)}...` : s;
}

function redactLocalText(text) {
  return String(text || "")
    .replace(/[A-Za-z]:\\[^\s"'<>]+/g, "<local-path>")
    .replace(/\/(?:Users|home)\/[^\s"'<>]+/g, "<local-path>");
}

function redactDemoPack(pack) {
  pack.vault = "<local-fixture-vault-path>";
  pack.db = "<local-ohs-db-path>";
  pack.privacy = {
    safeToShare: true,
    rawQueryIncluded: true,
    localPathsIncluded: false,
    snippetsIncluded: true,
    noteNamesIncluded: true,
  };
  return pack;
}

function makeDoctorReport(opts) {
  const report = {
    schemaVersion: OUTPUT_SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    privacy: {
      safeToShare: true,
      rawPathsIncluded: false,
      snippetsIncluded: false,
      noteNamesIncluded: false,
      queryIncluded: false,
    },
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    vault: {
      resolved: false,
      source: opts.vault ? "cli" : process.env.OBSIDIAN_VAULT_PATH ? "env-or-config" : "auto",
      hasObsidianDir: false,
      markdownFiles: null,
      error: null,
    },
    smart: null,
    ohs: {
      dbConfigured: false,
      dbExists: false,
      dbSizeBytes: null,
      dbPathRedacted: true,
      statusChecked: false,
      statusNote: "doctor does not run OHS status, reindex, or search",
    },
    recommendations: [],
  };

  let vault;
  try {
    vault = resolveVault(opts.vault);
  } catch (err) {
    report.vault.error = redactLocalText(err?.message || String(err));
    report.recommendations.push("Pass --vault PATH or set OBSIDIAN_VAULT_PATH, then rerun doctor.");
    return report;
  }

  report.vault.resolved = true;
  report.vault.hasObsidianDir = fs.existsSync(path.join(vault, ".obsidian"));
  report.vault.markdownFiles = listMarkdownFiles(vault).length;

  const smartInfo = getSmartInfo(vault);
  const smartDetected = detectSmartConnections(vault);
  report.smart = {
    ...safeSmartInfo(smartInfo),
    detectedPathCount: smartDetected.length,
    smartConnectionsDetected: smartDetected.length > 0,
  };

  const db = path.resolve(opts.db || defaultDbPath(vault));
  report.ohs.dbConfigured = true;
  report.ohs.dbExists = fs.existsSync(db);
  report.ohs.dbSizeBytes = report.ohs.dbExists ? fs.statSync(db).size : null;

  if (!report.smart.embeddedSources && !report.smart.embeddedBlocks) {
    report.recommendations.push("Smart Connections vectors were not detected; use --backend auto for OHS fallback or finish Smart Connections indexing.");
  }
  if (!report.vault.hasObsidianDir) {
    report.recommendations.push("The resolved directory does not contain .obsidian; confirm --vault points at the vault root.");
  }
  if (!report.ohs.dbExists) {
    report.recommendations.push("OHS database was not found yet; the first OHS/auto fallback query may build a local index.");
  }

  return report;
}

function printDoctor(report) {
  console.log("Obsidian High Recall doctor");
  console.log(`Node: ${report.runtime.node}`);
  console.log(`Platform: ${report.runtime.platform}/${report.runtime.arch}`);
  console.log(`Vault resolved: ${report.vault.resolved}`);
  if (report.vault.error) console.log(`Vault error: ${report.vault.error}`);
  if (report.vault.resolved) {
    console.log(`Vault has .obsidian: ${report.vault.hasObsidianDir}`);
    console.log(`Markdown files: ${report.vault.markdownFiles}`);
    console.log(`Smart detected: ${report.smart.smartConnectionsDetected}`);
    console.log(`Smart embedded sources/blocks: ${report.smart.embeddedSources}/${report.smart.embeddedBlocks}`);
    console.log(`OHS db exists: ${report.ohs.dbExists}`);
  }
  console.log(`Privacy-safe to share: ${report.privacy.safeToShare}`);
  if (report.recommendations.length) {
    console.log("Recommendations:");
    for (const item of report.recommendations) console.log(`- ${item}`);
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.command === "help") {
    printHelp();
    return;
  }
  if (opts.command === "doctor") {
    const report = makeDoctorReport(opts);
    if (opts.json) console.log(JSON.stringify(report, null, 2));
    else printDoctor(report);
    return;
  }
  if (opts.command === "demo") {
    opts.command = "query";
    opts.demo = true;
    opts.vault = defaultDemoVault();
    opts.query = DEMO_QUERY;
    opts.limit = Math.min(opts.limit, 10);
    opts.perChannel = Math.min(opts.perChannel, 20);
    opts.neighborSeeds = 0;
    if (!opts.backendExplicit) opts.backend = "smart";
  }
  const vault = resolveVault(opts.vault);
  const db = path.resolve(opts.db || defaultDbPath(vault));

  if (opts.command === "detect") {
    const payload = { vault, db, smartConnectionsDetected: detectSmartConnections(vault), smart: getSmartInfo(vault) };
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  if (opts.command === "status") {
    const payload = { ohs: status(vault, db), smart: getSmartInfo(vault), db, smartConnectionsDetected: detectSmartConnections(vault) };
    console.log(opts.json ? JSON.stringify(payload, null, 2) : JSON.stringify(payload, null, 2));
    return;
  }
  if (opts.command === "reindex") {
    const output = reindex(vault, db, opts.force);
    console.log(output);
    console.log(JSON.stringify({ ...status(vault, db), db }, null, 2));
    return;
  }
  if (!opts.query) {
    throw new Error("Query text is required. Example: query \"数据采集 for 具身\"");
  }
  const pack = await makePack(vault, db, opts);
  if (opts.demo) redactDemoPack(pack);
  if (opts.json) console.log(JSON.stringify(pack, null, 2));
  else printPack(pack);
}

try {
  await main();
} catch (err) {
  console.error(err?.stack || String(err));
  process.exit(1);
}
