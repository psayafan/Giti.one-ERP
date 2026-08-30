// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MODULES, createApp, domains } from "./index.js";

describe("giti-one-erp catalog", () => {
  it("loads every catalog module", () => {
    const app = createApp();
    assert.equal(app.kind, "erp");
    assert.ok(domains().length >= 8);
    assert.ok(MODULES.length >= 70);
    for (const module of MODULES) {
      const store = app[module.domain][module.id];
      assert.ok(store, `missing ${module.domain}.${module.id}`);
      store.add({ id: `${module.id}-1`, name: module.id });
      assert.equal(store.list().length, 1);
    }
  });

  it("keeps invoices under accounting", () => {
    const app = createApp();
    app.accounting.invoices.add({ id: "inv-1", partyId: "c1" });
    assert.equal(app.accounting.invoices.list()[0].partyId, "c1");
  });

  it("keeps documents under quality", () => {
    const app = createApp();
    app.quality.documents.add({ id: "doc-1", title: "quality-manual" });
    assert.equal(app.quality.documents.list()[0].title, "quality-manual");
  });
});
