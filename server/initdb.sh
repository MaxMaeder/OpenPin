#!/usr/bin/env bash
set -euo pipefail

echo "🏗️  Setting up OpenPin server..."

# 1. Start just the DB (so we can migrate)
echo "🔵 Starting database service..."
docker compose up -d db

# 2. Wait for the database to be ready
echo "🔵 Waiting for Postgres at localhost:5432..."

until pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; do
  sleep 1
done

echo "✅ Database is ready."

# 3. Run migrations
echo "🔵 Running Prisma migrations..."
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/openpin" \
npx prisma migrate dev --name init

echo "✅ Migrations complete."

# 4. Now bring up the full app
echo "🚀 Starting application and database together..."
docker compose up -d

echo "🎉 OpenPin is now running!"
