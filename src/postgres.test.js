// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { seedDemo } from "./cli.js";
import { createApp } from "./index.js";
import { dumpApp } from "./postgres.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("PostgreSQL schema", () => {
  it("defines erp_row and ISO/PMP views", () => {
    const sql = readFileSync(join(root, "schema.sql"), "utf8");
    assert.match(sql, /CREATE TABLE IF NOT EXISTS erp_row/);
    assert.match(sql, /iso_9001_documents/);
    assert.match(sql, /iso_27001_audit_logs/);
    assert.match(sql, /iso_55001_assets/);
    assert.match(sql, /pmp_charters/);
    assert.match(sql, /pmp_workers/);
  });

  it("round-trips dump and hydrate without posting twice", () => {
    const live = seedDemo(createApp());
    const rows = dumpApp(live);
    const restored = createApp({ hydrate: rows });
    assert.equal(restored.stockEngine.onHand("SKU-1", "MAIN"), 7);
    assert.equal(restored.ledger.trialBalance().balanced, true);
    assert.equal(
      restored.accounting.journals.list().length,
      live.accounting.journals.list().length,
    );
  });
});
