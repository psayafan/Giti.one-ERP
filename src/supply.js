// SPDX-License-Identifier: AGPL-3.0-or-later

function qtyOf(record) {
  const n = Number(record.qty);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error("qty must be a positive number");
  }
  return n;
}

export function wrapReceipts(store, moves, ledger) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      const row = store.add(record);
      if (record.qty == null) return row;
      const qty = qtyOf(record);
      const unitCost = Number(record.unitCost);
      moves.add({
        id: `m-${row.id}`,
        itemId: record.itemId,
        warehouseId: record.warehouseId,
        qty,
        unitCost,
        ref: row.id,
      });
      const amount = qty * unitCost;
      if (amount > 0) {
        ledger.post({
          id: `j-${row.id}`,
          debit: "inventory",
          credit: "AP",
          amount,
          ref: row.id,
        });
      }
      return row;
    },
  };
}

export function wrapDeliveries(store, moves, engine, ledger) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      if (record.qty != null) {
        const need = qtyOf(record);
        if (engine.onHand(record.itemId, record.warehouseId) < need) {
          throw new Error("insufficient stock");
        }
      }
      const row = store.add(record);
      if (record.qty == null) return row;
      const qty = qtyOf(record);
      const unitCost = engine.avgCost(record.itemId, record.warehouseId);
      moves.add({
        id: `m-${row.id}`,
        itemId: record.itemId,
        warehouseId: record.warehouseId,
        qty: -qty,
        unitCost,
        ref: row.id,
      });
      const amount = qty * unitCost;
      if (amount > 0) {
        ledger.post({
          id: `j-${row.id}`,
          debit: "cogs",
          credit: "inventory",
          amount,
          ref: row.id,
        });
      }
      return row;
    },
  };
}

export function wrapTransfers(store, moves, engine) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      if (record.qty != null) {
        const need = qtyOf(record);
        if (engine.onHand(record.itemId, record.fromWarehouseId) < need) {
          throw new Error("insufficient stock");
        }
      }
      const row = store.add(record);
      if (record.qty == null) return row;
      const qty = qtyOf(record);
      const unitCost = engine.avgCost(record.itemId, record.fromWarehouseId);
      moves.add({
        id: `m-${row.id}-out`,
        itemId: record.itemId,
        warehouseId: record.fromWarehouseId,
        qty: -qty,
        ref: row.id,
      });
      moves.add({
        id: `m-${row.id}-in`,
        itemId: record.itemId,
        warehouseId: record.toWarehouseId,
        qty,
        unitCost,
        ref: row.id,
      });
      return row;
    },
  };
}

export function wrapAdjustments(store, moves) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      const row = store.add(record);
      if (record.qty == null) return row;
      const n = Number(record.qty);
      if (!Number.isFinite(n) || n === 0) {
        throw new Error("qty must be a non-zero number");
      }
      moves.add({
        id: `m-${row.id}`,
        itemId: record.itemId,
        warehouseId: record.warehouseId,
        qty: n,
        unitCost: record.unitCost,
        ref: row.id,
      });
      return row;
    },
  };
}

export function wrapLandedCosts(store, ledger) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      const row = store.add(record);
      if (record.amount != null) {
        ledger.post({
          id: `j-${row.id}`,
          debit: "inventory",
          credit: "AP",
          amount: record.amount,
          ref: row.id,
        });
      }
      return row;
    },
  };
}

export function wrapBills(store, ledger) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      const row = store.add(record);
      if (record.amount != null) {
        ledger.post({
          id: `j-${row.id}`,
          debit: "expense",
          credit: "AP",
          amount: record.amount,
          ref: row.id,
        });
      }
      return row;
    },
  };
}
