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

# Install Chromium and required dependencies for Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    fonts-freefont-ttf \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROMIUM_PATH=/usr/bin/chromium

# Copy built artifacts and production dependencies
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/shared ./shared
COPY --from=base /app/drizzle ./drizzle
COPY --from=base /app/client/public ./client/public
COPY --from=base /app/scripts ./scripts
RUN chmod +x ./scripts/startup.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bash", "./scripts/startup.sh"]
