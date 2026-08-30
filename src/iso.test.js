// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createApp } from "./index.js";

describe("ISO 9001 records", () => {
  it("issues a controlled document", () => {
    const app = createApp();
    app.quality.documents.add({
      id: "GITI-ISO-9001",
      title: "Quality records",
      version: "1.0",
      status: "Issued",
    });
    assert.equal(app.quality.documents.list()[0].status, "Issued");
  });

  it("links CAPA to a nonconformance", () => {
    const app = createApp();
    app.quality.nonconformances.add({ id: "nc-1", title: "short pick" });
    app.quality.correctiveActions.add({
      id: "ca-1",
      nonconformanceId: "nc-1",
      title: "recount",
    });
    assert.equal(app.quality.correctiveActions.list()[0].nonconformanceId, "nc-1");
  });

  it("rejects CAPA without the nonconformance", () => {
    const app = createApp();
    assert.throws(
      () =>
        app.quality.correctiveActions.add({
          id: "ca-1",
          nonconformanceId: "missing",
        }),
      /nonconformance/,
    );
  });
});

describe("ISO 27001 records", () => {
  it("binds a user to a role and logs a journal post", () => {
    const app = createApp();
    app.platform.roles.add({ id: "accountant", name: "Accountant" });
    app.platform.users.add({ id: "u1", roleId: "accountant", name: "Ada" });
    app.accounting.invoices.add({ id: "inv-1", amount: 25 });
    assert.equal(app.platform.users.list()[0].roleId, "accountant");
    assert.equal(
      app.platform.auditLogs.list().some((row) => row.action === "journal.post"),
      true,
    );
  });

  it("opens an incident", () => {
    const app = createApp();
    app.platform.incidents.add({
      id: "inc-1",
      title: "failed login burst",
      status: "open",
    });
    assert.equal(app.platform.incidents.list()[0].status, "open");
  });
});

describe("ISO 55001 records", () => {
  it("registers an asset and a maintenance job", () => {
    const app = createApp();
    app.accounting.assets.add({
      id: "press-1",
      name: "Press",
      status: "in-service",
    });
    app.manufacturing.maintenance.add({
      id: "wo-1",
      assetId: "press-1",
      title: "oil change",
    });
    assert.equal(app.manufacturing.maintenance.list()[0].assetId, "press-1");
  });
});
