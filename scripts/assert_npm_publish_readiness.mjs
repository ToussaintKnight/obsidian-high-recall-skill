import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required npm publish file: ${file}`);
  }
  return fs.readFileSync(file, "utf8");
}

function requireIncludes(file, text, required) {
  const missing = required.filter((snippet) => !text.includes(snippet));
  if (missing.length) {
    throw new Error(`${file} is missing required npm publish readiness text:\n- ${missing.join("\n- ")}`);
  }
}

function requireJsonField(condition, message) {
  if (!condition) throw new Error(message);
}

const pkg = JSON.parse(read("package.json"));

requireJsonField(pkg.name === "obsidian-high-recall", "package.json name must stay obsidian-high-recall.");
requireJsonField(pkg.private === false, "package.json must set private:false before public publish readiness.");
requireJsonField(pkg.publishConfig?.access === "public", "package.json must set publishConfig.access=public.");
requireJsonField(pkg.license === "MIT", "package.json must declare MIT license.");
requireJsonField(pkg.engines?.node === ">=20", "package.json must require Node.js >=20.");
requireJsonField(pkg.repository?.url?.includes("ToussaintKnight/obsidian-high-recall-skill"), "package.json repository URL is missing.");
requireJsonField(pkg.bugs?.url?.includes("/issues"), "package.json bugs URL must point to GitHub issues.");
requireJsonField(pkg.homepage?.includes("toussaintknight.github.io/obsidian-high-recall-skill"), "package.json homepage is missing.");
requireJsonField(pkg.scripts?.prepublishOnly?.includes("npm test"), "prepublishOnly must run npm test.");
requireJsonField(pkg.scripts?.prepublishOnly?.includes("npm run privacy:scan"), "prepublishOnly must run privacy scan.");
requireJsonField(pkg.scripts?.prepublishOnly?.includes("npm run publish:check"), "prepublishOnly must run publish:check.");

for (const bin of ["obsidian-high-recall", "obsidian-high-recall-eval"]) {
  requireJsonField(pkg.bin?.[bin]?.startsWith("skills/obsidian-high-recall/scripts/"), `package.json missing bin ${bin}.`);
}

for (const keyword of ["obsidian", "local-first", "search", "rag", "codex", "smart-connections", "pkm"]) {
  requireJsonField(pkg.keywords?.includes(keyword), `package.json keywords missing ${keyword}.`);
}

for (const file of ["docs", "README.md", "README.zh-CN.md", "CHANGELOG.md", "LICENSE", "SECURITY.md", "CONTRIBUTING.md", "SUPPORT.md", "CITATION.cff"]) {
  requireJsonField(pkg.files?.includes(file), `package.json files missing ${file}.`);
}

const npmPublish = read(path.join("docs", "npm_publish.md"));
requireIncludes("docs/npm_publish.md", npmPublish, [
  "# NPM Publish Readiness",
  "GitHub-backed `npx`",
  "Do not advertise the registry command until the package has actually been published and verified.",
  "Package name: `obsidian-high-recall`",
  "Declared runtime dependencies: none",
  "npm run publish:check",
  "npm pack --dry-run --json --cache .tmp/npm-cache",
  "npm publish --access public",
  "npx --yes obsidian-high-recall help",
  "raw_runs.json",
  ".smart-env",
  "dependency_inventory.md",
  "privacy_threat_model.md",
]);

const install = read(path.join("docs", "install.md"));
requireIncludes("docs/install.md", install, [
  "NPM publish readiness",
  "npm_publish.md",
]);

const readme = read("README.md");
requireIncludes("README.md", readme, [
  "NPM publish readiness",
  "docs/npm_publish.md",
]);

const zhReadme = read("README.zh-CN.md");
requireIncludes("README.zh-CN.md", zhReadme, [
  "NPM publish readiness",
  "docs/npm_publish.md",
]);

const releaseNotes = read(path.join("docs", "releases", `v${pkg.version}.md`));
requireIncludes(`docs/releases/v${pkg.version}.md`, releaseNotes, [
  "docs/npm_publish.md",
  "GitHub-backed for now",
]);

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const pack = spawnSync(npmBin, ["pack", "--dry-run", "--json", "--cache", path.join(".tmp", "npm-cache")], {
  encoding: "utf8",
  shell: process.platform === "win32",
  maxBuffer: 1024 * 1024 * 10,
});
if (pack.status !== 0) {
  throw new Error(`npm pack --dry-run failed (${pack.status}):\n${pack.stderr || pack.stdout}`);
}

const payload = JSON.parse(pack.stdout)[0];
const files = new Set((payload.files || []).map((file) => file.path));
for (const file of ["docs/npm_publish.md", "docs/dependency_inventory.md", "docs/privacy_threat_model.md", "docs/fixtures/demo_cases.json"]) {
  if (!files.has(file)) {
    throw new Error(`npm pack dry-run is missing publish-readiness file: ${file}`);
  }
}

console.log("NPM publish readiness smoke passed.");
