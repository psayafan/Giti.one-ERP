// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { seedDemo } from "./cli.js";
import { createApp } from "./index.js";

const root = dirname(fileURLToPath(import.meta.url));

describe("finance posting", () => {
  it("invoice posts AR and revenue", () => {
    const app = createApp();
    app.accounting.invoices.add({ id: "inv-1", partyId: "c1", amount: 100 });
    assert.equal(app.ledger.balance("AR").net, 100);
    assert.equal(app.ledger.balance("revenue").net, -100);
    assert.equal(app.ledger.trialBalance().balanced, true);
  });

  it("customer payment clears AR into cash", () => {
    const app = createApp();
    app.accounting.invoices.add({ id: "inv-1", amount: 100 });
    app.accounting.payments.add({ id: "pay-1", invoiceId: "inv-1", amount: 100 });
    assert.equal(app.ledger.balance("AR").net, 0);
    assert.equal(app.ledger.balance("cash").net, 100);
  });

  it("bill posts expense and AP", () => {
    const app = createApp();
    app.accounting.bills.add({ id: "bill-1", vendorId: "v1", amount: 40 });
    assert.equal(app.ledger.balance("expense").net, 40);
    assert.equal(app.ledger.balance("AP").net, -40);
  });

  it("vendor payment clears AP from cash", () => {
    const app = createApp();
    app.accounting.bills.add({ id: "bill-1", amount: 40 });
    app.accounting.payments.add({ id: "pay-v", billId: "bill-1", amount: 40 });
    assert.equal(app.ledger.balance("AP").net, 0);
    assert.equal(app.ledger.balance("cash").net, -40);
  });

  it("rejects a zero invoice amount", () => {
    const app = createApp();
    assert.throws(
      () => app.accounting.invoices.add({ id: "inv-bad", amount: 0 }),
      /positive number/,
    );
  });
});

describe("inventory and supply chain posting", () => {
  it("receipt raises stock, inventory, and GRNI", () => {
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
    assert.equal(app.ledger.balance("GRNI").net, -80);
  });

  it("delivery drops stock and posts COGS", () => {
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

  it("refuses delivery with no stock", () => {
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

  it("warehouse transfer moves qty without changing inventory value", () => {
    const app = createApp();
    app.buying.receipts.add({
      id: "r-1",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 10,
      unitCost: 8,
    });
    app.stock.warehouseTransfers.add({
      id: "t-1",
      itemId: "SKU-1",
      fromWarehouseId: "MAIN",
      toWarehouseId: "EAST",
      qty: 4,
    });
    assert.equal(app.stockEngine.onHand("SKU-1", "MAIN"), 6);
    assert.equal(app.stockEngine.onHand("SKU-1", "EAST"), 4);
    assert.equal(app.ledger.balance("inventory").net, 80);
    assert.equal(app.ledger.trialBalance().balanced, true);
  });

  it("inventory adjustment inbound raises on-hand", () => {
    const app = createApp();
    app.stock.inventoryAdjustments.add({
      id: "adj-1",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 5,
      unitCost: 8,
    });
    assert.equal(app.stockEngine.onHand("SKU-1", "MAIN"), 5);
  });

  it("landed cost increases inventory and AP", () => {
    const app = createApp();
    app.buying.receipts.add({
      id: "r-1",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 10,
      unitCost: 8,
    });
    app.buying.landedCosts.add({
      id: "lc-1",
      receiptId: "r-1",
      amount: 10,
    });
    assert.equal(app.ledger.balance("inventory").net, 90);
    assert.equal(app.ledger.balance("GRNI").net, -80);
    assert.equal(app.ledger.balance("AP").net, -10);
  });

  it("stock move inbound and outbound keep trial balanced", () => {
    const app = createApp();
    app.stock.stockMoves.add({
      id: "m-in",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: 2,
      unitCost: 10,
    });
    app.stock.stockMoves.add({
      id: "m-out",
      itemId: "SKU-1",
      warehouseId: "MAIN",
      qty: -1,
    });
    assert.equal(app.stockEngine.onHand("SKU-1", "MAIN"), 1);
  });
});

describe("buy-sell-cash cycle", () => {
  it("seedDemo leaves 7 on hand, cash 60, GRNI 80, trial balanced", () => {
    const app = seedDemo(createApp());
    assert.equal(app.stockEngine.onHand("SKU-1", "MAIN"), 7);
    assert.equal(app.ledger.balance("cash").net, 60);
    assert.equal(app.ledger.balance("AR").net, 0);
    assert.equal(app.ledger.balance("GRNI").net, -80);
    assert.equal(app.ledger.balance("AP").net, 0);
    assert.equal(app.ledger.balance("inventory").net, 56);
    assert.equal(app.ledger.balance("cogs").net, 24);
    assert.equal(app.ledger.balance("revenue").net, -60);
    assert.equal(app.ledger.trialBalance().balanced, true);
  });

  it("cli prints the cycle", () => {
    const out = execFileSync(process.execPath, [join(root, "cli.js")], {
      encoding: "utf8",
    });
    assert.match(out, /buy\s+po-1/);
    assert.match(out, /receipt\s+r-1/);
    assert.match(out, /sell\s+so-1/);
    assert.match(out, /stock\s+SKU-1\s+MAIN\s+7/);
    assert.match(out, /invoice\s+inv-1/);
    assert.match(out, /payment\s+pay-1/);
    assert.match(out, /iso9001\s+GITI-ISO-9001\s+Issued/);
    assert.match(out, /iso27001\s+u1\s+accountant/);
    assert.match(out, /iso55001\s+asset-1\s+in-service/);
    assert.match(out, /pmp\s+p-1\s+executing/);
    assert.match(out, /balanced/);
  });
});
