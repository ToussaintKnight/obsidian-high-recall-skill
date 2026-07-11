#!/usr/bin/env node
import { makeRrfUnion } from "../skills/obsidian-high-recall/scripts/rrf_union.mjs";

const smartRun = {
  backend: "smart",
  json: {
    query: "fixture union query",
    results: [
      {
        path: "notes/a.md",
        title: "Smart first",
        channels: ["vector"],
        matchedBy: ["smart-vector"],
        bestScore: 0.9,
        bestRank: 1,
        snippet: "smart top result",
      },
      {
        path: "notes/shared.md",
        title: "Shared result",
        channels: ["lexical"],
        matchedBy: ["smart-lexical"],
        bestScore: 0.6,
        bestRank: 2,
        snippet: "shared from smart",
      },
    ],
  },
};

const ohsRun = {
  backend: "ohs",
  json: {
    query: "fixture union query",
    results: [
      {
        path: "notes/shared.md",
        title: "Shared result",
        channels: ["fulltext"],
        matchedBy: ["ohs-fulltext"],
        score: 0.8,
        bestRank: 1,
        snippet: "shared from ohs",
      },
      {
        path: "notes/b.md",
        title: "OHS second",
        channels: ["hybrid"],
        matchedBy: ["ohs-hybrid"],
        score: 0.7,
        bestRank: 2,
        snippet: "ohs second result",
      },
    ],
  },
};

const union = makeRrfUnion([smartRun, ohsRun]);
const [first, second, third] = union.results;

if (union.backend?.selected !== "rrf-union") {
  throw new Error("RRF union backend metadata is missing.");
}

if (union.channels.length !== 2 || union.channels[0].channel !== "smart" || union.channels[1].channel !== "ohs") {
  throw new Error(`Unexpected union channel summary: ${JSON.stringify(union.channels)}`);
}

if (union.results.length !== 3 || union.resultCountBeforeLimit !== 3) {
  throw new Error(`Expected 3 deduped union results, got ${union.results.length}.`);
}

if (first.path !== "notes/shared.md") {
  throw new Error(`Expected shared result to rank first after RRF, got ${first.path}.`);
}

if (first.channelRanks.smart !== 2 || first.channelRanks.ohs !== 1) {
  throw new Error(`Shared result channel ranks were not preserved: ${JSON.stringify(first.channelRanks)}`);
}

if (!first.channels.includes("smart") || !first.channels.includes("ohs") || !first.channels.includes("lexical") || !first.channels.includes("fulltext")) {
  throw new Error(`Shared result channels were not merged: ${JSON.stringify(first.channels)}`);
}

if (!first.matchedBy.includes("smart-lexical") || !first.matchedBy.includes("ohs-fulltext")) {
  throw new Error(`Shared result matchedBy values were not merged: ${JSON.stringify(first.matchedBy)}`);
}

if (second.path !== "notes/a.md" || third.path !== "notes/b.md") {
  throw new Error(`Unexpected tie-break order after shared result: ${union.results.map((item) => item.path).join(", ")}`);
}

if (!(first.rrfScore > second.rrfScore && second.rrfScore > third.rrfScore)) {
  throw new Error(`Unexpected RRF scores: ${union.results.map((item) => item.rrfScore).join(", ")}`);
}

console.log("RRF union smoke passed.");
