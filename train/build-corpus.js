#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const FORBIDDEN = /thirtyfold|portana|attio|numen|revolut/i;

const SOURCES = [
  "README.md",
  "AGENTS.md",
  "SUPPORT.md",
  "SECURITY.md",
  "CONTRIBUTING.md",
  "TRADEMARKS.md",
  "docs",
  "wiki",
];

const QA = [
  {
    instruction: "What is Giti.one?",
    output:
      "Giti.one is a Node.js ERP in git, by Poriya Sayafan. A purchase order is a promise, not the books. Receipt and delivery post stock and a balanced journal. ISO 9001, 27001, and 55001 records and a PMP map live in the same catalog. It is not a certificate and not an AI product.",
  },
  {
    instruction: "How do I run Giti.one ERP?",
    output:
      "Clone the repository, run ./setup.sh, then optionally npm start and open http://127.0.0.1:3847. The UI binds to this machine only. Persian CLI: ./setup.sh --lang fa.",
  },
  {
    instruction: "How do I add a module?",
    output:
      "Add a row to src/catalog.js, keep list and add, add English and Persian labels in src/locale.js, and add a test. If it moves money or stock, post through src/ledger.js or src/stock.js. Persist with src/postgres.js into erp_row.",
  },
  {
    instruction: "Does Giti.one certify ISO or PMI?",
    output:
      "No. The repository holds records and a PMP map. It is not an ISO or PMI certificate.",
  },
  {
    instruction: "Is Giti.one an AI ERP or a CRM agent product?",
    output:
      "No. Giti.one is the books. Catalog slots that do not post are not a working ERP. A helper trained on public docs is optional and is not the product.",
  },
];

function skipFile(rel) {
  const lower = rel.toLowerCase();
  return lower.includes("linkedin") || lower.endsWith(".html");
}

async function walk(abs, relBase, files) {
  const entries = await readdir(abs, { withFileTypes: true });
  for (const entry of entries) {
    const absPath = join(abs, entry.name);
    const rel = join(relBase, entry.name).split("\\").join("/");
    if (entry.isDirectory()) {
      await walk(absPath, rel, files);
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;
    if (skipFile(rel)) continue;
    files.push({ abs: absPath, rel });
  }
}

export async function collectSources(root = ROOT) {
  const files = [];
  for (const source of SOURCES) {
    const abs = join(root, source);
    try {
      await walk(abs, source, files);
    } catch {
      if (source.endsWith(".md") && !skipFile(source)) {
        files.push({ abs, rel: source });
      }
    }
  }
  files.sort((a, b) => a.rel.localeCompare(b.rel));
  return files;
}

function stripFrontMatter(text) {
  if (!text.startsWith("---")) return text;
  const end = text.indexOf("\n---", 3);
  if (end < 0) return text;
  return text.slice(end + 4).trimStart();
}

export async function buildCorpus(root = ROOT) {
  const rows = [];
  let n = 0;
  for (const qa of QA) {
    n += 1;
    rows.push({
      id: `qa-${n}`,
      kind: "qa",
      instruction: qa.instruction,
      output: qa.output,
      text: `Q: ${qa.instruction}\nA: ${qa.output}`,
    });
  }
  for (const file of await collectSources(root)) {
    const raw = await readFile(file.abs, "utf8");
    const text = stripFrontMatter(raw).trim();
    if (!text) continue;
    if (FORBIDDEN.test(text)) {
      throw new Error(`forbidden name in ${file.rel}`);
    }
    n += 1;
    rows.push({
      id: `doc-${n}`,
      kind: "doc",
      source: file.rel,
      text,
    });
  }
  return rows;
}

export async function writeCorpus(root = ROOT) {
  const rows = await buildCorpus(root);
  const dir = join(root, "train");
  await mkdir(dir, { recursive: true });
  const out = join(dir, "corpus.jsonl");
  const body = `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
  await writeFile(out, body);
  return { out, count: rows.length };
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const result = await writeCorpus();
  process.stdout.write(
    `corpus  ${result.count} rows  ${relative(ROOT, result.out)}\n`,
  );
}
