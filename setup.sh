#!/usr/bin/env bash
# SPDX-License-Identifier: AGPL-3.0-or-later
# One command: Node deps, tests, Docker/Colima if needed, Postgres, demo books.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

need_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "Need Node.js 20 or newer." >&2
    exit 1
  fi
  local major
  major="$(node -p 'Number(process.versions.node.split(".")[0])')"
  if [ "$major" -lt 20 ]; then
    echo "Need Node.js 20 or newer (found $(node -v))." >&2
    exit 1
  fi
}

docker_ready() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    return 1
  fi
}

ensure_docker() {
  if docker_ready; then
    return 0
  fi
  if [ "$(uname -s)" != "Darwin" ]; then
    echo "Docker is not running. Install it and re-run ./setup.sh for Postgres."
    return 1
  fi
  if ! command -v brew >/dev/null 2>&1; then
    echo "Homebrew is missing. Install it and re-run ./setup.sh for Postgres."
    return 1
  fi
  if ! command -v docker >/dev/null 2>&1 || ! command -v colima >/dev/null 2>&1; then
    echo "Installing Colima and Docker CLI via Homebrew..."
    HOMEBREW_NO_AUTO_UPDATE=1 brew install colima docker docker-compose
  fi
  echo "Starting Colima..."
  colima start
  docker_ready
}

need_node

if [ ! -f .env ]; then
  cp .env.example .env
fi

npm install
npm test

PG=0
if ensure_docker; then
  compose up -d
  i=0
  while [ "$i" -lt 45 ]; do
    if compose exec -T postgres pg_isready -U giti >/dev/null 2>&1; then
      PG=1
      break
    fi
    i=$((i + 1))
    sleep 1
  done
  if [ "$PG" != 1 ]; then
    echo "Postgres did not become ready. Books will run in memory."
  fi
fi

if [ "$PG" = 1 ]; then
  DATABASE_URL="${DATABASE_URL:-postgres://giti:giti@127.0.0.1:5432/giti}"
  export DATABASE_URL
  node src/boot.js "$@"
else
  node src/cli.js "$@"
  echo
  echo "Postgres skipped. Books above are in memory."
fi
