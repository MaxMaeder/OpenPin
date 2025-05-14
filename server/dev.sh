#!/usr/bin/env bash
# Unified local-development launcher for OpenPin
# ──────────────────────────────────────────────
# • DB_BACKEND=[postgres|firebase]   (default: postgres)
# • DB_PORT      host port for Postgres          (default: 5432)
# • STUDIO_PORT  host port for Prisma Studio     (default: 5555)
# • POSTGRES_PASSWORD must be set if DB_BACKEND=postgres
# • NO application env-vars are injected into the app container – it reads .env* inside
# • Ctrl-C cleanly stops every container we started (and the dev network if we created it)

[[ -f .env        ]] && { echo "🔵 Loading .env ...";        set -a; source .env;        set +a; }
[[ -f .env.dev    ]] && { echo "🟢 Loading .env.dev ...";    set -a; source .env.dev;    set +a; }

DB_BACKEND=${DB_BACKEND:-postgres}
[[ "$DB_BACKEND" =~ ^(postgres|firebase)$ ]] \
  || { echo "❌  DB_BACKEND must be postgres or firebase"; exit 1; }

[[ "$DB_BACKEND" == "postgres" ]] && : "${POSTGRES_PASSWORD:?❌  POSTGRES_PASSWORD must be set}"

DB_PORT=${DB_PORT:-5432}
STUDIO_PORT=${STUDIO_PORT:-5555}
NET=devnet
NM_VOL=openpin-dev-node-modules
DASH_NM_VOL=openpin-dev-dash-node-modules

# ──────────────────────────────────────────────
# 2.  Clean-up helper (runs on Ctrl-C / exit)
# ──────────────────────────────────────────────
cleanup () {
  echo -e "\n🧹  Cleaning up ..."
  docker stop openpin-dev      2>/dev/null || true
  docker stop prisma-studio    2>/dev/null || true
  [[ "$DB_BACKEND" == "postgres" ]] && docker stop openpin-dev-db 2>/dev/null || true
  # ▲ we **no longer remove $NET** – avoids dangling-network issues
}
trap cleanup INT TERM EXIT

# ──────────────────────────────────────────────
# 3.  Network / volumes
# ──────────────────────────────────────────────
docker network inspect "$NET" >/dev/null 2>&1 || { echo "🔵 Creating network $NET"; docker network create "$NET"; }
# docker volume inspect "$NM_VOL"  >/dev/null 2>&1 || { echo "🔵 Creating volume $NM_VOL";  docker volume create "$NM_VOL"; }
# docker volume inspect "$DASH_NM_VOL"  >/dev/null 2>&1 || { echo "🔵 Creating volume $DASH_NM_VOL";  docker volume create "$DASH_NM_VOL"; }

# ──────────────────────────────────────────────
# 3.  Postgres (optional)
# ──────────────────────────────────────────────
if [[ "$DB_BACKEND" == "postgres" ]]; then
  postgres_create () {
    echo "🔵 Creating new Postgres container ..."
    docker run -d --name openpin-dev-db --network "$NET" \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
      -e POSTGRES_DB=openpin \
      -p "$DB_PORT":5432 \
      postgres:15
  }

  if docker container inspect openpin-dev-db &>/dev/null; then
    echo "✅  Found existing Postgres container."
    if ! docker start openpin-dev-db >/dev/null 2>&1; then
      echo "⚠️  Could not start it (probably missing network) - recreating ..."
      docker rm -f openpin-dev-db
      postgres_create
    fi
  else
    postgres_create
  fi

  echo "⏳  Waiting for Postgres ..."
  until docker exec openpin-dev-db pg_isready -U postgres &>/dev/null; do sleep 1; done
  echo "✅  Postgres ready."

  TABLES=$(docker exec -e PGPASSWORD="$POSTGRES_PASSWORD" openpin-dev-db \
            psql -U postgres -d openpin -tAc "select count(*) from information_schema.tables where table_schema='public';")
  if [[ "$TABLES" == "0" ]]; then
    echo "🆕  Running initial Prisma migration ..."
    docker run --rm --network "$NET" \
      -u $(id -u):$(id -g) \
      -v "$PWD":/app -w /app \
      -e DATABASE_URL="postgresql://postgres:$POSTGRES_PASSWORD@openpin-dev-db:5432/openpin" \
      node:20-slim bash -c "npm ci --omit=dev --silent && npx prisma generate && npx prisma migrate deploy"
  fi

  #      -v "$NM_VOL":/app/node_modules \

  prisma_start () {
    docker run -d --name prisma-studio --network "$NET" \
      -u $(id -u):$(id -g) \
      -v "$PWD":/app -w /app \
      -e DATABASE_URL="postgresql://postgres:$POSTGRES_PASSWORD@openpin-dev-db:5432/openpin" \
      -p "$STUDIO_PORT":5555 \
      node:20-slim bash -c "npm ci --omit=dev --silent && npx prisma generate && npx prisma studio --hostname 0.0.0.0 --port 5555"
  }
  
  #-v "$NM_VOL":/app/node_modules \

  if docker container inspect prisma-studio &>/dev/null; then
    echo "✅  Found existing Prisma Studio."
    docker start prisma-studio >/dev/null 2>&1 || { docker rm -f prisma-studio; prisma_start; }
  else
    prisma_start
  fi
  echo "🔵 Prisma Studio running on http://localhost:$STUDIO_PORT"
fi

# ──────────────────────────────────────────────
# 4.  Build dev image if missing
# ──────────────────────────────────────────────
if ! docker image inspect openpin-server-dev &>/dev/null; then
  echo "🔵 Building openpin-server-dev image ..."
  docker build -t openpin-server-dev -f Dockerfile.dev .
fi

# ──────────────────────────────────────────────
# 5.  Start the application (attached)
# ──────────────────────────────────────────────
echo "🚀  Starting OpenPin dev server (Ctrl-C to quit)..."
docker run --rm -it \
  --name openpin-dev \
  --network $NET \
  -u $(id -u):$(id -g) \
  -v "$PWD":/app \
  -v "$FIREBASE_KEY_PATH":/keys/firebaseKey.json:ro \
  -w /app \
  -p 8080:8080 \
  openpin-server-dev \
  bash -c '
    set -e
    npm install
    (cd dashboard && npm install)
    npx --yes prisma generate
    npm run dev
  '

# -v "$NM_VOL":/app/node_modules \
# -v "$DASH_NM_VOL":/app/dashboard/node_modules \
