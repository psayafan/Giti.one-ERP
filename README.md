# Giti.one ERP

By **Poriya Sayafan**. Copyright (C) 2026 Poriya Sayafan.

A purchase order is a promise. It is not the books. Giti.one posts inventory and a **balanced journal** when goods are received or delivered — then AR, AP, and cash. ISO 9001 / 27001 / 55001 records and a PMP map live in the same catalog, not in a folder beside the system. PostgreSQL stores every module in one table: `erp_row`.

Hosted copies that you modify must share source under **AGPL-3.0-or-later**. The **Giti.one** name is a trademark. See [TRADEMARKS.md](TRADEMARKS.md).

This repository is **not** an ISO or PMI certificate.

## Run

```bash
node src/cli.js
node src/cli.js --lang fa
npm test
```

```bash
docker compose up -d
# DATABASE_URL=postgres://giti:giti@127.0.0.1:5432/giti
```

Schema: [`schema.sql`](schema.sql). Save/load: `src/postgres.js` (`persistApp` / `restoreApp`).

## Doctrine

1. One set of books. Debit equals credit.
2. A module is `list` / `add`. If it moves goods or money, it posts.
3. Documents (PO, SO) are not execution. Receipt and delivery are.
4. ISO packs are records in the ERP, not a certification claim.
5. Catalog ids stay English. Labels are English and فارسی (`src/locale.js`).

## ISO and PMP

- [ISO register](docs/iso/REGISTER.md)
- [ISO 9001](docs/iso/GITI-ISO-9001.md) · [ISO 27001](docs/iso/GITI-ISO-27001.md) · [ISO 55001](docs/iso/GITI-ISO-55001.md)
- [PMP / PMBOK](docs/PMP.md)

## License

[GNU Affero General Public License v3.0 or later](LICENSE).

## Security

[SECURITY.md](SECURITY.md) — mail psayafan@hotmail.com.
