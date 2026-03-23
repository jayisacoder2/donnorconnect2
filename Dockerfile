# syntax=docker/dockerfile:1.4

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files first (for better caching)
COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

# Install dependencies with cache mount (HUGE speed boost on rebuilds)
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile || pnpm install

# Generate Prisma client (dummy URL for build - actual URL provided at runtime)
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" \
    npx prisma generate

# Copy source code
COPY . .

# Build Next.js with cache mount for faster rebuilds
RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install prisma CLI globally for migrations
RUN npm install -g prisma@7

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]