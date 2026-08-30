// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { boot } from "./boot.js";

describe("boot", () => {
  it("loads the demo in memory without DATABASE_URL", async () => {
    const result = await boot({ lang: "en" });
    assert.equal(result.persisted, false);
    assert.match(result.books, /buy\s+po-1/);
    assert.match(result.books, /iso9001\s+GITI-ISO-9001\s+Issued/);
    assert.match(result.books, /pmp\s+p-1\s+executing/);
    assert.match(result.books, /balanced/);
    assert.doesNotMatch(result.books, /Acme|North Supply|Widget/);
  });
});
