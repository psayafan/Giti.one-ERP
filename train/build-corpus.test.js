// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { buildCorpus, writeCorpus } from "./build-corpus.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("helper corpus", () => {
  it("builds public docs without forbidden names", async () => {
    const rows = await buildCorpus(root);
    const qa = rows.filter((row) => row.kind === "qa");
    const docs = rows.filter((row) => row.kind === "doc");
    assert.equal(qa.length, 5);
    assert.ok(docs.length >= 10);
    assert.equal(
      docs.some((row) => row.source === "README.md"),
      true,
    );
    assert.equal(
      docs.some((row) => String(row.source).includes("linkedin")),
      false,
    );
    const blob = rows.map((row) => JSON.stringify(row)).join("\n");
    assert.doesNotMatch(blob, /thirtyfold|portana|attio|numen|revolut/i);
    assert.match(blob, /purchase order is a promise/i);
    assert.match(blob, /not an AI product/i);
  });

  it("writes jsonl", async () => {
    const result = await writeCorpus(root);
    const body = await readFile(result.out, "utf8");
    const lines = body.trim().split("\n");
    assert.equal(lines.length, result.count);
    assert.equal(JSON.parse(lines[0]).kind, "qa");
  });
});
