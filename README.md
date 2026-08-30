# Giti.one ERP

By **Poriya Sayafan**. Copyright (C) 2026 Poriya Sayafan.

Open-source ERP in Node.js. **Finance, inventory, and supply chain post together:** buy into stock and AP, sell out of stock with COGS, invoice AR, take cash, keep a balanced trial.

Hosted copies that you modify must share source under **AGPL-3.0-or-later**. The **Giti.one** name is a trademark. See [TRADEMARKS.md](TRADEMARKS.md).

## Run

```bash
node src/cli.js
npm test
```

```text
Giti.one ERP

buy       po-1        10 × 8.00
receipt   r-1       MAIN      +10
sell      so-1         3 × 20.00
delivery  d-1       MAIN      -3
invoice   inv-1     c1            60.00
payment   pay-1     inv-1         60.00

stock     SKU-1     MAIN         7
```

Node 20+. No extra packages.

## What posts today

| Flow | `add` | Effect |
|---|---|---|
| Purchase receipt | `buying.receipts` | stock +, Dr inventory / Cr AP |
| Delivery | `stock.deliveries` | stock −, Dr COGS / Cr inventory |
| Warehouse transfer | `stock.warehouseTransfers` | stock MAIN → other |
| Landed cost | `buying.landedCosts` | Dr inventory / Cr AP |
| Customer invoice | `accounting.invoices` | Dr AR / Cr revenue |
| Customer payment | `accounting.payments` | Dr cash / Cr AR |
| Vendor bill | `accounting.bills` | Dr expense / Cr AP |
| Vendor payment | `accounting.payments` with `billId` | Dr AP / Cr cash |

Purchase orders and sale orders are the documents. Receipts and deliveries are what move stock. Other catalog modules (`src/catalog.js`) still use `list` / `add` until they grow the same way.

## Layout

```text
src/catalog.js     modules
src/store.js       list / add
src/ledger.js      journal + trial balance
src/stock.js       on-hand qty and value
src/supply.js      buy / receive / deliver / transfer
src/index.js       createApp()
src/cli.js         one buy–sell–cash cycle
```

## License

[GNU Affero General Public License v3.0 or later](LICENSE).

## Security

[SECURITY.md](SECURITY.md) — mail psayafan@hotmail.com.
