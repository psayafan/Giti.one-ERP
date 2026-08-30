#!/usr/bin/env node
// SPDX-License-Identifier: AGPL-3.0-or-later
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createApp } from "./index.js";
import { seedDemo, renderBooks } from "./cli.js";
import { langFromArgv } from "./locale.js";
import { applySchema, createPool, persistApp } from "./postgres.js";

export async function boot(options = {}) {
  const lang = options.lang ?? "en";
  const url = options.url;
  const app = seedDemo(createApp());
  const books = renderBooks(app, lang);
  if (!url) {
    return { app, books, persisted: false, count: 0, views: null };
  }
  const pool = createPool(url);
  try {
    await applySchema(pool);
    const count = await persistApp(app, pool);
    const views = await pool.query(
      `SELECT
        (SELECT count(*)::int FROM iso_9001_documents) AS iso_9001,
        (SELECT count(*)::int FROM iso_27001_users) AS iso_27001,
        (SELECT count(*)::int FROM iso_55001_assets) AS iso_55001,
        (SELECT count(*)::int FROM pmp_projects) AS pmp`,
    );
    return { app, books, persisted: true, count, views: views.rows[0] };
  } finally {
    await pool.end();
  }
}

const isMain =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isMain) {
  const lang = langFromArgv(process.argv, process.env);
  const url = process.env.DATABASE_URL;
  const result = await boot({ lang, url });
  process.stdout.write(result.books);
  if (result.persisted) {
    process.stdout.write(
      `\npostgres  ${result.count} rows  iso_9001=${result.views.iso_9001}  iso_27001=${result.views.iso_27001}  iso_55001=${result.views.iso_55001}  pmp=${result.views.pmp}\n`,
    );
  }
}
