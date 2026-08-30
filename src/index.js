// SPDX-License-Identifier: AGPL-3.0-or-later
import { MODULES, domains } from "./catalog.js";
import { createStore } from "./store.js";
import {
  LEDGER_ACCOUNTS,
  createLedger,
  wrapInvoiceStore,
  wrapPaymentStore,
} from "./ledger.js";
import { createStockEngine, wrapStockMoves } from "./stock.js";
import {
  wrapAdjustments,
  wrapBills,
  wrapDeliveries,
  wrapLandedCosts,
  wrapReceipts,
  wrapTransfers,
} from "./supply.js";
import {
  ASSET_STATUSES,
  INCIDENT_STATUSES,
  PROCESS_GROUPS,
  RACI_ROLES,
  wrapDocuments,
  wrapLinked,
  wrapStatus,
} from "./iso.js";

export { MODULES, domains };
export { LEDGER_ACCOUNTS, createLedger };

export function createApp(options = {}) {
  const app = { kind: "erp" };
  for (const domain of domains()) {
    app[domain] = {};
  }
  for (const module of MODULES) {
    app[module.domain][module.id] = createStore();
  }
  if (options.hydrate) {
    for (const row of options.hydrate) {
      app[row.domain][row.module].load([row.payload]);
    }
  } else {
    for (const account of LEDGER_ACCOUNTS) {
      app.accounting.accounts.add(account);
    }
  }
  const auditStore = app.platform.auditLogs;
  const ledger = createLedger(app.accounting.journals, (entry) => {
    auditStore.add({
      id: `aud-${entry.id}`,
      action: "journal.post",
      ref: entry.id,
      debit: entry.debit,
      credit: entry.credit,
      amount: entry.amount,
    });
  });
  const stock = createStockEngine(app.stock.stockMoves, app.stock.stockQuants);
  app.stock.stockMoves = wrapStockMoves(app.stock.stockMoves, stock);
  app.stock.deliveries = wrapDeliveries(
    app.stock.deliveries,
    app.stock.stockMoves,
    stock,
    ledger,
    app.sales.saleOrders,
  );
  app.stock.warehouseTransfers = wrapTransfers(
    app.stock.warehouseTransfers,
    app.stock.stockMoves,
    stock,
  );
  app.stock.inventoryAdjustments = wrapAdjustments(
    app.stock.inventoryAdjustments,
    app.stock.stockMoves,
  );
  app.buying.receipts = wrapReceipts(
    app.buying.receipts,
    app.stock.stockMoves,
    ledger,
    app.buying.purchaseOrders,
  );
  app.buying.landedCosts = wrapLandedCosts(app.buying.landedCosts, ledger);
  app.accounting.invoices = wrapInvoiceStore(app.accounting.invoices, ledger);
  app.accounting.payments = wrapPaymentStore(app.accounting.payments, ledger);
  app.accounting.bills = wrapBills(
    app.accounting.bills,
    ledger,
    app.buying.purchaseOrders,
    app.buying.receipts,
  );
  app.quality.documents = wrapDocuments(app.quality.documents);
  app.quality.correctiveActions = wrapLinked(
    app.quality.correctiveActions,
    app.quality.nonconformances,
    "nonconformanceId",
    "corrective action needs a nonconformance",
  );
  app.accounting.assets = wrapStatus(
    app.accounting.assets,
    "status",
    ASSET_STATUSES,
    "asset status",
  );
  app.manufacturing.maintenance = wrapLinked(
    app.manufacturing.maintenance,
    app.accounting.assets,
    "assetId",
    "maintenance needs an asset",
  );
  app.platform.users = wrapLinked(
    app.platform.users,
    app.platform.roles,
    "roleId",
    "user needs a role",
  );
  app.platform.incidents = wrapStatus(
    app.platform.incidents,
    "status",
    INCIDENT_STATUSES,
    "incident status",
  );
  app.projects.projects = wrapStatus(
    app.projects.projects,
    "processGroup",
    PROCESS_GROUPS,
    "process group",
  );
  app.projects.workers = wrapLinked(
    app.projects.workers,
    app.projects.projects,
    "projectId",
    "worker needs a project",
  );
  app.projects.assignments = wrapLinked(
    app.projects.assignments,
    app.projects.workers,
    "workerId",
    "assignment needs a worker",
  );
  app.projects.raci = wrapStatus(
    wrapLinked(
      app.projects.raci,
      app.projects.projects,
      "projectId",
      "raci needs a project",
    ),
    "role",
    RACI_ROLES,
    "raci role",
  );
  app.crm.listEntries = wrapLinked(
    app.crm.listEntries,
    app.crm.lists,
    "listId",
    "list entry needs a list",
  );
  app.crm.savedViews = wrapLinked(
    app.crm.savedViews,
    app.crm.lists,
    "listId",
    "saved view needs a list",
  );
  stock.rebuild();
  app.ledger = ledger;
  app.stockEngine = stock;
  return app;
}
