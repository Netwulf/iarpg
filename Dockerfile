# Use Node.js 20 Alpine
# Force rebuild with tsconfig.json
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9

# Set working directory
WORKDIR /app

# Copy root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

# Copy all workspace packages
COPY packages ./packages
COPY apps ./apps

# Install dependencies (no frozen lockfile)
RUN pnpm install --no-frozen-lockfile

# Build API
RUN pnpm --filter=api build

# Production stage
FROM node:20-alpine AS production

RUN npm install -g pnpm@9

WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps/api ./apps/api

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Start API
CMD ["pnpm", "--filter=api", "start"]
