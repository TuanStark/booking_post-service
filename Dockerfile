# Stage 1: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci
COPY . .

RUN DATABASE_URL="postgresql://post_user:12345@10.0.0.23:5441/post_db?schema=public" npx prisma generate
RUN npm run build

RUN npx tsc prisma.config.ts --module commonjs --target ES2020 --esModuleInterop --skipLibCheck --outDir . || true

# Stage 2: Prune production dependencies
FROM node:22-alpine AS pruner
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci

RUN npm prune --production && \
    npm install --save-prod ts-node typescript || true

RUN DATABASE_URL="postgresql://post_user:12345@10.0.0.23:5441/post_db?schema=public" npx prisma generate

# Stage 3: Production
FROM node:22-alpine AS production
WORKDIR /app


RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs


COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/scripts ./scripts
COPY --from=pruner --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma/migrations ./prisma/migrations
COPY --from=pruner --chown=nestjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER nestjs
EXPOSE 3010

CMD ["npm", "run", "start:migrate:prod"]