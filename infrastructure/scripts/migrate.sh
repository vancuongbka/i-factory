#!/bin/bash
# Chạy TypeORM migrations
# Usage: ./infrastructure/scripts/migrate.sh [revert]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "$PROJECT_ROOT"

if [ "$1" = "revert" ]; then
  echo "Reverting last migration..."
  pnpm --filter @i-factory/api db:migrate:revert
else
  echo "Running pending migrations..."
  pnpm --filter @i-factory/api db:migrate
fi

echo "Done."
