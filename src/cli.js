#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createApp } from "./index.js";
import { accountLabel, langFromArgv, resolveLang, t } from "./locale.js";

function money(n) {
  return Number(n).toFixed(2).padStart(10);
}

export function seedDemo(app) {
  app.parties.vendors.add({ id: "v1", name: "vendor" });
  app.parties.customers.add({ id: "c1", name: "customer" });
  app.stock.items.add({ id: "SKU-1", name: "item" });
  app.stock.warehouses.add({ id: "MAIN", name: "warehouse" });
  app.buying.purchaseOrders.add({
    id: "po-1",
    vendorId: "v1",
    itemId: "SKU-1",
    qty: 10,
    unitCost: 8,
  });
  app.buying.receipts.add({
    id: "r-1",
    purchaseOrderId: "po-1",
    itemId: "SKU-1",
    warehouseId: "MAIN",
    qty: 10,
    unitCost: 8,
  });
  app.sales.saleOrders.add({
    id: "so-1",
    partyId: "c1",
    itemId: "SKU-1",
    qty: 3,
    unitPrice: 20,
  });
  app.stock.deliveries.add({
    id: "d-1",
    saleOrderId: "so-1",
    itemId: "SKU-1",
    warehouseId: "MAIN",
    qty: 3,
  });
  app.accounting.invoices.add({
    id: "inv-1",
    partyId: "c1",
    saleOrderId: "so-1",
    amount: 60,
  });
  app.accounting.payments.add({
    id: "pay-1",
    invoiceId: "inv-1",
    amount: 60,
  });
  app.quality.documents.add({
    id: "GITI-ISO-9001",
    title: "Quality records",
    version: "1.0",
    status: "Issued",
  });
  app.platform.roles.add({ id: "accountant" });
  app.platform.users.add({ id: "u1", roleId: "accountant" });
  app.accounting.assets.add({ id: "asset-1", status: "in-service" });
  app.manufacturing.maintenance.add({ id: "m-1", assetId: "asset-1" });
  app.projects.projects.add({ id: "p-1", processGroup: "executing" });
  app.projects.charters.add({ id: "ch-1", projectId: "p-1" });
  app.projects.stakeholders.add({ id: "sh-1", projectId: "p-1" });
  app.projects.wbs.add({ id: "wbs-1", projectId: "p-1" });
  app.projects.schedules.add({ id: "sch-1", projectId: "p-1" });
  app.projects.costs.add({ id: "cost-1", projectId: "p-1" });
  app.projects.communications.add({ id: "com-1", projectId: "p-1" });
  app.projects.risks.add({ id: "risk-1", projectId: "p-1" });
  app.projects.changes.add({ id: "chg-1", projectId: "p-1" });
  return app;
}

export function booksSnapshot(app, lang = "en") {
  const trial = app.ledger.trialBalance();
  const debitTotal = trial.rows.reduce((sum, row) => sum + row.debit, 0);
  const creditTotal = trial.rows.reduce((sum, row) => sum + row.credit, 0);
  return {
    title: t(lang, "title"),
    lang: resolveLang(lang),
    purchaseOrders: app.buying.purchaseOrders.list(),
    receipts: app.buying.receipts.list(),
    saleOrders: app.sales.saleOrders.list(),
    deliveries: app.stock.deliveries.list(),
    invoices: app.accounting.invoices.list(),
    payments: app.accounting.payments.list(),
    documents: app.quality.documents.list(),
    users: app.platform.users.list(),
    assets: app.accounting.assets.list(),
    projects: app.projects.projects.list(),
    stock: app.stockEngine.snapshot(),
    journals: app.accounting.journals.list(),
    trial: {
      rows: trial.rows.map((row) => ({
        accountId: row.accountId,
        label: accountLabel(lang, row.accountId),
        debit: row.debit,
        credit: row.credit,
        net: row.net,
      })),
      debitTotal,
      creditTotal,
      balanced: trial.balanced,
    },
  };
}

export function renderBooks(app, lang = "en") {
  const trial = app.ledger.trialBalance();
  const verb = (key) => t(lang, key).padEnd(8);
  const lines = [t(lang, "title"), ""];
  for (const row of app.buying.purchaseOrders.list()) {
    lines.push(
      `${verb("buy")}  ${row.id.padEnd(8)}  ${String(row.qty).padStart(4)} × ${Number(row.unitCost).toFixed(2)}`,
    );
  }
  for (const row of app.buying.receipts.list()) {
    lines.push(
      `${verb("receipt")}  ${row.id.padEnd(8)}  ${row.warehouseId.padEnd(8)}  +${row.qty}`,
    );
  }
  for (const row of app.sales.saleOrders.list()) {
    lines.push(
      `${verb("sell")}  ${row.id.padEnd(8)}  ${String(row.qty).padStart(4)} × ${Number(row.unitPrice).toFixed(2)}`,
    );
  }
  for (const row of app.stock.deliveries.list()) {
    lines.push(
      `${verb("delivery")}  ${row.id.padEnd(8)}  ${row.warehouseId.padEnd(8)}  -${row.qty}`,
    );
  }
  for (const row of app.accounting.invoices.list()) {
    lines.push(
      `${verb("invoice")}  ${row.id.padEnd(8)}  ${(row.partyId ?? "").padEnd(8)}  ${money(row.amount)}`,
    );
  }
  for (const row of app.accounting.payments.list()) {
    lines.push(
      `${verb("payment")}  ${row.id.padEnd(8)}  ${(row.invoiceId ?? row.billId ?? "").padEnd(8)}  ${money(row.amount)}`,
    );
  }
  lines.push("");
  for (const row of app.quality.documents.list()) {
    lines.push(
      `${verb("iso9001")}  ${row.id.padEnd(16)}  ${row.status ?? ""}`,
    );
  }
  for (const row of app.platform.users.list()) {
    lines.push(
      `${verb("iso27001")}  ${row.id.padEnd(16)}  ${row.roleId ?? ""}`,
    );
  }
  for (const row of app.accounting.assets.list()) {
    lines.push(
      `${verb("iso55001")}  ${row.id.padEnd(16)}  ${row.status ?? ""}`,
    );
  }
  for (const row of app.projects.projects.list()) {
    lines.push(
      `${verb("pmp")}  ${row.id.padEnd(16)}  ${row.processGroup ?? ""}`,
    );
  }
  lines.push("");
  for (const row of app.stockEngine.snapshot()) {
    lines.push(
      `${verb("stock")}  ${row.itemId.padEnd(8)}  ${row.warehouseId.padEnd(8)}  ${String(row.qty).padStart(4)}`,
    );
  }
  lines.push("");
  const debitHead = t(lang, "debit");
  const creditHead = t(lang, "credit");
  const nameWidth = lang === "fa" ? 28 : 12;
  lines.push(
    `${"".padEnd(nameWidth)}  ${debitHead.padStart(10)}  ${creditHead.padStart(10)}`,
  );
  for (const row of trial.rows) {
    const name = accountLabel(lang, row.accountId);
    lines.push(`${name.padEnd(nameWidth)}  ${money(row.debit)}  ${money(row.credit)}`);
  }
  const dr = trial.rows.reduce((sum, row) => sum + row.debit, 0);
  const cr = trial.rows.reduce((sum, row) => sum + row.credit, 0);
  lines.push(`${"".padEnd(nameWidth)}  ${"----------"}  ${"----------"}`);
  lines.push(
    `${"".padEnd(nameWidth)}  ${money(dr)}  ${money(cr)}  ${trial.balanced ? t(lang, "balanced") : t(lang, "unbalanced")}`,
  );
  return `${lines.join("\n")}\n`;
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const lang = langFromArgv(process.argv, process.env);
  process.stdout.write(renderBooks(seedDemo(createApp()), lang));
}
