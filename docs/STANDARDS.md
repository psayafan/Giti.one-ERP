---
title: Standards
---

DOCUMENT GITI-STD  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan.

# Standards

How this repository is kept. This page is programming and document control for Giti.one ERP. It is not a certificate.

## Repository files every public tree should keep

| File | Role |
|---|---|
| `README.md` | What it is and how to run |
| `LICENSE` | AGPL-3.0-or-later |
| `SECURITY.md` | Private vulnerability reports |
| `CONTRIBUTING.md` | How to change the tree |
| `CODE_OF_CONDUCT.md` | Contributor Covenant 2.1 |
| `TRADEMARKS.md` | The Giti.one name |
| `AGENTS.md` | How an AI extends the catalog |
| `docs/` | Versioned documented information (this site) |

## Programming

1. Node.js ESM, Node 20 or newer. SPDX `AGPL-3.0-or-later` on every source file.
2. Imports stay at the top of the module.
3. A module is a row in `src/catalog.js` plus a test. Keep `list` / `add`.
4. If it moves money or stock, post through `src/ledger.js` or `src/stock.js`. Debit equals credit.
5. Documents (PO, SO) are not execution. Receipt and delivery are.
6. ISO 9001 / 27001 / 55001 records and PMP objects follow `src/iso.js` and `docs/PMP.md`.
7. Persist with `src/postgres.js` into `erp_row`.
8. Catalog ids stay English. Labels are English and فارسی in `src/locale.js`.
9. Do not commit `.env`, keys, or customer data.
10. English for commits and docs. `npm test` must pass.

## Documented information

ISO 9001:2015, ISO/IEC 27001:2022, and ISO 55001:2024 records packs, plus the PMP map, live in `docs/` and on this site. They describe records in the ERP. They do not claim certification.

## License and name

Source is AGPL-3.0-or-later. Hosted copies you modify must share source. The **Giti.one** name is a trademark of Poriya Sayafan.
