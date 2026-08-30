// SPDX-License-Identifier: AGPL-3.0-or-later
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { MODULES, createApp } from "./index.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function createPool(connectionString) {
  return new pg.Pool({ connectionString });
}

export async function applySchema(pool) {
  const sql = await readFile(join(root, "schema.sql"), "utf8");
  await pool.query(sql);
}

export function dumpApp(app) {
  const rows = [];
  for (const module of MODULES) {
    for (const payload of app[module.domain][module.id].list()) {
      rows.push({
        domain: module.domain,
        module: module.id,
        id: String(payload.id),
        payload,
      });
    }
  }
  return rows;
}

export async function persistApp(app, pool) {
  const rows = dumpApp(app);
  await pool.query("DELETE FROM erp_row");
  for (const row of rows) {
    await pool.query(
      "INSERT INTO erp_row (domain, module, id, payload) VALUES ($1, $2, $3, $4)",
      [row.domain, row.module, row.id, JSON.stringify(row.payload)],
    );
  }
  return rows.length;
}

export async function restoreApp(pool) {
  const result = await pool.query(
    "SELECT domain, module, id, payload FROM erp_row",
  );
  return createApp({ hydrate: result.rows });
}
