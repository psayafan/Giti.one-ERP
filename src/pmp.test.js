// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PROCESS_GROUPS } from "./iso.js";
import { createApp } from "./index.js";

describe("PMP process groups", () => {
  for (const group of PROCESS_GROUPS) {
    it(`accepts processGroup ${group}`, () => {
      const app = createApp();
      app.projects.projects.add({
        id: `p-${group}`,
        name: group,
        processGroup: group,
      });
      assert.equal(app.projects.projects.list()[0].processGroup, group);
    });
  }

  it("rejects an unknown process group", () => {
    const app = createApp();
    assert.throws(
      () =>
        app.projects.projects.add({
          id: "p-bad",
          processGroup: "scrum",
        }),
      /process group/,
    );
  });

  it("holds charter, stakeholder, wbs, schedule, cost, communication, risk, change", () => {
    const app = createApp();
    app.projects.charters.add({ id: "ch-1", projectId: "p-1" });
    app.projects.stakeholders.add({ id: "sh-1", projectId: "p-1" });
    app.projects.wbs.add({ id: "wbs-1", projectId: "p-1" });
    app.projects.schedules.add({ id: "sch-1", projectId: "p-1" });
    app.projects.costs.add({ id: "cost-1", projectId: "p-1", amount: 0 });
    app.projects.communications.add({ id: "com-1", projectId: "p-1" });
    app.projects.risks.add({ id: "risk-1", projectId: "p-1" });
    app.projects.changes.add({ id: "chg-1", projectId: "p-1" });
    assert.equal(app.projects.charters.list().length, 1);
    assert.equal(app.projects.changes.list().length, 1);
  });
});
