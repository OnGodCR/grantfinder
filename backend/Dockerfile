# ---------- BUILD STAGE ----------
FROM node:20-bullseye-slim AS builder

WORKDIR /app

# 1) Install deps INCLUDING devDependencies (needed for Prisma CLI)
COPY package*.json ./
RUN npm install --include=dev

# 2) Copy the rest (brings in prisma/schema.prisma and src/)
COPY . .

# 3) Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# 4) Build TypeScript
RUN npm run build

# 5) Prune dev deps to ship a lean runtime
RUN npm prune --production


# ---------- RUNTIME STAGE ----------
FROM node:20-bullseye-slim

WORKDIR /app

# 6) Copy production node_modules and built app from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 4000
CMD ["node", "dist/index.js"]
