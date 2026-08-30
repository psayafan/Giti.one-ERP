// SPDX-License-Identifier: AGPL-3.0-or-later
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MODULES, createApp, domains } from "./index.js";

describe("every catalog module", () => {
  it("has unique domain.id pairs", () => {
    const keys = MODULES.map((module) => `${module.domain}.${module.id}`);
    assert.equal(keys.length, new Set(keys).size);
  });

  it("exposes every domain on createApp", () => {
    const app = createApp();
    for (const domain of domains()) {
      assert.equal(typeof app[domain], "object", `missing domain ${domain}`);
    }
  });

  for (const module of MODULES) {
    it(`${module.domain}.${module.id} list and add`, () => {
      const app = createApp();
      const store = app[module.domain][module.id];
      assert.ok(store, `missing ${module.domain}.${module.id}`);
      assert.equal(typeof store.list, "function");
      assert.equal(typeof store.add, "function");
      const before = store.list().length;
      const row = store.add({
        id: `${module.id}-probe`,
        name: module.id,
      });
      assert.equal(row.id, `${module.id}-probe`);
      assert.equal(store.list().length, before + 1);
      assert.equal(
        store.list().some((item) => item.id === `${module.id}-probe`),
        true,
      );
    });

    it(`${module.domain}.${module.id} does not leak across apps`, () => {
      const a = createApp();
      const b = createApp();
      a[module.domain][module.id].add({
        id: `${module.id}-only-a`,
        name: "a",
      });
      assert.equal(
        b[module.domain][module.id]
          .list()
          .some((item) => item.id === `${module.id}-only-a`),
        false,
      );
    });
  }
});
