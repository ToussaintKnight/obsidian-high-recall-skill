#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
const cmdExt = process.platform === "win32" ? ".cmd" : "";
const tmpRoot = path.resolve(".tmp", "package-bin-smoke");
fs.mkdirSync(tmpRoot, { recursive: true });
const workDir = fs.mkdtempSync(path.join(tmpRoot, "run-"));
const packDir = path.join(workDir, "pack");
const installDir = path.join(workDir, "install");
fs.mkdirSync(packDir, { recursive: true });
fs.mkdirSync(installDir, { recursive: true });

function run(command, args, options = {}) {
  const proc = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    maxBuffer: 1024 * 1024 * 20,
    ...options,
  });
  if (proc.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed (${proc.status}):\n${proc.stderr || proc.stdout}`);
  }
  return proc;
}

function assertUsage(binName, args, expected) {
  const binPath = path.join(installDir, "node_modules", ".bin", `${binName}${cmdExt}`);
  if (!fs.existsSync(binPath)) {
    throw new Error(`Installed package is missing bin: ${binPath}`);
  }
  const proc = run(binPath, args);
  if (!proc.stdout.includes(expected)) {
    throw new Error(`${binName} ${args.join(" ")} did not print expected usage text.\n${proc.stdout}`);
  }
}

function safeCleanup(target) {
  const resolved = path.resolve(target);
  const rel = path.relative(tmpRoot, resolved);
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Refusing to remove outside package-bin-smoke root: ${resolved}`);
  }
  fs.rmSync(resolved, { recursive: true, force: true });
}

try {
  const pack = run(npmBin, ["pack", "--json", "--cache", path.join(".tmp", "npm-cache"), "--pack-destination", packDir]);
  const packed = JSON.parse(pack.stdout)[0];
  const tarball = path.join(packDir, packed.filename);
  if (!fs.existsSync(tarball)) {
    throw new Error(`npm pack did not create expected tarball: ${tarball}`);
  }

  run(npmBin, [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--cache",
    path.join(".tmp", "npm-cache"),
    "--prefix",
    installDir,
    tarball,
  ]);

  assertUsage("obsidian-high-recall", ["help"], "obsidian_high_recall.mjs query");
  assertUsage("obsidian-high-recall-eval", ["--help"], "evaluate_recall.mjs");
  console.log("Installed package bin smoke passed.");
} finally {
  if (process.env.KEEP_PACKAGE_BIN_SMOKE !== "1") {
    safeCleanup(workDir);
  }
}
