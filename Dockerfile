FROM node:20-slim AS base

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Force development mode during build so devDependencies are installed
ENV NODE_ENV=development

# Install dependencies (include patches for pnpm)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild esbuild

# Copy source code
COPY . .

# Build client (vite) + server (esbuild)
RUN pnpm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

# Copy built artifacts and production dependencies
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
