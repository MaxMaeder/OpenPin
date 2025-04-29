#!/usr/bin/env bash
set -euo pipefail

# Load env vars
if [[ -f .env ]]; then
  echo "Loading environment from .env"
  set -a
  source .env
  set +a
fi

# Check DB_BACKEND
DB_BACKEND=${DB_BACKEND:-postgres}  # default to postgres if not set

echo "Detected DB_BACKEND=$DB_BACKEND"

DOCKER_ARGS="$@"

if [[ "$DB_BACKEND" == "postgres" ]]; then
  echo "Starting app + Postgres database..."
  docker compose --profile with-db up $DOCKER_ARGS
elif [[ "$DB_BACKEND" == "firestore" ]]; then
  echo "Starting app only (Firestore backend)..."
  docker compose --profile no-db up $DOCKER_ARGS
else
  echo "❌ Unknown DB_BACKEND: '$DB_BACKEND'"
  echo "Please set DB_BACKEND=postgres or DB_BACKEND=firestore in .env"
  exit 1
fi
