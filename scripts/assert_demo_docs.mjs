#!/usr/bin/env node
import fs from "node:fs";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required demo file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, text, required) {
  const missing = required.filter((item) => !text.includes(item));
  if (missing.length) {
    throw new Error(`${file} is missing required text:\n- ${missing.join("\n- ")}`);
  }
}

const demoReadme = read("docs/demo/README.md");
requireIncludes("docs/demo/README.md", demoReadme, [
  "fixture_demo.gif",
  "fixture_walkthrough.md",
  "npm run demo:gif",
]);

const walkthrough = read("docs/demo/fixture_walkthrough.md");
requireIncludes("docs/demo/fixture_walkthrough.md", walkthrough, [
  "# Fixture Walkthrough",
  "docs/fixtures/demo-vault",
  "npm test",
  "Recall@10 > 0",
  "Embodied AI Data Collection",
  "World Models and Simulation",
  "Agent Memory Search",
  "lexical-fallback",
  "../examples/fixture_query_pack.redacted.json",
  "Do not paste",
  "benchmark/reporting_guide.md",
  "../troubleshooting.md",
]);

const readme = read("README.md");
requireIncludes("README.md", readme, ["docs/demo/fixture_walkthrough.md"]);

const zhReadme = read("README.zh-CN.md");
requireIncludes("README.zh-CN.md", zhReadme, ["docs/demo/fixture_walkthrough.md"]);

const testingGuide = read("docs/testing_guide.md");
requireIncludes("docs/testing_guide.md", testingGuide, ["demo/fixture_walkthrough.md"]);

if (!fs.existsSync("docs/demo/fixture_demo.gif")) {
  throw new Error("docs/demo/fixture_demo.gif is missing.");
}

console.log("Demo docs smoke passed: fixture GIF, walkthrough, and public entry links checked.");
