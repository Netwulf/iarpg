# Production image
FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm@9

WORKDIR /app

# Copy everything
COPY . .

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Build API
RUN cd apps/api && pnpm build

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start
WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
