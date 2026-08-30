// SPDX-License-Identifier: AGPL-3.0-or-later

function keyOf(itemId, warehouseId) {
  return `${itemId}:${warehouseId}`;
}

export function createStockEngine(moveStore, quantStore) {
  const qtyByKey = new Map();
  const valueByKey = new Map();

  function onHand(itemId, warehouseId) {
    return qtyByKey.get(keyOf(itemId, warehouseId)) ?? 0;
  }

  function value(itemId, warehouseId) {
    return valueByKey.get(keyOf(itemId, warehouseId)) ?? 0;
  }

  function avgCost(itemId, warehouseId) {
    const qty = onHand(itemId, warehouseId);
    if (qty === 0) return 0;
    return value(itemId, warehouseId) / qty;
  }

  function apply({ id, itemId, warehouseId, qty, unitCost, ref }) {
    const n = Number(qty);
    if (!Number.isFinite(n) || n === 0) {
      throw new Error("qty must be a non-zero number");
    }
    const k = keyOf(itemId, warehouseId);
    const currentAvg = avgCost(itemId, warehouseId);
    const nextQty = onHand(itemId, warehouseId) + n;
    if (nextQty < 0) {
      throw new Error("insufficient stock");
    }
    let nextValue = value(itemId, warehouseId);
    if (n > 0) {
      const cost = Number(unitCost);
      if (!Number.isFinite(cost) || cost < 0) {
        throw new Error("inbound stock needs unitCost");
      }
      nextValue += n * cost;
    } else {
      nextValue += n * currentAvg;
    }
    if (nextQty === 0) nextValue = 0;
    qtyByKey.set(k, nextQty);
    valueByKey.set(k, nextValue);
    const move = moveStore.add({
      id,
      itemId: String(itemId),
      warehouseId: String(warehouseId),
      qty: n,
      unitCost: n > 0 ? Number(unitCost) : currentAvg,
      ref: ref == null ? undefined : String(ref),
    });
    quantStore.add({
      id: `q-${move.id}`,
      itemId: String(itemId),
      warehouseId: String(warehouseId),
      qty: nextQty,
      value: nextValue,
    });
    return move;
  }

  function snapshot() {
    return [...qtyByKey.entries()].map(([key, qty]) => {
      const [itemId, warehouseId] = key.split(":");
      return { itemId, warehouseId, qty, value: valueByKey.get(key) ?? 0 };
    });
  }

  function rebuild() {
    qtyByKey.clear();
    valueByKey.clear();
    for (const move of moveStore.list()) {
      if (typeof move.qty !== "number" || move.qty === 0) continue;
      const n = move.qty;
      const currentAvg = avgCost(move.itemId, move.warehouseId);
      const nextQty = onHand(move.itemId, move.warehouseId) + n;
      let nextValue = value(move.itemId, move.warehouseId);
      if (n > 0) {
        nextValue += n * Number(move.unitCost ?? 0);
      } else {
        nextValue += n * currentAvg;
      }
      if (nextQty === 0) nextValue = 0;
      qtyByKey.set(keyOf(move.itemId, move.warehouseId), nextQty);
      valueByKey.set(keyOf(move.itemId, move.warehouseId), nextValue);
    }
  }

  return { onHand, avgCost, apply, snapshot, rebuild };
}

export function wrapStockMoves(store, engine) {
  return {
    list() {
      return store.list();
    },
    add(record) {
      if (record.qty == null) {
        return store.add(record);
      }
      return engine.apply({
        id: record.id,
        itemId: record.itemId,
        warehouseId: record.warehouseId,
        qty: record.qty,
        unitCost: record.unitCost,
        ref: record.ref,
      });
    },
  };
}
