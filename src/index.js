// SPDX-License-Identifier: AGPL-3.0-or-later
import { MODULES, domains } from "./catalog.js";
import { createStore } from "./store.js";

export { MODULES, domains };

export function createApp() {
  const app = { kind: "erp" };
  for (const domain of domains()) {
    app[domain] = {};
  }
  for (const module of MODULES) {
    app[module.domain][module.id] = createStore();
  }
  return app;
}
