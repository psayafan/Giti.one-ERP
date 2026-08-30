# For humans and their AIs

This is a Node.js ERP. Extend it by adding a row to `src/catalog.js` and a test. Keep `list` / `add`.

If the module moves money or stock, wire it through `src/ledger.js` or `src/stock.js`. If it is an ISO 9001 / 27001 / 55001 record or a PMP object, follow `src/iso.js` and `docs/PMP.md`. Persist with `src/postgres.js` into `erp_row`. Do not commit secrets.

Paste this file and say: “Add a module for X. Follow catalog.js.”
