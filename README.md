# Giti.one ERP

By **Poriya Sayafan**. Copyright (C) 2026 Poriya Sayafan.

A purchase order is a promise. It is not the books. When goods are received or delivered, Giti.one posts inventory and a balanced journal — then AR, AP, and cash. ISO 9001, 27001, and 55001 records and a PMP map live in the same catalog.

This repository is **not** an ISO or PMI certificate. The **Giti.one** name is a trademark. Hosted copies that you modify must share source under **AGPL-3.0-or-later**.

## Run

```bash
git clone https://github.com/psayafan/Giti.one-ERP.git
cd Giti.one-ERP
./setup.sh
```

Persian CLI: `./setup.sh --lang fa`

Without Docker the same books print in memory.

## Documents

| Place | Address |
|---|---|
| Wiki | [github.com/psayafan/Giti.one-ERP/wiki](https://github.com/psayafan/Giti.one-ERP/wiki) · sources in [`wiki/`](wiki/) |
| Site | [psayafan.github.io/Giti.one-ERP](https://psayafan.github.io/Giti.one-ERP/) |
| Requirements | [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) |
| Installation | [docs/INSTALL.md](docs/INSTALL.md) |
| Standards | [docs/STANDARDS.md](docs/STANDARDS.md) |
| ISO register | [docs/iso/REGISTER.md](docs/iso/REGISTER.md) |
| PMP | [docs/PMP.md](docs/PMP.md) |

## Doctrine

1. One set of books. Debit equals credit.
2. A module is `list` / `add`. If it moves goods or money, it posts.
3. Documents (PO, SO) are not execution. Receipt and delivery are.
4. ISO packs are records in the ERP, not a certification claim.
5. Catalog ids stay English. Labels are English and Persian.

## Support

If the work is useful:

- [Donate with PayPal](https://paypal.me/psayafan)
- [GitHub Sponsors](https://github.com/sponsors/psayafan)

Issues: [github.com/psayafan/Giti.one-ERP/issues](https://github.com/psayafan/Giti.one-ERP/issues). Security: [SECURITY.md](SECURITY.md) or psayafan@hotmail.com.

## License

[GNU Affero General Public License v3.0 or later](LICENSE) · [Contributing](CONTRIBUTING.md) · [Code of conduct](CODE_OF_CONDUCT.md) · [Trademarks](TRADEMARKS.md)
