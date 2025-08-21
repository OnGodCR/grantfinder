FROM node:20-alpine

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy the rest
COPY . .

# Generate Prisma client (safe even if already generated)
RUN npm run generate || npx prisma generate

# Build TypeScript
RUN npm run build

EXPOSE 4000
CMD ["node", "dist/index.js"]
