FROM node:20-slim AS base
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/shared ./shared
COPY --from=base /app/drizzle ./drizzle

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
