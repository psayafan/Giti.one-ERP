// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { catalogGraph, writeCatalogGraph } from "./graph.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("catalog graph", () => {
  it("marks receipts as posting and lists as a slot", () => {
    const graph = catalogGraph();
    const receipts = graph.nodes.find((node) => node.id === "buying.receipts");
    const lists = graph.nodes.find((node) => node.id === "crm.lists");
    assert.equal(receipts.kind, "posts");
    assert.equal(lists.kind, "slot");
    assert.equal(
      graph.edges.some(
        (edge) =>
          edge.from === "buying.receipts" &&
          edge.to === "accounting.journals" &&
          edge.rel !== "catalog",
      ),
      true,
    );
    assert.doesNotMatch(JSON.stringify(graph), /attio|portana|thirtyfold/i);
  });

  it("writes public json", async () => {
    const result = await writeCatalogGraph(root);
    const body = JSON.parse(await readFile(result.out, "utf8"));
    assert.equal(body.public, true);
    assert.equal(body.counts.posts, result.graph.counts.posts);
  });
});
