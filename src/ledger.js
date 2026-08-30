// SPDX-License-Identifier: AGPL-3.0-or-later

export const LEDGER_ACCOUNTS = [
  { id: "cash", name: "Cash", type: "asset" },
  { id: "AR", name: "Accounts receivable", type: "asset" },
  { id: "AP", name: "Accounts payable", type: "liability" },
  { id: "GRNI", name: "Goods received not invoiced", type: "liability" },
  { id: "inventory", name: "Inventory", type: "asset" },
  { id: "cogs", name: "Cost of goods sold", type: "expense" },
  { id: "expense", name: "Expense", type: "expense" },
  { id: "revenue", name: "Revenue", type: "income" },
  { id: "equity", name: "Equity", type: "equity" },
];

export function createLedger(journalStore, onPost) {
  function post({ id, debit, credit, amount, ref }) {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      throw new Error("amount must be a positive number");
    }
    if (!debit || !credit || debit === credit) {
      throw new Error("debit and credit must be different accounts");
    }
    const row = journalStore.add({
      id,
      debit: String(debit),
      credit: String(credit),
      amount: n,
      ref: ref == null ? undefined : String(ref),
    });
    if (typeof onPost === "function") {
      onPost({ ...row });
    }
    return { ...row };
  }

  function balance(accountId) {
    let debit = 0;
    let credit = 0;
    for (const row of journalStore.list()) {
      if (typeof row.amount !== "number") continue;
      if (row.debit === accountId) debit += row.amount;
      if (row.credit === accountId) credit += row.amount;
    }
    return { accountId, debit, credit, net: debit - credit };
  }

  function trialBalance() {
    const ids = new Set();
    for (const row of journalStore.list()) {
      if (typeof row.amount !== "number") continue;
      ids.add(row.debit);
      ids.add(row.credit);
    }
    const rows = [...ids].sort().map(balance);
    const sum = rows.reduce((total, row) => total + row.net, 0);
    return { rows, balanced: sum === 0 };
  }

  return { post, balance, trialBalance };
}

function wrapPostingStore(store, ledger, legs) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      const row = store.add(record);
      if (record.amount != null) {
        const { debit, credit } = legs(row);
        ledger.post({
          id: `j-${row.id}`,
          debit,
          credit,
          amount: record.amount,
          ref: row.id,
        });
      }
      return row;
    },
  };
}

export function wrapInvoiceStore(store, ledger) {
  return wrapPostingStore(store, ledger, () => ({ debit: "AR", credit: "revenue" }));
}

export function wrapPaymentStore(store, ledger) {
  return wrapPostingStore(store, ledger, (row) =>
    row.billId
      ? { debit: "AP", credit: "cash" }
      : { debit: "cash", credit: "AR" },
  );
}
