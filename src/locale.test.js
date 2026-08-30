// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createApp } from "./index.js";
import { seedDemo, renderBooks } from "./cli.js";
import {
  LANGS,
  accountLabel,
  langFromArgv,
  missingFaLabels,
  moduleLabel,
  resolveLang,
  t,
  uiLabels,
} from "./locale.js";

describe("locale", () => {
  it("resolves fa aliases", () => {
    assert.equal(resolveLang("fa"), "fa");
    assert.equal(resolveLang("persian"), "fa");
    assert.equal(resolveLang("en"), "en");
    assert.equal(langFromArgv(["node", "cli", "--lang", "fa"], {}), "fa");
    assert.equal(langFromArgv(["node", "cli"], { GITI_LANG: "fa" }), "fa");
  });

  it("covers every catalog module in Persian", () => {
    assert.deepEqual(missingFaLabels(), []);
    assert.equal(moduleLabel("fa", "buying", "receipts"), "رسید انبار");
    assert.equal(moduleLabel("fa", "crm", "notes"), "یادداشت");
    assert.equal(accountLabel("fa", "GRNI"), "کالای رسیده فاکتورنشده");
    assert.equal(LANGS.includes("fa"), true);
    assert.match(uiLabels("en").localOnly, /Local only/);
  });

  it("renders the demo books in Persian", () => {
    const out = renderBooks(seedDemo(createApp()), "fa");
    assert.match(out, /گیتی\.وان ERP/);
    assert.match(out, /رسید/);
    assert.match(out, /ایزو۹۰۰۱/);
    assert.match(out, /پی‌ام‌پی/);
    assert.match(out, /بدهکار/);
    assert.match(out, /تراز/);
    assert.doesNotMatch(out, /Acme|North Supply|Widget/);
    assert.equal(t("fa", "unbalanced"), "نامتراز");
  });
});
