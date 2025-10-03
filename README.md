# IA-RPG - AI-Powered D&D Platform

A modern web platform for playing Dungeons & Dragons 5e with AI-powered game master assistance.

## Tech Stack

- **Frontend**: Next.js 14.2+ (App Router), React 18.3+, TypeScript 5.3+, TailwindCSS 3.4+
- **Backend**: Node.js 20 LTS, Express.js 4.19+, Socket.io 4.7+
- **Database**: PostgreSQL 15+ (Supabase), Prisma 5.20+
- **AI**: Anthropic Claude API (claude-3-5-sonnet-20241022)
- **Authentication**: NextAuth.js v5
- **Monorepo**: pnpm 9+ workspaces + Turborepo 2.0+

## Project Structure

```
iarpg/
├── apps/
│   ├── web/                # Next.js frontend
│   └── api/                # Express.js backend
├── packages/
│   ├── shared/             # Shared TypeScript types
│   ├── ui/                 # UI component library
│   ├── db/                 # Prisma database client
│   └── config/             # Shared configuration
├── docs/                   # Documentation
└── scripts/                # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- pnpm 9+
- PostgreSQL 15+ (or Supabase account)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iarpg
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up Supabase:
   - Go to https://app.supabase.com and create a new project
   - Select region: US East (minimize latency)
   - Choose PostgreSQL version 15+
   - Note your credentials from Project Settings → API:
     - Project URL
     - Anon (public) key
     - Service role key (keep secret!)
   - Note your database connection strings from Project Settings → Database:
     - Direct connection URL (for migrations)
     - Pooler connection URL (for application)

4. Set up environment variables:
```bash
# Copy example files
cp .env.example .env
cp packages/db/.env.example packages/db/.env

# Edit packages/db/.env with your Supabase credentials:
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

5. Run database migrations:
```bash
pnpm db:generate  # Generate Prisma Client
pnpm db:migrate   # Apply migrations to database
```

6. (Optional) Seed the database with test data:
```bash
pnpm db:seed
```

7. Start development servers:
```bash
pnpm dev
```

This will start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Available Scripts

### Workspace Scripts
- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps for production
- `pnpm lint` - Run linting across all packages
- `pnpm typecheck` - Run TypeScript type checking
- `pnpm test` - Run tests across all packages
- `pnpm clean` - Clean build artifacts and node_modules

### Database Scripts
- `pnpm db:migrate` - Run database migrations (creates and applies)
- `pnpm db:generate` - Generate Prisma Client from schema
- `pnpm db:studio` - Open Prisma Studio (visual database editor)
- `pnpm db:seed` - Seed database with test data
- `pnpm db:reset` - Reset database (WARNING: deletes all data)

## Workspaces

### Apps

- **web**: Next.js 14.2+ frontend with App Router
- **api**: Express.js backend with Socket.io for real-time features

### Packages

- **@iarpg/shared**: Shared TypeScript types and utilities
- **@iarpg/ui**: Reusable UI components (shadcn/ui based)
- **@iarpg/db**: Prisma database client and schemas
- **@iarpg/config**: Shared configuration

## Database Schema

The database consists of 6 core models:

1. **User** - Authentication and user profiles (email, username, tier: free/premium/master)
2. **Character** - D&D 5e character sheets with ability scores, HP, AC, spells, equipment
3. **Table** - RPG tables/sessions with play style (sync/async), privacy, and invite codes
4. **TableMember** - Many-to-many relationship between Users and Tables with Character assignment
5. **Message** - Chat messages with support for dice rolls, reactions, and threading
6. **CombatEncounter** - Combat tracking with initiative order and round management

See `packages/db/prisma/schema.prisma` for complete schema definition.

## Development Workflow

1. Stories are located in `docs/stories/`
2. Follow story acceptance criteria when implementing features
3. Update story checklists as tasks complete
4. Run tests before committing: `pnpm test`
5. Ensure linting passes: `pnpm lint`
6. Type check: `pnpm typecheck`

## Troubleshooting

### Database Connection Issues

**Error: "Can't reach database server"**
- Check your DATABASE_URL and DIRECT_URL in `packages/db/.env`
- Verify your Supabase project is active
- Check your IP is allowed in Supabase (Settings → Database → Connection Pooling)

**Error: "Migration failed"**
- Ensure DIRECT_URL uses port 5432 (direct connection)
- Ensure DATABASE_URL uses port 6543 (pooler connection)
- Both URLs should have correct password

**Error: "Prisma Client not generated"**
- Run `pnpm db:generate` to generate the client
- This happens automatically on `pnpm install` via postinstall hook

### Development Server Issues

**Error: "Port 3000 already in use"**
- Kill the process: `lsof -ti:3000 | xargs kill -9`
- Or use a different port: `PORT=3001 pnpm dev`

## License

MIT
