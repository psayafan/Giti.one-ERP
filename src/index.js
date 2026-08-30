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

export { MODULES, domains };
export { LEDGER_ACCOUNTS, createLedger };

export function createApp() {
  const app = { kind: "erp" };
  for (const domain of domains()) {
    app[domain] = {};
  }
  for (const module of MODULES) {
    app[module.domain][module.id] = createStore();
  }
  for (const account of LEDGER_ACCOUNTS) {
    app.accounting.accounts.add(account);
  }
  const ledger = createLedger(app.accounting.journals);
  const stock = createStockEngine(app.stock.stockMoves, app.stock.stockQuants);
  app.stock.stockMoves = wrapStockMoves(app.stock.stockMoves, stock);
  app.stock.deliveries = wrapDeliveries(
    app.stock.deliveries,
    app.stock.stockMoves,
    stock,
    ledger,
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
  );
  app.buying.landedCosts = wrapLandedCosts(app.buying.landedCosts, ledger);
  app.accounting.invoices = wrapInvoiceStore(app.accounting.invoices, ledger);
  app.accounting.payments = wrapPaymentStore(app.accounting.payments, ledger);
  app.accounting.bills = wrapBills(app.accounting.bills, ledger);
  app.ledger = ledger;
  app.stockEngine = stock;
  return app;
}
