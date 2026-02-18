FROM node:20-slim AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild esbuild

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/shared ./shared
COPY --from=base /app/drizzle ./drizzle
COPY --from=base /app/client/public ./client/public

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
