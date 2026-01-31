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

# Descomentar si falla next/image
# RUN apk add --no-cache libc6-compat

# usuario no-root
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

# prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# solo lo necesario para standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
