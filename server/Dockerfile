# ---------- base ----------
FROM node:20-slim AS base
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY package*.json ./
RUN npm ci
COPY dashboard/package*.json ./dashboard/
RUN cd dashboard && npm ci

# ---------- builder ----------
FROM deps AS builder
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN cd dashboard && npm run build
# builds root (tsc to lib/)
RUN npm run build    

# ---------- runtime ----------
FROM base AS runtime
ENV NODE_ENV=production
RUN npm i -g tini dotenv

ENTRYPOINT ["tini", "--"]

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/lib        ./lib
COPY --from=builder /app/dashboard/dist ./dashboard/dist
COPY --from=builder /app/prisma     ./prisma
COPY .env .env.prod ./
COPY package*.json ./

CMD ["bash", "-c", "npx prisma migrate deploy && dotenv -e .env -e .env.prod node lib/index.js"]

EXPOSE 9000
