#!/bin/bash
# Seed development data
# Usage: ./infrastructure/scripts/seed-dev.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "$PROJECT_ROOT"

echo "Seeding development data..."
pnpm --filter @i-factory/api db:seed
echo "Done."
