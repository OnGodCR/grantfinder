# backend/Dockerfile
FROM node:20-alpine

# 1) Install system deps needed by Prisma on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# 2) Install Node deps first (cache-friendly)
COPY package*.json ./
RUN npm install

# 3) Copy the rest of your source (includes prisma/schema.prisma)
COPY . .

# 4) Generate Prisma client (now that schema exists + OS deps are present)
RUN npx prisma generate

# 5) Build TypeScript
RUN npm run build

EXPOSE 4000

# 6) Start. (If you prefer, you can also run migrations here, but we do them in Railway Shell)
CMD ["node", "dist/index.js"]
