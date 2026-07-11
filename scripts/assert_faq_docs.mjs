import fs from "node:fs";
import path from "node:path";

const faq = fs.readFileSync(path.join("docs", "faq.md"), "utf8");
const requiredFaqSnippets = [
  "# FAQ",
  "Is This An Obsidian Plugin?",
  "Does It Upload My Notes?",
  "Do I Need Smart Connections?",
  "Why Optimize Recall Over Precision?",
  "Why Is The Main Benchmark From A Private Vault?",
  "How Is This Different From Smart Connections?",
  "How Is This Different From obsidian-hybrid-search?",
  "What Is Safe To Share Publicly?",
  "What Should I Do If npx Fails?",
  "Does It Work On Windows, macOS, Linux, And WSL?",
  "How Do I Contribute Without Sharing Private Notes?",
  "What Are The Main Limitations?",
  "privacy.safeToShare: false",
  "privacy_threat_model.md",
  "compatibility.md",
  "testing_guide.md",
];

for (const snippet of requiredFaqSnippets) {
  if (!faq.includes(snippet)) {
    throw new Error(`docs/faq.md is missing expected snippet: ${snippet}`);
  }
}

const readme = fs.readFileSync("README.md", "utf8");
for (const snippet of ["FAQ", "[docs/faq.md](docs/faq.md)"]) {
  if (!readme.includes(snippet)) {
    throw new Error(`README.md is missing FAQ link/snippet: ${snippet}`);
  }
}

const zhReadme = fs.readFileSync("README.zh-CN.md", "utf8");
if (!zhReadme.includes("[docs/faq.md](docs/faq.md)")) {
  throw new Error("README.zh-CN.md is missing docs/faq.md link.");
}

const install = fs.readFileSync(path.join("docs", "install.md"), "utf8");
if (!install.includes("[faq.md](faq.md)")) {
  throw new Error("docs/install.md is missing faq.md link.");
}

const troubleshooting = fs.readFileSync(path.join("docs", "troubleshooting.md"), "utf8");
if (!troubleshooting.includes("[faq.md](faq.md)")) {
  throw new Error("docs/troubleshooting.md is missing faq.md link.");
}

console.log("FAQ docs smoke passed.");
