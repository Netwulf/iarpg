# IA-RPG Expansion Pack - Development Guide

## 📋 Project Overview

**IA-RPG** is an AI-powered D&D 5e platform that enables players to create characters, join tables, and play campaigns with AI-assisted dungeon mastering. This expansion pack implements a complete full-stack application using modern web technologies.

## 🎯 Current Status

### ✅ Completed Stories (Sprint 0 - Day 1)

#### Story 1.1: Project Initialization
- Monorepo structure with pnpm workspaces + Turborepo 2.0
- 2 apps: `web` (Next.js 14.2) and `api` (Express.js)
- 4 packages: `shared`, `ui`, `db`, `config`
- TypeScript, ESLint, TailwindCSS configured
- All workspace scripts functional
- Git initialized with first commit

#### Story 1.2: Database Setup
- Complete Prisma schema with 6 core models:
  - **User**: Authentication, profiles, subscription tiers (free/premium/master)
  - **Character**: Full D&D 5e character sheets with ability scores, HP, AC, spells, equipment (JSON)
  - **Table**: RPG sessions with play styles (sync/async/solo), privacy, invite codes
  - **TableMember**: Many-to-many User↔Table with Character assignment
  - **Message**: Chat messages with dice rolls (JSON), reactions (JSON), threading support
  - **CombatEncounter**: Combat tracking with combatants (JSON), initiative order
- Supabase PostgreSQL configured (pooler + direct connection)
- Database scripts: `pnpm db:migrate`, `db:generate`, `db:studio`, `db:seed`
- Comprehensive seed data with test users/characters/tables
- Prisma Client singleton exported from `@iarpg/db`

### 🚧 Next Up (Sprint 0 - Days 1-2)

#### Story 1.3: Authentication System (NEXT)
- NextAuth.js v5 with Credentials + OAuth providers
- JWT with httpOnly cookies
- User registration/login flows
- Session management
- Protected routes

#### Story 1.4: Backend API Foundation
- Express.js server with CORS
- Socket.io for real-time features
- REST API endpoints structure
- Health check endpoint
- Error handling middleware

#### Story 1.5: Frontend Foundation
- Next.js App Router setup
- Authentication UI (login/register)
- Protected layout wrapper
- TailwindCSS theme configuration
- shadcn/ui components setup

## 📂 Project Structure

```
expansion-packs/IARPG/
├── apps/
│   ├── web/                          # Next.js 14.2+ frontend
│   │   ├── src/
│   │   │   └── app/
│   │   │       ├── layout.tsx       # Root layout
│   │   │       ├── page.tsx         # Home page
│   │   │       └── globals.css      # Tailwind imports
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          # Express.js backend
│       ├── src/
│       │   └── server.ts            # Entry point with /api/health
│       ├── tsconfig.json
│       └── package.json
│
├── packages/
│   ├── db/                          # Prisma database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Complete 6-model schema
│   │   │   └── seed.ts             # Test data seeder
│   │   ├── src/
│   │   │   ├── client.ts           # Prisma singleton
│   │   │   └── index.ts            # Exports
│   │   ├── .env.example
│   │   └── package.json
│   │
│   ├── shared/                      # Shared TypeScript types
│   │   └── src/
│   │       ├── types.ts            # User, Character, Table types
│   │       └── index.ts
│   │
│   ├── ui/                          # UI component library
│   │   └── src/
│   │       ├── Button.tsx          # Sample component
│   │       └── index.ts
│   │
│   └── config/                      # Shared configuration
│       └── src/
│           └── index.ts            # API/Frontend URLs
│
├── docs/
│   ├── prd.md                       # Product Requirements Document
│   ├── front-end-spec.md           # Frontend specification
│   ├── fullstack-architecture.md   # Complete architecture
│   └── stories/                     # 30 implementation stories
│       ├── 1.1.project-initialization.md      ✅
│       ├── 1.2.database-setup.md              ✅
│       ├── 1.3.authentication-system.md       ⏳ NEXT
│       ├── 1.4.backend-api-foundation.md
│       ├── 1.5.frontend-foundation.md
│       ├── 2.1.character-creation.md
│       ├── ...
│       └── 10.3.production-deployment.md
│
├── .env.example                     # Environment variables template
├── pnpm-workspace.yaml             # Workspace configuration
├── turbo.json                      # Turborepo pipeline (uses "tasks")
├── package.json                    # Root workspace scripts
├── README.md                       # User-facing setup guide
└── IARPG-README.md                 # This file (dev guide)
```

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14.2+ with App Router
- **Language**: TypeScript 5.3+
- **Styling**: TailwindCSS 3.4+
- **UI Components**: shadcn/ui (to be configured)
- **State**: Zustand 4.5+ (to be configured)
- **Auth**: NextAuth.js v5 (to be configured)

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js 4.19+
- **Real-time**: Socket.io 4.7+ (to be configured)
- **Language**: TypeScript 5.3+

### Database
- **Platform**: Supabase (managed PostgreSQL 15+)
- **ORM**: Prisma 5.20+
- **Models**: 6 core tables with strategic JSON fields
- **Indexes**: Optimized for table discovery, message pagination, user lookups

### AI
- **Provider**: Anthropic Claude API
- **Model**: claude-3-5-sonnet-20241022
- **SDK**: @anthropic-ai/sdk (to be configured)

### Infrastructure
- **Monorepo**: pnpm 9+ workspaces + Turborepo 2.0
- **Testing**: Vitest 1.6+ (to be configured)
- **Deployment**: Vercel (frontend) + Railway (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase account (free tier works)

### Setup

1. **Install dependencies:**
```bash
cd expansion-packs/IARPG
pnpm install
```

2. **Configure Supabase:**
   - Create project at https://app.supabase.com
   - Get credentials from Project Settings → API
   - Get database URLs from Project Settings → Database

3. **Set environment variables:**
```bash
cp packages/db/.env.example packages/db/.env
# Edit packages/db/.env with your Supabase credentials
```

4. **Run migrations:**
```bash
pnpm db:generate   # Generate Prisma Client
pnpm db:migrate    # Apply schema to database
pnpm db:seed       # (Optional) Add test data
```

5. **Start development:**
```bash
pnpm dev
```
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 📜 Available Scripts

### Workspace Management
- `pnpm dev` - Start all apps in watch mode
- `pnpm build` - Build all packages for production
- `pnpm lint` - Run ESLint across workspace
- `pnpm typecheck` - Run TypeScript compiler checks
- `pnpm test` - Run test suite (when configured)
- `pnpm clean` - Remove build artifacts and node_modules

### Database Operations
- `pnpm db:migrate` - Create and apply new migration
- `pnpm db:generate` - Regenerate Prisma Client
- `pnpm db:studio` - Open Prisma Studio GUI
- `pnpm db:seed` - Populate database with test data
- `pnpm db:reset` - ⚠️ Reset database (deletes all data)

### Individual Workspace Commands
```bash
# Run command in specific workspace
pnpm --filter web dev
pnpm --filter api build
pnpm --filter @iarpg/db typecheck
```

## 📊 Database Schema Details

### Key Design Decisions

1. **JSON Fields for Flexibility**
   - `Character.spells`, `equipment`, `proficiencies` → Avoid complex many-to-many for D&D data
   - `Message.diceRolls`, `reactions` → Always queried with parent message
   - `CombatEncounter.combatants` → Ephemeral combat state updated atomically

2. **Strategic Indexes**
   - `Table: [privacy, state]` → Fast public table discovery
   - `Message: [tableId, createdAt]` → Efficient chat pagination
   - `TableMember: unique[tableId, userId]` → Prevent duplicate joins

3. **Cascading Deletes**
   - User deleted → Characters, TableMemberships, Messages cascade
   - Table deleted → Members, Messages, CombatEncounters cascade
   - Maintains referential integrity

### Seed Data (Test Accounts)
After `pnpm db:seed`:
- **testuser** / password123 (free tier)
  - Character: Thorin Ironforge (Dwarf Fighter Lv5)
  - Character: Elara Moonwhisper (Elf Wizard Lv5)
- **testdm** / password123 (premium tier)
  - Owns table: "The Lost Mines of Phandelver" (invite: TEST123)

## 🎯 Sprint Plan (2-Week Timeline)

### Sprint 0: Foundation (2 days) ✅ 40% Complete
- [x] Story 1.1: Project Initialization
- [x] Story 1.2: Database Setup
- [ ] Story 1.3: Authentication System ← **CURRENT**
- [ ] Story 1.4: Backend API Foundation
- [ ] Story 1.5: Frontend Foundation

### Sprint 1: Core Features (5 days)
**Epic 2: Character Management** (Stories 2.1-2.3)
**Epic 3: Table Management** (Stories 3.1-3.3)
**Epic 4: Synchronous Play** (Stories 4.1-4.3)
**Epic 5: Dice & Combat** (Stories 5.1-5.3)

### Sprint 2: Advanced Features (5 days)
**Epic 6: AI Features** (Stories 6.1-6.3)
**Epic 7: Asynchronous Play** (Stories 7.1-7.3)
**Epic 8: Monetization** (Stories 8.1-8.3)

### Sprint 3: Production Ready (2 days)
**Epic 10: Polish & Deploy** (Stories 10.1-10.3)
*Epic 9 (Mobile/PWA) deferred to v1.1*

## 📖 Development Workflow

### Working on a Story

1. **Read the story file:**
```bash
cat docs/stories/1.3.authentication-system.md
```

2. **Follow acceptance criteria exactly** - Stories contain copy-paste ready code

3. **Update progress** - Mark tasks as complete: `- [ ]` → `- [x]`

4. **Test thoroughly:**
```bash
pnpm lint
pnpm typecheck
pnpm test  # When configured
```

5. **Commit with story reference:**
```bash
git add -A
git commit -m "feat: complete Story 1.3 - Authentication System

- Implement NextAuth.js v5 with credentials provider
- Add JWT session strategy
- Create login/register API routes
- Add protected route middleware

[Story 1.3]"
```

### Story Structure
Each story (~250-700 lines) contains:
- **Acceptance Criteria** - What must work
- **Tasks/Subtasks** - Checkbox implementation plan
- **Dev Notes** - Copy-paste ready code snippets
- **Testing** - Test scenarios to verify

### Code Quality Standards
- ✅ All code must be TypeScript
- ✅ Follow existing patterns in codebase
- ✅ Add error handling for edge cases
- ✅ Write self-documenting code (clear names)
- ✅ Test critical paths before committing

## 🐛 Troubleshooting

### "Prisma Client not generated"
```bash
pnpm db:generate
```

### "Can't reach database server"
- Check `packages/db/.env` has correct Supabase URLs
- Verify Supabase project is active
- Check IP allowlist in Supabase dashboard

### "Port 3000 already in use"
```bash
lsof -ti:3000 | xargs kill -9
```

### Turborepo cache issues
```bash
pnpm clean
pnpm install
```

## 🔗 Important Links

- **Supabase Dashboard**: https://app.supabase.com
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Turborepo Docs**: https://turbo.build/repo/docs

## 📝 Notes for AI Agents

### YOLO Mode Execution
- Read complete story file before starting
- Implement all acceptance criteria sequentially
- Mark todos as in_progress → completed
- Commit after each story completion
- No confirmations needed - just execute

### Key Context
- Project root: `/expansion-packs/IARPG/`
- All stories have copy-paste ready code in Dev Notes
- Follow 80/20 MVP principle - 30 stories cover core features
- Total: 247 acceptance criteria across 10 epics
- Database already seeded with test data

### Current Session State
- ✅ Stories 1.1-1.2 complete
- ⏳ Story 1.3 next (Authentication)
- 🎯 Sprint 0 target: Stories 1.1-1.5 (Foundation)

---

**Last Updated**: 2025-09-30 (after Story 1.2 completion)
**Agent**: Dev (James) in YOLO Mode
**Model**: claude-sonnet-4-5-20250929
