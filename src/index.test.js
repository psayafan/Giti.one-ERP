// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { MODULES, createApp, domains } from "./index.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("giti-one-erp catalog", () => {
  it("loads every catalog module", () => {
    const app = createApp();
    assert.equal(app.kind, "erp");
    assert.ok(domains().length >= 8);
    assert.ok(MODULES.length >= 70);
    for (const module of MODULES) {
      const store = app[module.domain][module.id];
      assert.ok(store, `missing ${module.domain}.${module.id}`);
      const before = store.list().length;
      store.add({ id: `${module.id}-1`, name: module.id });
      assert.equal(store.list().length, before + 1);
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

describe("giti-one-erp ledger", () => {
  it("posts an invoice as AR debit and revenue credit", () => {
    const app = createApp();
    app.parties.customers.add({ id: "c1", name: "Acme" });
    app.accounting.invoices.add({ id: "inv-1", partyId: "c1", amount: 100 });
    const journals = app.accounting.journals.list();
    assert.equal(journals.length, 1);
    assert.equal(journals[0].debit, "AR");
    assert.equal(journals[0].credit, "revenue");
    assert.equal(journals[0].amount, 100);
    const trial = app.ledger.trialBalance();
    assert.equal(trial.balanced, true);
    assert.equal(app.ledger.balance("AR").net, 100);
    assert.equal(app.ledger.balance("revenue").net, -100);
  });

  it("posts a payment as cash debit and AR credit", () => {
    const app = createApp();
    app.accounting.invoices.add({ id: "inv-1", amount: 100 });
    app.accounting.payments.add({ id: "pay-1", invoiceId: "inv-1", amount: 100 });
    assert.equal(app.ledger.balance("AR").net, 0);
    assert.equal(app.ledger.balance("cash").net, 100);
    assert.equal(app.ledger.trialBalance().balanced, true);
  });

  it("rejects a non-positive invoice amount", () => {
    const app = createApp();
    assert.throws(
      () => app.accounting.invoices.add({ id: "inv-bad", amount: 0 }),
      /positive number/,
    );
  });

  it("cli prints a balanced trial", () => {
    const out = execFileSync(process.execPath, [join(root, "cli.js")], {
      encoding: "utf8",
    });
    assert.match(out, /buy\s+po-1/);
    assert.match(out, /receipt\s+r-1/);
    assert.match(out, /sell\s+so-1/);
    assert.match(out, /stock\s+SKU-1\s+MAIN\s+7/);
    assert.match(out, /invoice\s+inv-1/);
    assert.match(out, /payment\s+pay-1/);
    assert.match(out, /balanced/);
  });
});

describe("giti-one-erp supply chain", () => {
  it("receives purchase into stock and AP", () => {
    const app = createApp();
    app.buying.receipts.add({
      id: "r-1",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 10,
      unitCost: 8,
    });
    assert.equal(app.stockEngine.onHand("SKU-1", "MAIN"), 10);
    assert.equal(app.ledger.balance("inventory").net, 80);
    assert.equal(app.ledger.balance("AP").net, -80);
    assert.equal(app.ledger.trialBalance().balanced, true);
  });

  it("delivers a sale, drops stock, and posts COGS", () => {
    const app = createApp();
    app.buying.receipts.add({
      id: "r-1",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 10,
      unitCost: 8,
    });
    app.stock.deliveries.add({
      id: "d-1",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 3,
    });
    assert.equal(app.stockEngine.onHand("SKU-1", "MAIN"), 7);
    assert.equal(app.ledger.balance("inventory").net, 56);
    assert.equal(app.ledger.balance("cogs").net, 24);
  });

  it("refuses a delivery with no stock", () => {
    const app = createApp();
    assert.throws(
      () =>
        app.stock.deliveries.add({
          id: "d-1",
          itemId: "SKU-1",
          warehouseId: "MAIN",
          qty: 1,
        }),
      /insufficient stock/,
    );
  });
});
