#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const metricsPath = path.resolve(process.argv[2] || ".tmp/fixture-eval/metrics.json");
const metrics = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
const scored = metrics.filter((item) => item.backend === "smart" && item.k === 10);

if (!scored.length) {
  throw new Error(`No smart K=10 metrics found in ${metricsPath}`);
}

const failures = scored.filter((item) => Number(item.recall || 0) <= 0);
if (failures.length) {
  throw new Error(`Fixture recall smoke test failed: ${failures.map((item) => item.case).join(", ")}`);
}

console.log(`Fixture smoke passed: ${scored.length} cases have Recall@10 > 0.`);
