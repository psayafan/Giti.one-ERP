---
title: Requirements
---

DOCUMENT GITI-REQ  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan.

# Requirements

What you need to run Giti.one ERP from this repository.

## Runtime

| Need | Version | Required |
|---|---|---|
| Node.js | 20 or newer | Yes |
| npm | bundled with Node | Yes |
| Git | any current | Yes, to clone |
| Docker or Colima | current | No. Needed only to persist into PostgreSQL |
| Homebrew | current | No. On macOS `./setup.sh` uses it to install Colima if Docker is missing |

## What this tree is

- A Node.js ERP. Modules are `list` / `add` in memory.
- Optional PostgreSQL (`erp_row`) via `./setup.sh`.
- CLI demo in English and Persian.
- ISO 9001 / 27001 / 55001 records and a PMP map in the same catalog.

## What this tree is not

- Not a hosted product with a public HTTP server.
- Not an ISO or PMI certificate.
- Not a separate QMS, SIEM, or project tool beside the books.

## Ports and demo credentials

Local Postgres from `docker-compose.yml` uses user `giti`, database `giti`, password `giti` on `127.0.0.1:5432`. That password is for this demo only. Do not use it in production. Do not commit `.env`.
