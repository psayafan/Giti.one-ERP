// SPDX-License-Identifier: AGPL-3.0-or-later
/** In-memory rows. Same list/add shape for every ERP module stub. */

export function createStore() {
  const rows = [];
  return {
    list() {
      return rows.map((row) => ({ ...row }));
    },
    add(record) {
      const row = { ...record, id: String(record.id) };
      rows.push(row);
      return { ...row };
    },
    load(records) {
      for (const record of records) {
        rows.push({ ...record, id: String(record.id) });
      }
    },
  };
}
