---
title: MVP
---

DOCUMENT GITI-MVP  ·  Version 1.0  ·  31 August 2026
Classification: public
Prepared by Poriya Sayafan. This document is not an ISO or PMI certificate.

# Giti.one ERP — minimum viable product

Printable PDF: [GITI-MVP.pdf](GITI-MVP.pdf).

## 1. What this is

Giti.one is a Node.js ERP in git. A purchase order is a promise. It is not the books. When goods are received or delivered, Giti.one posts inventory and a balanced journal — then AR, AP, and cash. ISO 9001, ISO/IEC 27001, and ISO 55001 records and a PMP map live in the same catalog.

Source: [github.com/psayafan/Giti.one-ERP](https://github.com/psayafan/Giti.one-ERP). Site: [psayafan.github.io/Giti.one-ERP](https://psayafan.github.io/Giti.one-ERP/). License: AGPL-3.0-or-later. The **Giti.one** name is a trademark of Poriya Sayafan.

This MVP is the path that posts and the records that the tests prove. A name in the catalog is not a working module.

## 2. Doctrine

1. One set of books. Debit equals credit.
2. A module is `list` / `add`. If it moves goods or money, it posts.
3. Documents (purchase order, sale order) are not execution. Receipt and delivery are.
4. ISO packs are records in the ERP, not a certification claim.
5. Catalog ids stay English. Labels are English and Persian.

## 3. What the MVP actually does

### Buy → stock → sell → cash

The demo in `src/cli.js` (`seedDemo`) and `./setup.sh` runs this cycle:

| Step | Document | What posts |
|---|---|---|
| 1 | Purchase order `po-1` | Promise only. No journal. |
| 2 | Receipt `r-1` (10 × 8.00) | Stock +10. Inventory debit 80, GRNI credit 80. |
| 3 | Sale order `so-1` | Promise only. No journal. |
| 4 | Delivery `d-1` (qty 3) | Stock −3. COGS debit 24, inventory credit 24. |
| 5 | Invoice `inv-1` (60.00) | AR debit 60, revenue credit 60. |
| 6 | Payment `pay-1` (60.00) | Cash debit 60, AR credit 60. |

After the demo: on-hand **7** (`SKU-1` / `MAIN`), cash 60, GRNI 80, inventory 56, trial **balanced**. Party names are `vendor`, `customer`, `item`, `warehouse`.

### Other postings that already run

| Action | Module | Books |
|---|---|---|
| Vendor bill (unmatched expense) | `accounting.bills` | Expense / AP |
| Vendor payment | `accounting.payments` with `billId` | AP / cash |
| Landed cost | `buying.landedCosts` | Inventory / AP |
| Warehouse transfer | `stock.warehouseTransfers` | Qty moves; inventory value unchanged |
| Inventory adjustment | `stock.inventoryAdjustments` | On-hand changes |
| Stock move | `stock.stockMoves` | Inbound / outbound qty |

Receipts that name a purchase order cannot exceed remaining order qty. Deliveries cannot ship without stock and cannot exceed remaining sale-order qty.

## 4. ISO and PMP records

These are records and a map inside the catalog. They are not certificates.

| Pack | What is in the MVP |
|---|---|
| ISO 9001:2015 | Documents (Issued needs title and version), nonconformances, CAPA linked to an NC, internal audits, management reviews. |
| ISO/IEC 27001:2022 | Users bound to roles, audit log on journal post, incidents (open / contained / closed), asset inventory. |
| ISO 55001:2024 | Asset register (in-service / idle / disposed) and maintenance that names an asset. |
| PMP / PMBOK + ISO 21502 | `projects.projects.processGroup` is initiating, planning, executing, monitoring, or closing. Charters, stakeholders, workers, assignments, WBS, schedules, costs, communications, risks, and changes map on the same books. Quality rules are records (`quality.rules`), not agents. |

PostgreSQL views in `schema.sql` read those rows from one table, `erp_row`.

## 5. How to run it

```bash
git clone https://github.com/psayafan/Giti.one-ERP.git
cd Giti.one-ERP
./setup.sh
```

That installs dependencies, runs tests, starts PostgreSQL when Docker is available, loads the demo, and prints the books. Persian CLI: `./setup.sh --lang fa`.

Local UI (this machine only, not a hosted product):

```bash
npm start
```

Open http://127.0.0.1:3847. Bind is `127.0.0.1`. Default port 3847 (`GITI_PORT` to change). Books first; catalog is `list` / `add`. English and Persian.

Without Docker the same books print in memory. Need: Node.js 20 or newer. Postgres from compose uses demo user `giti` on `127.0.0.1:5432` — demo only.

## 6. What the catalog is — and is not

Every module in `src/catalog.js` has `list` / `add`. That is the extension rule (see `AGENTS.md`). HR, POS, manufacturing orders, CRM lists, and similar rows are catalog slots until they post. Do not present them as a finished ERP.

This MVP is not a public HTTP product, not a bank, not an FP&A agent, and not an AI CRM. Feature requests: [GitHub Issues](https://github.com/psayafan/Giti.one-ERP/issues) or mail psayafan@hotmail.com.

## 7. Tests and files

`npm test` must pass. The buy–sell–cash cycle, supply postings, ISO links, PMP process groups, locale (English and Persian), local UI, and `erp_row` round-trip are covered.

| Place | Address |
|---|---|
| Source | [github.com/psayafan/Giti.one-ERP](https://github.com/psayafan/Giti.one-ERP) |
| Wiki | [github.com/psayafan/Giti.one-ERP/wiki](https://github.com/psayafan/Giti.one-ERP/wiki) |
| Site | [psayafan.github.io/Giti.one-ERP](https://psayafan.github.io/Giti.one-ERP/) |
| Requirements / install / standards | `docs/REQUIREMENTS.md`, `docs/INSTALL.md`, `docs/STANDARDS.md` |
| ISO register | `docs/iso/REGISTER.md` |
| PMP map | `docs/PMP.md` |

## 8. Support

If the work is useful, there is no obligation: [PayPal](https://paypal.me/psayafan) · [GitHub Sponsors](https://github.com/sponsors/psayafan). Security: `SECURITY.md` or psayafan@hotmail.com.
