# ---------- BUILD STAGE ----------
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# Install base system certs
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates curl gnupg \
  && update-ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Copy manifests and prisma early for better caching
COPY package*.json ./
COPY prisma ./prisma

# Install deps INCLUDING devDeps (so prisma CLI exists)
RUN npm install --include=dev

# Copy the rest of the source and build TS
COPY . .
RUN npm run build

# Prune dev deps for a lean runtime image
RUN npm prune --production


# ---------- RUNTIME STAGE ----------
FROM node:20-bullseye-slim

WORKDIR /app

# Copy runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 4000

# ✅ Generate Prisma client, then run migrations (or db push if none), then start server
CMD ["sh", "-c", "npx prisma generate --schema=prisma/schema.prisma && (npx prisma migrate deploy || npx prisma db push) && node dist/index.js"]
