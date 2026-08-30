# Giti.one ERP

By **Poriya Sayafan**. Copyright (C) 2026 Poriya Sayafan.

Open-source ERP in Node.js. Goods and money post a balanced journal. ISO 9001, 27001, and 55001 records live in named modules. PMP process groups and knowledge areas map onto `projects.*`. PostgreSQL stores every module as a row in `erp_row`.

Hosted copies that you modify must share source under **AGPL-3.0-or-later**. The **Giti.one** name is a trademark. See [TRADEMARKS.md](TRADEMARKS.md).

This repository is **not** an ISO or PMI certificate.

## Run

```bash
node src/cli.js
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

## ISO and PMP

- [ISO register](docs/iso/REGISTER.md)
- [ISO 9001](docs/iso/GITI-ISO-9001.md) · [ISO 27001](docs/iso/GITI-ISO-27001.md) · [ISO 55001](docs/iso/GITI-ISO-55001.md)
- [PMP / PMBOK](docs/PMP.md)

## License

[GNU Affero General Public License v3.0 or later](LICENSE).

## Security

[SECURITY.md](SECURITY.md) — mail psayafan@hotmail.com.
