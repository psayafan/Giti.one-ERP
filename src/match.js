// SPDX-License-Identifier: AGPL-3.0-or-later

export function findById(store, id) {
  if (id == null) return undefined;
  return store.list().find((row) => row.id === String(id));
}

export function threeWayMatch({ purchaseOrder, receipt, bill }) {
  if (!purchaseOrder || !receipt || !bill) {
    throw new Error("three-way match needs purchase order, receipt, and bill");
  }
  if (purchaseOrder.itemId && receipt.itemId && purchaseOrder.itemId !== receipt.itemId) {
    throw new Error("three-way match failed: item");
  }
  const recQty = Number(receipt.qty);
  const poQty = Number(purchaseOrder.qty);
  const unitCost = Number(purchaseOrder.unitCost ?? receipt.unitCost);
  if (!Number.isFinite(recQty) || recQty <= 0) {
    throw new Error("three-way match failed: receipt qty");
  }
  if (!Number.isFinite(poQty) || recQty > poQty) {
    throw new Error("three-way match failed: qty");
  }
  const expected = recQty * unitCost;
  if (Number(bill.amount) !== expected) {
    throw new Error("three-way match failed: amount");
  }
  return { ok: true, qty: recQty, amount: expected };
}

export function remainingOrderQty(order, lines, lineQtyKey = "qty") {
  const ordered = Number(order.qty);
  const used = lines.reduce((sum, line) => sum + Number(line[lineQtyKey] ?? 0), 0);
  return ordered - used;
}
