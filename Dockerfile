# ---------- base ----------
FROM node:20-alpine AS base
WORKDIR /app

RUN corepack enable

# ---------- deps ----------
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Prisma generate
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm prisma generate

# Build Next.js
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME="0.0.0.0"
ENV PORT="3000"

# Descomentar si falla next/image
# RUN apk add --no-cache libc6-compat

# usuario no-root
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

 # Copiar archivos necesarios
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Script de inicio para generar Prisma Client en runtime
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "server.js"]
