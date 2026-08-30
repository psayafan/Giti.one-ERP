---
title: Installation
---

DOCUMENT GITI-INS  ·  Version 1.0  ·  30 August 2026
Classification: public
Prepared by Poriya Sayafan.

# Installation

One command after clone.

```bash
git clone https://github.com/psayafan/Giti.one-ERP.git
cd Giti.one-ERP
./setup.sh
```

`./setup.sh` installs npm dependencies, runs tests, starts PostgreSQL when Docker is available, loads the demo, and prints the books.

Persian CLI:

```bash
./setup.sh --lang fa
```

## What the script does

1. Checks Node.js 20+.
2. Copies `.env.example` to `.env` if `.env` is missing.
3. `npm install` and `npm test`.
4. If Docker is already running, `docker compose up -d`.
5. On macOS, if Docker is missing and Homebrew is present: install Colima and the Docker CLI, then start Colima.
6. When Postgres is ready, persist the demo into `erp_row` (`node src/boot.js`).
7. If Docker is missing, still print the same books in memory.

## Manual commands

```bash
node src/cli.js
node src/cli.js --lang fa
npm test
docker compose up -d
DATABASE_URL=postgres://giti:giti@127.0.0.1:5432/giti node src/boot.js
```

## Linux and Windows

Node 20+ is enough for the in-memory books. For Postgres, install Docker yourself and re-run `./setup.sh`. The script does not apt-get or run Docker Desktop setup on those systems.

## After install

You should see a buy → receipt → sell → delivery → invoice → payment cycle, ISO 9001 / 27001 / 55001 rows, a PMP project, stock 7, and a balanced trial. Demo party names are `vendor`, `customer`, `item`, `warehouse` — no extra brands.
