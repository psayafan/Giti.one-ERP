// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { createApp } from "./index.js";
import { seedDemo } from "./cli.js";
import { listenUi, moduleKind } from "./http.js";

const { server, port, host, erp } = await listenUi({
  port: 0,
  app: seedDemo(createApp()),
});
const base = `http://${host}:${port}`;

after(() => {
  server.close();
});

describe("local UI", () => {
  it("binds loopback only", () => {
    assert.equal(host, "127.0.0.1");
  });

  it("serves the books page", async () => {
    const res = await fetch(`${base}/`);
    const html = await res.text();
    assert.equal(res.status, 200);
    assert.match(html, /Giti\.one ERP/);
    assert.match(html, /app\.js/);
  });

  it("books API matches the demo cycle", async () => {
    const res = await fetch(`${base}/api/books?lang=en`);
    const books = await res.json();
    assert.equal(res.status, 200);
    assert.equal(books.stock[0].qty, 7);
    assert.equal(books.trial.balanced, true);
    assert.equal(books.invoices[0].id, "inv-1");
    assert.equal(books.payments[0].amount, 60);
  });

  it("Persian books labels", async () => {
    const res = await fetch(`${base}/api/books?lang=fa`);
    const books = await res.json();
    assert.equal(books.lang, "fa");
    assert.equal(books.title, "گیتی.وان ERP");
    assert.equal(
      books.trial.rows.find((row) => row.accountId === "GRNI").label,
      "کالای رسیده فاکتورنشده",
    );
  });

  it("catalog meta includes CRM notes lists meetings", async () => {
    const res = await fetch(`${base}/api/meta?lang=fa`);
    const meta = await res.json();
    const crm = meta.domains.find((domain) => domain.id === "crm");
    const ids = crm.modules.map((module) => module.id);
    assert.deepEqual(
      ["lists", "notes", "meetings"].every((id) => ids.includes(id)),
      true,
    );
    assert.equal(
      crm.modules.find((module) => module.id === "notes").label,
      "یادداشت",
    );
    assert.equal(meta.dir, "rtl");
    assert.equal(meta.ui.localOnly.includes("میزبانی"), true);
  });

  it("list and add stay on list/add", async () => {
    const listed = await fetch(`${base}/api/modules/crm/notes`);
    const before = await listed.json();
    const n = before.rows.length;
    const added = await fetch(`${base}/api/modules/crm/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "n-1", text: "follow up" }),
    });
    assert.equal(added.status, 201);
    const after = await (await fetch(`${base}/api/modules/crm/notes`)).json();
    assert.equal(after.rows.length, n + 1);
    assert.equal(after.kind, "slot");
  });

  it("unknown module is 404", async () => {
    const res = await fetch(`${base}/api/modules/crm/agents`);
    assert.equal(res.status, 404);
  });

  it("invoice add still posts", async () => {
    const res = await fetch(`${base}/api/modules/accounting/invoices`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: "inv-ui", partyId: "c1", amount: 10 }),
    });
    assert.equal(res.status, 201);
    assert.equal(erp.ledger.trialBalance().balanced, true);
    assert.equal(moduleKind("accounting", "invoices"), "posts");
    assert.equal(moduleKind("crm", "notes"), "slot");
  });

  it("rejects add without id", async () => {
    const res = await fetch(`${base}/api/modules/parties/customers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
    assert.equal(res.status, 400);
  });
});
