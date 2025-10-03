# IA-RPG Fullstack Architecture Document

**Version:** 1.0
**Date:** September 30, 2025
**Status:** ✅ Ready for Implementation
**Owner:** Winston (Architect)
**Related Documents:** [PRD v1.1](./prd.md), [Front-End Spec v1.4](./front-end-spec.md)

---

## TABLE OF CONTENTS

1. [Introduction](#1-introduction)
2. [High Level Architecture](#2-high-level-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Data Models](#4-data-models)
5. [API Specification](#5-api-specification)
6. [Components](#6-components)
7. [External APIs](#7-external-apis)
8. [Core Workflows](#8-core-workflows)
9. [Database Schema](#9-database-schema)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Backend Architecture](#11-backend-architecture)
12. [Unified Project Structure](#12-unified-project-structure)
13. [Development Workflow](#13-development-workflow)
14. [Deployment Architecture](#14-deployment-architecture)
15. [Security and Performance](#15-security-and-performance)
16. [Testing Strategy](#16-testing-strategy)
17. [Coding Standards](#17-coding-standards)
18. [Error Handling Strategy](#18-error-handling-strategy)
19. [Monitoring and Observability](#19-monitoring-and-observability)
20. [Change Log](#20-change-log)

---

## 1. INTRODUCTION

This document outlines the complete fullstack architecture for **IA-RPG**, including backend systems, frontend implementation, and their integration. It serves as the single source of truth for AI-driven development, ensuring consistency across the entire technology stack.

This unified approach combines what would traditionally be separate backend and frontend architecture documents, streamlining the development process for modern fullstack applications where these concerns are increasingly intertwined.

### 1.1 Starter Template or Existing Project

**Status:** N/A - Greenfield project

**Decision:** We will build from scratch using a **pnpm monorepo** structure with custom configuration rather than using a pre-made starter template. This gives us maximum control over the architecture while leveraging best practices from established patterns (T3 Stack conventions, Turborepo structure).

**Rationale:**
- PRD specifies unique requirements (text-based RPG, realtime sync/async modes, AI integration)
- No existing template combines Next.js + Express + Socket.io + Supabase in the exact configuration needed
- Building from scratch allows optimal structure for AI agent development workflow
- We can still use battle-tested tools (shadcn/ui, Prisma, NextAuth) as building blocks

### 1.2 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-30 | 1.0 | Initial fullstack architecture document | Winston (Architect) |

---

## 2. HIGH LEVEL ARCHITECTURE

### 2.1 Technical Summary

IA-RPG is a **Jamstack-adjacent fullstack application** with a Next.js 14+ frontend deployed on Vercel and an Express.js backend (with Socket.io) on Railway/Render. The architecture follows a **monorepo structure** using pnpm workspaces, enabling shared TypeScript types and utilities between frontend and backend.

The system leverages **Supabase** as the primary platform for PostgreSQL database, authentication, and storage, with Prisma as the ORM. Real-time synchronous play uses **Socket.io** WebSockets, while asynchronous play-by-post uses standard REST API + webhooks. **OpenAI GPT-4o** powers the AI features (rules assistance, NPC generation, solo DM mode), with Redis (Upstash) caching for cost optimization.

The architecture prioritizes **rapid MVP delivery** (2-week timeline), **developer experience** (type-safe APIs via shared types), and **scalability** (serverless frontend, containerized backend, managed services). This design achieves PRD goals of flexible play modes, mobile-first UX, and AI-native features while keeping infrastructure costs minimal during validation phase.

### 2.2 Platform and Infrastructure Choice

**Platform:** **Vercel (Frontend) + Railway (Backend) + Supabase (Database/Auth/Storage)**

**Key Services:**
- **Vercel:** Next.js deployment, Edge Functions, Analytics
- **Railway:** Express.js + Socket.io deployment, environment management
- **Supabase:** PostgreSQL database, Auth (with NextAuth integration), Storage (avatars, uploads)
- **Upstash:** Redis for caching (AI responses, session data)
- **OpenAI:** GPT-4o API for AI features
- **Resend:** Transactional emails
- **Sentry:** Error tracking (frontend + backend)
- **PostHog:** Product analytics

**Deployment Regions:**
- **Primary:** US East (Vercel: `iad1`, Railway: `us-east`, Supabase: `us-east-1`)
- **Rationale:** Majority of initial users expected in North America, co-location minimizes latency

**Alternative Considered:** AWS Full Stack (Lambda + API Gateway + RDS + Cognito)
- **Why not chosen:** Higher complexity, slower development velocity, overkill for MVP scale
- **When to reconsider:** If hitting >10K concurrent users or need advanced AWS services

### 2.3 Repository Structure

**Structure:** **Monorepo** (single repository containing all code)

**Monorepo Tool:** **pnpm workspaces** with Turborepo for build orchestration

**Package Organization:**
```
iarpg/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express.js + Socket.io backend
├── packages/
│   ├── shared/       # Shared types, constants, utilities
│   ├── ui/           # Shared UI components (shadcn/ui base)
│   ├── db/           # Prisma schema and client
│   └── config/       # Shared ESLint, TS, Jest configs
```

**Rationale:**
- **Type safety:** Shared TypeScript interfaces ensure frontend/backend consistency
- **Code reuse:** UI components, utilities, constants shared across apps
- **Atomic changes:** Single PR can update API + frontend together
- **Developer experience:** Single `pnpm install`, unified scripts
- **AI agent friendly:** Clear package boundaries simplify AI-driven development

### 2.4 High Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WebApp["Next.js Web App<br/>(Vercel)"]
        MobileWeb["Mobile Web Browser"]
    end

    subgraph "CDN & Edge"
        VercelEdge["Vercel Edge Network<br/>(Static Assets + SSR)"]
    end

    subgraph "Application Layer"
        API["Express.js API<br/>(Railway)<br/>REST + WebSocket"]
        Socketio["Socket.io Server<br/>(Realtime)"]
    end

    subgraph "Data Layer"
        Supabase["Supabase<br/>(PostgreSQL + Auth + Storage)"]
        Redis["Upstash Redis<br/>(Cache)"]
    end

    subgraph "External Services"
        OpenAI["OpenAI API<br/>(GPT-4o)"]
        Resend["Resend<br/>(Email)"]
        Sentry["Sentry<br/>(Error Tracking)"]
        PostHog["PostHog<br/>(Analytics)"]
    end

    MobileWeb --> VercelEdge
    WebApp --> VercelEdge
    VercelEdge --> API
    WebApp -.WebSocket.-> Socketio

    API --> Supabase
    API --> Redis
    API --> OpenAI
    API --> Resend

    Socketio --> Supabase
    Socketio --> Redis

    WebApp --> Sentry
    API --> Sentry
    WebApp --> PostHog
```

### 2.5 Architectural Patterns

- **Jamstack with Serverless Backend:** Static site generation (Next.js) with API routes + separate backend service - _Rationale:_ Optimal performance for content-heavy RPG narratives, SEO benefits for public tables
- **Monorepo Architecture:** Single repository with multiple packages - _Rationale:_ Shared types ensure type safety across frontend/backend, simplifies dependency management
- **Component-Based UI:** Reusable React components with TypeScript + shadcn/ui - _Rationale:_ Maintainability, matches Front-End Spec design system
- **Repository Pattern:** Abstract data access behind repository layer - _Rationale:_ Enables testing, future database migration flexibility
- **WebSocket + REST Hybrid:** Socket.io for realtime sync play, REST for async actions - _Rationale:_ Right tool for each use case, Socket.io handles bidirectional realtime, REST for CRUD
- **Backend for Frontend (BFF):** API layer tailored for web client needs - _Rationale:_ Optimizes payloads for UI, hides internal complexity
- **Service Layer Pattern:** Business logic separated from controllers - _Rationale:_ Testability, reusability, clear separation of concerns
- **Event-Driven Architecture (Limited):** WebSocket events for game actions - _Rationale:_ Natural fit for turn-based actions, dice rolls, combat updates

---

## 3. TECH STACK

This is the **DEFINITIVE technology selection** for the entire project. All development must use these exact versions.

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.3+ | Type-safe frontend code | Industry standard, catches errors at compile time |
| **Frontend Framework** | Next.js | 14.2+ (App Router) | React framework with SSR/SSG | App Router for modern routing, Server Components for performance |
| **UI Component Library** | shadcn/ui | latest | Accessible component primitives | Customizable, Radix UI base, matches Front-End Spec design system |
| **State Management** | Zustand | 4.5+ | Client-side state | Lightweight, minimal boilerplate, TypeScript-first |
| **Backend Language** | TypeScript (Node.js) | Node 20 LTS | Type-safe backend code | Same language as frontend, shared types |
| **Backend Framework** | Express.js | 4.19+ | HTTP server | Battle-tested, middleware ecosystem, simple for MVP |
| **Real-time** | Socket.io | 4.7+ | WebSocket management | Automatic reconnection, room/namespace support for tables |
| **API Style** | REST + WebSocket | - | Hybrid API approach | REST for CRUD, WebSocket for realtime sync play |
| **Database** | PostgreSQL (Supabase) | 15+ | Primary database | Relational data (users, tables, characters), Supabase managed |
| **ORM** | Prisma | 5.20+ | Database access | Type-safe queries, migrations, excellent DX |
| **Cache** | Redis (Upstash) | 7+ | Caching layer | Serverless Redis for AI response caching, session data |
| **File Storage** | Supabase Storage | - | Avatars, character portraits | S3-compatible, integrated with Supabase Auth |
| **Authentication** | NextAuth.js v5 | 5.0.0-beta+ | Auth framework | Integrates with Supabase Auth, supports OAuth + credentials |
| **Frontend Testing** | Vitest + Testing Library | Vitest 1.6+, RTL 15+ | Component/unit tests | Fast, Vite-native, Jest-compatible API |
| **Backend Testing** | Vitest | 1.6+ | API/service tests | Unified testing framework across monorepo |
| **E2E Testing** | Playwright | 1.45+ | End-to-end tests | Cross-browser, reliable, great debugging |
| **Build Tool** | Turbo | 2.0+ | Monorepo orchestration | Caches builds, runs tasks in parallel |
| **Bundler** | Vite (via Next.js/Vitest) | 5+ | Fast bundling | Built into Next.js 14+, Vitest uses Vite |
| **IaC Tool** | None (MVP) | - | Infrastructure as Code | Use platform UIs for MVP, add Terraform post-MVP if needed |
| **CI/CD** | GitHub Actions | - | Automated testing + deployment | Free for public repos, integrated with Vercel/Railway |
| **Monitoring** | Sentry | latest | Error tracking | Best-in-class error tracking, supports both FE/BE |
| **Analytics** | PostHog | latest | Product analytics | Self-serve analytics, feature flags, session replay |
| **Logging** | Pino | 9+ | Structured logging | Fast, JSON logging for backend |
| **CSS Framework** | TailwindCSS | 3.4+ | Utility-first CSS | Matches Front-End Spec, integrates with shadcn/ui |
| **CSS-in-JS** | None | - | Styling approach | TailwindCSS + CSS modules sufficient, avoid runtime overhead |
| **Email** | Resend | latest | Transactional emails | Modern API, generous free tier |
| **Payments** | Stripe | latest | Billing (Phase 2) | Industry standard, deferred to Phase 2 per PRD |
| **AI** | OpenAI (GPT-4o) | gpt-4o-2024-08-06 | Primary AI model | Best reasoning, good cost/performance balance |
| **AI Fallback** | Anthropic Claude 3.5 Sonnet | claude-3-5-sonnet-20240620 | Fallback AI model | If OpenAI quota exceeded or outage |

---

## 4. DATA MODELS

Core data models shared between frontend and backend, defined as TypeScript interfaces in `packages/shared`.

### 4.1 User

**Purpose:** Represents a registered user account

**Key Attributes:**
- `id`: string (CUID) - Unique identifier
- `email`: string - Email address (unique)
- `username`: string - Display name (unique)
- `tier`: 'free' | 'premium' | 'master' - Subscription tier
- `stripeCustomerId`: string | null - Stripe customer ID (Phase 2)
- `createdAt`: Date - Account creation timestamp
- `updatedAt`: Date - Last update timestamp

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email: string;
  username: string;
  passwordHash?: string; // Only in backend, never exposed to frontend
  tier: 'free' | 'premium' | 'master';
  stripeCustomerId: string | null;
  avatar: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relationships:**
- `characters`: One-to-Many → Character[]
- `ownedTables`: One-to-Many → Table[] (as DM)
- `tableMemberships`: Many-to-Many → TableMember[]

---

### 4.2 Character

**Purpose:** D&D 5e character sheet data

**Key Attributes:**
- `id`: string (CUID) - Unique identifier
- `userId`: string - Owner user ID
- `name`: string - Character name
- `race`: string - D&D race (Human, Elf, etc.)
- `class`: string - D&D class (Fighter, Wizard, etc.)
- `level`: number - Character level (1-20)
- `abilityScores`: AbilityScores - STR, DEX, CON, INT, WIS, CHA
- `hp`: number - Current hit points
- `maxHp`: number - Maximum hit points
- `ac`: number - Armor class

**TypeScript Interface:**
```typescript
interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface Character {
  id: string;
  userId: string;
  name: string;
  race: string;
  class: string;
  level: number;
  abilityScores: AbilityScores;
  proficiencyBonus: number;
  hp: number;
  maxHp: number;
  tempHp: number;
  ac: number;
  initiative: number;
  speed: number;
  proficiencies: string[]; // Skills, saving throws
  spells: Spell[]; // If caster
  equipment: EquipmentItem[];
  background: string;
  notes: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared: boolean;
}

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  weight: number;
  description: string;
}
```

**Relationships:**
- `owner`: Many-to-One → User
- `tableMemberships`: Many-to-Many → TableMember[]

---

### 4.3 Table

**Purpose:** Represents a game table (campaign/session)

**Key Attributes:**
- `id`: string (CUID) - Unique identifier
- `ownerId`: string - DM user ID
- `name`: string - Table name
- `description`: string - Table description
- `playStyle`: 'sync' | 'async' | 'solo' - Play mode
- `privacy`: 'private' | 'public' | 'spectator' - Visibility
- `inviteCode`: string (unique) - Join code for private tables
- `state`: 'setup' | 'active' | 'paused' | 'completed' - Table lifecycle state
- `schedule`: string | null - For sync tables (e.g., "Thu 8pm EST")

**TypeScript Interface:**
```typescript
interface Table {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  playStyle: 'sync' | 'async' | 'solo';
  privacy: 'private' | 'public' | 'spectator';
  inviteCode: string;
  state: 'setup' | 'active' | 'paused' | 'completed';
  schedule: string | null;
  maxPlayers: number;
  tags: string[]; // e.g., ['combat-heavy', 'roleplay-focused']
  rulesVariant: 'standard' | 'homebrew';
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
}
```

**Relationships:**
- `owner`: Many-to-One → User (DM)
- `members`: One-to-Many → TableMember[]
- `messages`: One-to-Many → Message[]
- `combatEncounters`: One-to-Many → CombatEncounter[]

---

### 4.4 TableMember

**Purpose:** Junction table linking users/characters to tables

**TypeScript Interface:**
```typescript
interface TableMember {
  id: string;
  tableId: string;
  userId: string;
  characterId: string;
  role: 'dm' | 'player';
  status: 'active' | 'invited' | 'left';
  joinedAt: Date;
}
```

**Relationships:**
- `table`: Many-to-One → Table
- `user`: Many-to-One → User
- `character`: Many-to-One → Character

---

### 4.5 Message

**Purpose:** Chat messages (sync) or posts (async)

**TypeScript Interface:**
```typescript
interface Message {
  id: string;
  tableId: string;
  userId: string;
  characterId: string | null; // Null for OOC messages
  type: 'ic' | 'ooc' | 'dm-note' | 'system'; // In-character, out-of-character, DM-only, system
  content: string; // Plain text for sync, markdown for async
  diceRolls: DiceRoll[]; // Embedded dice rolls
  reactions: Reaction[];
  parentId: string | null; // For threading (async)
  createdAt: Date;
  updatedAt: Date | null;
}

interface DiceRoll {
  id: string;
  notation: string; // e.g., "1d20+5"
  result: number;
  breakdown: string; // e.g., "[14] + 5 = 19"
  isCritical: boolean;
  type: 'success' | 'failure' | 'normal';
}

interface Reaction {
  emoji: string;
  userIds: string[];
}
```

**Relationships:**
- `table`: Many-to-One → Table
- `user`: Many-to-One → User
- `character`: Many-to-One → Character
- `parent`: Self-referencing (threading)

---

### 4.6 CombatEncounter

**Purpose:** Combat tracker data

**TypeScript Interface:**
```typescript
interface CombatEncounter {
  id: string;
  tableId: string;
  name: string;
  round: number;
  state: 'setup' | 'active' | 'ended';
  combatants: Combatant[];
  createdAt: Date;
  endedAt: Date | null;
}

interface Combatant {
  id: string;
  type: 'player' | 'npc' | 'monster';
  characterId: string | null; // For players
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  conditions: string[]; // e.g., ['poisoned', 'prone']
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
  notes: string | null;
}
```

**Relationships:**
- `table`: Many-to-One → Table

---

## 5. API SPECIFICATION

**API Style:** **Hybrid - REST + WebSocket**

### 5.1 REST API Specification

**Base URL:** `https://api.iarpg.com` (production), `http://localhost:3001` (development)

#### 5.1.1 Authentication Endpoints

**POST /api/auth/register**
- **Purpose:** Create new user account
- **Request Body:**
  ```typescript
  {
    email: string;
    username: string;
    password: string;
  }
  ```
- **Response:** `201 Created`
  ```typescript
  {
    user: User;
    token: string;
  }
  ```

**POST /api/auth/login**
- **Purpose:** Login with credentials
- **Request Body:**
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response:** `200 OK`
  ```typescript
  {
    user: User;
    token: string;
  }
  ```

**POST /api/auth/logout**
- **Purpose:** Logout user (invalidate token)
- **Response:** `204 No Content`

---

#### 5.1.2 User Endpoints

**GET /api/users/me**
- **Purpose:** Get current user profile
- **Auth:** Required
- **Response:** `200 OK`
  ```typescript
  { user: User }
  ```

**PATCH /api/users/me**
- **Purpose:** Update user profile
- **Auth:** Required
- **Request Body:**
  ```typescript
  {
    username?: string;
    avatar?: string;
    bio?: string;
  }
  ```
- **Response:** `200 OK`
  ```typescript
  { user: User }
  ```

---

#### 5.1.3 Character Endpoints

**GET /api/characters**
- **Purpose:** List user's characters
- **Auth:** Required
- **Response:** `200 OK`
  ```typescript
  { characters: Character[] }
  ```

**POST /api/characters**
- **Purpose:** Create new character
- **Auth:** Required
- **Request Body:** `Character` (without `id`, `createdAt`, `updatedAt`)
- **Response:** `201 Created`
  ```typescript
  { character: Character }
  ```

**GET /api/characters/:id**
- **Purpose:** Get character details
- **Auth:** Required (owner or table member)
- **Response:** `200 OK`
  ```typescript
  { character: Character }
  ```

**PATCH /api/characters/:id**
- **Purpose:** Update character
- **Auth:** Required (owner only)
- **Request Body:** Partial<Character>
- **Response:** `200 OK`
  ```typescript
  { character: Character }
  ```

**DELETE /api/characters/:id**
- **Purpose:** Delete character
- **Auth:** Required (owner only)
- **Response:** `204 No Content`

---

#### 5.1.4 Table Endpoints

**GET /api/tables**
- **Purpose:** List public tables (discovery)
- **Query Params:**
  ```typescript
  {
    playStyle?: 'sync' | 'async' | 'solo';
    tags?: string; // Comma-separated
    search?: string;
    page?: number;
    limit?: number;
  }
  ```
- **Response:** `200 OK`
  ```typescript
  {
    tables: Table[];
    total: number;
    page: number;
    limit: number;
  }
  ```

**GET /api/tables/my**
- **Purpose:** List user's tables (owned + member)
- **Auth:** Required
- **Response:** `200 OK`
  ```typescript
  { tables: Table[] }
  ```

**POST /api/tables**
- **Purpose:** Create new table
- **Auth:** Required
- **Request Body:** Partial<Table>
- **Response:** `201 Created`
  ```typescript
  { table: Table }
  ```

**GET /api/tables/:id**
- **Purpose:** Get table details
- **Auth:** Required (member or public table)
- **Response:** `200 OK`
  ```typescript
  {
    table: Table;
    members: TableMember[];
    messages: Message[]; // Last 50
  }
  ```

**PATCH /api/tables/:id**
- **Purpose:** Update table settings
- **Auth:** Required (DM only)
- **Request Body:** Partial<Table>
- **Response:** `200 OK`
  ```typescript
  { table: Table }
  ```

**DELETE /api/tables/:id**
- **Purpose:** Delete table
- **Auth:** Required (DM only)
- **Response:** `204 No Content`

**POST /api/tables/:id/join**
- **Purpose:** Join table with invite code or public
- **Auth:** Required
- **Request Body:**
  ```typescript
  {
    characterId: string;
    inviteCode?: string; // Required for private tables
  }
  ```
- **Response:** `200 OK`
  ```typescript
  { tableMember: TableMember }
  ```

**POST /api/tables/:id/leave**
- **Purpose:** Leave table
- **Auth:** Required
- **Response:** `204 No Content`

---

#### 5.1.5 Message Endpoints (Async Play)

**GET /api/tables/:tableId/messages**
- **Purpose:** Get message history
- **Auth:** Required (table member)
- **Query Params:**
  ```typescript
  {
    before?: string; // Message ID cursor
    limit?: number; // Default 50
  }
  ```
- **Response:** `200 OK`
  ```typescript
  {
    messages: Message[];
    hasMore: boolean;
  }
  ```

**POST /api/tables/:tableId/messages**
- **Purpose:** Create new message/post
- **Auth:** Required (table member)
- **Request Body:**
  ```typescript
  {
    type: 'ic' | 'ooc' | 'dm-note';
    content: string;
    characterId?: string;
    parentId?: string; // For threading
    diceRolls?: DiceRoll[];
  }
  ```
- **Response:** `201 Created`
  ```typescript
  { message: Message }
  ```

**PATCH /api/messages/:id**
- **Purpose:** Edit message
- **Auth:** Required (message author, within 5 minutes)
- **Request Body:**
  ```typescript
  { content: string }
  ```
- **Response:** `200 OK`
  ```typescript
  { message: Message }
  ```

**DELETE /api/messages/:id**
- **Purpose:** Delete message
- **Auth:** Required (message author or DM)
- **Response:** `204 No Content`

**POST /api/messages/:id/reactions**
- **Purpose:** Add reaction to message
- **Auth:** Required (table member)
- **Request Body:**
  ```typescript
  { emoji: string }
  ```
- **Response:** `200 OK`
  ```typescript
  { message: Message }
  ```

---

#### 5.1.6 Combat Endpoints

**GET /api/tables/:tableId/combat**
- **Purpose:** Get current combat encounter
- **Auth:** Required (table member)
- **Response:** `200 OK`
  ```typescript
  { combat: CombatEncounter | null }
  ```

**POST /api/tables/:tableId/combat**
- **Purpose:** Start combat encounter
- **Auth:** Required (DM only)
- **Request Body:**
  ```typescript
  {
    name: string;
    combatants: Partial<Combatant>[];
  }
  ```
- **Response:** `201 Created`
  ```typescript
  { combat: CombatEncounter }
  ```

**PATCH /api/combat/:id**
- **Purpose:** Update combat state (next turn, update HP, etc.)
- **Auth:** Required (table member)
- **Request Body:** Partial<CombatEncounter>
- **Response:** `200 OK`
  ```typescript
  { combat: CombatEncounter }
  ```

**POST /api/combat/:id/end**
- **Purpose:** End combat encounter
- **Auth:** Required (DM only)
- **Response:** `200 OK`
  ```typescript
  { combat: CombatEncounter }
  ```

---

#### 5.1.7 AI Endpoints

**POST /api/ai/query**
- **Purpose:** Ask AI rules question or generate NPC
- **Auth:** Required
- **Request Body:**
  ```typescript
  {
    type: 'rules' | 'npc' | 'consequence';
    prompt: string;
    context?: {
      tableId?: string;
      characterIds?: string[];
    };
  }
  ```
- **Response:** `200 OK`
  ```typescript
  {
    response: string;
    usage: {
      tokens: number;
      remainingQueries: number; // For free tier
    };
  }
  ```

**POST /api/ai/solo-dm**
- **Purpose:** Solo AI DM action
- **Auth:** Required
- **Request Body:**
  ```typescript
  {
    tableId: string;
    action: string;
  }
  ```
- **Response:** `200 OK`
  ```typescript
  {
    response: string;
    diceRolls?: DiceRoll[];
  }
  ```

---

### 5.2 WebSocket API Specification (Socket.io)

**Namespace:** `/table/:tableId`

#### 5.2.1 Client → Server Events

**join_table**
- **Payload:**
  ```typescript
  {
    tableId: string;
    userId: string;
    characterId: string;
    token: string; // Auth token
  }
  ```
- **Purpose:** Join table room for realtime updates

**leave_table**
- **Payload:**
  ```typescript
  { tableId: string }
  ```
- **Purpose:** Leave table room

**send_message**
- **Payload:**
  ```typescript
  {
    type: 'ic' | 'ooc';
    content: string;
    characterId?: string;
  }
  ```
- **Purpose:** Send realtime chat message

**roll_dice**
- **Payload:**
  ```typescript
  {
    notation: string;
    label?: string;
    characterId?: string;
  }
  ```
- **Purpose:** Roll dice, broadcast result

**typing_start** / **typing_stop**
- **Payload:**
  ```typescript
  {
    userId: string;
    characterName: string;
  }
  ```
- **Purpose:** Show/hide typing indicator

**update_combat**
- **Payload:** Partial<CombatEncounter>
- **Purpose:** Update combat state (HP, conditions, next turn)

---

#### 5.2.2 Server → Client Events

**message**
- **Payload:** Message
- **Purpose:** Broadcast new message to all table members

**dice_result**
- **Payload:**
  ```typescript
  {
    userId: string;
    characterName: string;
    roll: DiceRoll;
  }
  ```
- **Purpose:** Broadcast dice roll result

**user_joined** / **user_left**
- **Payload:**
  ```typescript
  {
    user: User;
    character: Character;
  }
  ```
- **Purpose:** Notify table of member changes

**typing**
- **Payload:**
  ```typescript
  {
    userId: string;
    characterName: string;
    isTyping: boolean;
  }
  ```
- **Purpose:** Broadcast typing status

**combat_updated**
- **Payload:** CombatEncounter
- **Purpose:** Broadcast combat state changes

**error**
- **Payload:**
  ```typescript
  {
    code: string;
    message: string;
  }
  ```
- **Purpose:** Error notification

---

## 6. COMPONENTS

Major logical components across the fullstack application.

### 6.1 Web Application (Frontend)

**Responsibility:** User interface for all platform features

**Key Interfaces:**
- HTTP client (Axios/Fetch) to REST API
- Socket.io client for realtime events
- Local state management (Zustand)
- React components following Front-End Spec

**Dependencies:**
- REST API
- WebSocket API
- Supabase Storage (direct for image uploads)

**Technology Stack:**
- Next.js 14+ (App Router, Server Components, Server Actions)
- TailwindCSS + shadcn/ui
- Zustand for client state
- React Hook Form + Zod for forms
- Socket.io-client

---

### 6.2 API Server (Backend)

**Responsibility:** REST API, business logic, data persistence

**Key Interfaces:**
- RESTful HTTP endpoints
- Prisma ORM for database access
- OpenAI API client
- Resend email client

**Dependencies:**
- PostgreSQL (Supabase)
- Redis (Upstash)
- OpenAI API
- Resend API

**Technology Stack:**
- Express.js
- TypeScript
- Prisma ORM
- Pino logger
- Helmet (security headers)
- express-validator (input validation)

---

### 6.3 WebSocket Server (Realtime)

**Responsibility:** Realtime bidirectional communication for sync play

**Key Interfaces:**
- Socket.io namespaces per table
- Event handlers for chat, dice, combat
- Redis adapter for horizontal scaling

**Dependencies:**
- Redis (for Socket.io adapter)
- PostgreSQL (for persistence)
- API Server (shared services)

**Technology Stack:**
- Socket.io server
- socket.io-redis adapter
- Shared with API Server (same process initially, can split later)

---

### 6.4 Shared Packages

**Responsibility:** Shared types, utilities, constants across frontend/backend

**Key Interfaces:**
- TypeScript interfaces (User, Character, Table, etc.)
- Validation schemas (Zod)
- Utility functions (dice parsing, date formatting)
- Constants (tier limits, error codes)

**Dependencies:** None (pure TypeScript)

**Technology Stack:**
- TypeScript
- Zod (schema validation)

---

### 6.5 Database Package (Prisma)

**Responsibility:** Database schema, migrations, type-safe client

**Key Interfaces:**
- Prisma Client (generated)
- Migration CLI
- Seed scripts

**Dependencies:**
- PostgreSQL (Supabase)

**Technology Stack:**
- Prisma ORM

---

### 6.6 Component Diagram

```mermaid
graph TB
    subgraph "Frontend (apps/web)"
        NextApp["Next.js App"]
        Pages["Page Components"]
        UIComponents["UI Components<br/>(packages/ui)"]
        APIClient["API Client"]
        SocketClient["Socket.io Client"]
        StateStore["Zustand Store"]
    end

    subgraph "Backend (apps/api)"
        ExpressApp["Express App"]
        Routes["Route Controllers"]
        Services["Service Layer"]
        Repositories["Repository Layer"]
        SocketServer["Socket.io Server"]
        AIService["AI Service"]
    end

    subgraph "Shared (packages/shared)"
        Types["TypeScript Types"]
        Validators["Zod Schemas"]
        Utils["Shared Utilities"]
    end

    subgraph "Database (packages/db)"
        PrismaClient["Prisma Client"]
        Migrations["Migrations"]
    end

    NextApp --> Pages
    Pages --> UIComponents
    Pages --> APIClient
    Pages --> SocketClient
    Pages --> StateStore
    UIComponents --> Types

    APIClient --> Routes
    SocketClient --> SocketServer

    Routes --> Services
    Services --> Repositories
    Services --> AIService
    Repositories --> PrismaClient

    SocketServer --> Services

    Services --> Types
    Routes --> Validators
    Repositories --> Types

    PrismaClient --> |SQL| PostgreSQL[(PostgreSQL)]
    AIService --> |API| OpenAI[OpenAI API]
    Services --> |Cache| Redis[(Redis)]
```

---

## 7. EXTERNAL APIs

### 7.1 OpenAI API

- **Purpose:** AI features (rules assistance, NPC generation, solo DM mode)
- **Documentation:** https://platform.openai.com/docs/api-reference
- **Base URL:** https://api.openai.com/v1
- **Authentication:** Bearer token (API key in environment variable)
- **Rate Limits:** Tier-based (RPM/TPM), monitor usage to stay within budget

**Key Endpoints Used:**
- `POST /chat/completions` - Generate AI responses (rules, NPCs, DM narration)

**Integration Notes:**
- Use `gpt-4o-2024-08-06` model for primary requests
- Fallback to `claude-3-5-sonnet-20240620` (Anthropic) if OpenAI quota exceeded
- Implement Redis caching for repeated rules questions (60-minute TTL)
- Track usage per user tier (free: 10/day, premium: unlimited)
- Use streaming for solo DM mode to reduce perceived latency

---

### 7.2 Supabase API

- **Purpose:** PostgreSQL database, authentication, file storage
- **Documentation:** https://supabase.com/docs/reference/javascript
- **Base URL:** `https://<project>.supabase.co`
- **Authentication:** Service role key (backend), anon key (frontend)
- **Rate Limits:** Generous free tier, monitor connection pooling

**Key Services Used:**
- **Database:** PostgreSQL via Prisma (not direct Supabase client)
- **Auth:** Managed users, JWT tokens (integrated with NextAuth.js)
- **Storage:** S3-compatible file storage for avatars, character portraits

**Integration Notes:**
- Use Prisma as primary database interface (better type safety than Supabase client)
- NextAuth.js handles auth flow, uses Supabase for user storage
- Direct Supabase Storage SDK for image uploads (presigned URLs)

---

### 7.3 Upstash Redis API

- **Purpose:** Caching layer for AI responses, session data
- **Documentation:** https://upstash.com/docs/redis
- **Base URL:** `https://<region>.upstash.io`
- **Authentication:** Token-based (REST API compatible)
- **Rate Limits:** 10K commands/day (free), monitor usage

**Key Use Cases:**
- Cache AI rules responses (key: `ai:rules:{hash}`, TTL: 3600s)
- Socket.io adapter for multi-instance scaling (future)
- Session storage for rate limiting (per-user request counts)

**Integration Notes:**
- Use @upstash/redis SDK (serverless-optimized)
- Enable auto-eviction (LRU policy) to stay within free tier
- Monitor cache hit rate (target >70% for AI queries)

---

### 7.4 Resend API

- **Purpose:** Transactional emails (welcome, notifications, password reset)
- **Documentation:** https://resend.com/docs/api-reference
- **Base URL:** https://api.resend.com
- **Authentication:** API key (environment variable)
- **Rate Limits:** 100 emails/day (free), 10K/month (paid)

**Key Use Cases:**
- Welcome email on signup
- Password reset emails
- Async table activity notifications (daily digest)

**Integration Notes:**
- Use @resend/node SDK
- HTML templates in `apps/api/src/emails/` (React Email for templating)
- Queue email sending (don't block API responses)

---

## 8. CORE WORKFLOWS

Critical user journeys illustrated as sequence diagrams.

### 8.1 User Registration & First Character Creation

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js App
    participant API as Express API
    participant DB as PostgreSQL
    participant Email as Resend

    User->>Web: Fill signup form
    Web->>API: POST /api/auth/register
    API->>DB: Insert user
    DB-->>API: User created
    API->>Email: Send welcome email
    API-->>Web: { user, token }
    Web-->>User: Redirect to onboarding

    User->>Web: Answer onboarding questions
    Web->>Web: Recommend: Solo AI tutorial
    User->>Web: Click "Start Solo Tutorial"

    Web->>Web: Open character quick start
    User->>Web: Select pre-made character
    Web->>API: POST /api/characters (quick start)
    API->>DB: Insert character
    DB-->>API: Character created
    API-->>Web: { character }

    Web->>API: POST /api/tables (solo, auto-DM)
    API->>DB: Insert table
    DB-->>API: Table created
    API-->>Web: { table }

    Web-->>User: Enter solo table, AI DM ready
```

---

### 8.2 Synchronous Play Session (Live Chat)

```mermaid
sequenceDiagram
    actor Player
    participant Web as Next.js App
    participant Socket as Socket.io Server
    participant API as Express API
    participant DB as PostgreSQL
    actor OtherPlayers

    Player->>Web: Click "Continue" on table card
    Web->>Socket: emit('join_table', { tableId, userId, token })
    Socket->>Socket: Authenticate user
    Socket->>DB: Verify table membership
    Socket-->>Web: emit('table_joined', { members })
    Socket-->>OtherPlayers: emit('user_joined', { player, character })

    Player->>Web: Type message "I attack the goblin!"
    Web->>Socket: emit('typing_start', { userId, characterName })
    Socket-->>OtherPlayers: emit('typing', { characterName, isTyping: true })

    Player->>Web: Click send
    Web->>Socket: emit('send_message', { content, characterId })
    Socket->>DB: Insert message
    Socket-->>Web: emit('message', { message })
    Socket-->>OtherPlayers: emit('message', { message })

    Player->>Web: Click "Roll Attack"
    Web->>Socket: emit('roll_dice', { notation: '1d20+5', label: 'Attack' })
    Socket->>Socket: Calculate dice result
    Socket->>DB: Insert dice roll (linked to message)
    Socket-->>Web: emit('dice_result', { roll })
    Socket-->>OtherPlayers: emit('dice_result', { roll })

    Player->>Web: Click "Leave table"
    Web->>Socket: emit('leave_table', { tableId })
    Socket-->>OtherPlayers: emit('user_left', { userId })
    Socket->>Socket: Disconnect from room
```

---

### 8.3 AI Rules Query with Caching

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js App
    participant API as Express API
    participant Redis as Upstash Redis
    participant OpenAI as OpenAI API

    User->>Web: Click "Ask AI" in sidebar
    Web->>Web: Show AI input modal
    User->>Web: Type "How does grappling work?"

    Web->>API: POST /api/ai/query { type: 'rules', prompt }
    API->>API: Hash prompt (SHA256)
    API->>Redis: GET ai:rules:{hash}

    alt Cache Hit
        Redis-->>API: Cached response
        API-->>Web: { response, usage }
    else Cache Miss
        API->>API: Check user tier limits
        API->>OpenAI: POST /chat/completions
        OpenAI-->>API: AI response
        API->>Redis: SET ai:rules:{hash} response (TTL 3600s)
        API->>DB: Log usage (for rate limiting)
        API-->>Web: { response, usage }
    end

    Web-->>User: Display AI response in modal
```

---

### 8.4 Combat Encounter Workflow

```mermaid
sequenceDiagram
    actor DM
    participant Web as Next.js App
    participant API as Express API
    participant Socket as Socket.io Server
    participant DB as PostgreSQL
    actor Players

    DM->>Web: Click "Start Combat"
    Web->>Web: Show combat setup modal
    DM->>Web: Add PCs (auto-loaded) + NPCs
    DM->>Web: Click "Roll Initiative"
    Web->>API: POST /api/tables/:id/combat { combatants }
    API->>DB: Insert combat encounter
    API->>Socket: emit('combat_started', { combat })
    Socket-->>Players: emit('combat_updated', { combat })
    Web-->>DM: Show combat tracker

    loop Each Round
        DM->>Web: Active combatant highlighted
        DM->>Web: Player describes action in chat
        DM->>Web: Player rolls attack dice
        DM->>Web: DM clicks "+/-" to adjust HP
        Web->>API: PATCH /api/combat/:id { combatants }
        API->>DB: Update combatant HP
        API->>Socket: emit('combat_updated', { combat })
        Socket-->>Players: emit('combat_updated', { combat })

        DM->>Web: Click "End Turn"
        Web->>API: PATCH /api/combat/:id { round, activeIndex }
        API->>Socket: emit('combat_updated', { combat })
        Socket-->>Players: emit('combat_updated', { combat })
    end

    DM->>Web: Click "End Combat"
    Web->>API: POST /api/combat/:id/end
    API->>DB: Update combat state = 'ended'
    API->>Socket: emit('combat_ended', { combatId })
    Socket-->>Players: emit('combat_ended', { combatId })
    Web-->>DM: Close combat tracker
```

---

## 9. DATABASE SCHEMA

**Database:** PostgreSQL 15+ (Supabase-managed)

**ORM:** Prisma

**Schema File:** `packages/db/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id               String    @id @default(cuid())
  email            String    @unique
  username         String    @unique
  passwordHash     String?
  tier             String    @default("free") // free, premium, master
  stripeCustomerId String?   @unique
  avatar           String?
  bio              String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  characters       Character[]
  ownedTables      Table[]         @relation("TableOwner")
  tableMemberships TableMember[]
  messages         Message[]

  @@index([email])
  @@index([username])
}

model Character {
  id              String   @id @default(cuid())
  userId          String
  name            String
  race            String
  class           String
  level           Int      @default(1)

  // Ability Scores
  strength        Int
  dexterity       Int
  constitution    Int
  intelligence    Int
  wisdom          Int
  charisma        Int

  // Core Stats
  proficiencyBonus Int     @default(2)
  hp              Int
  maxHp           Int
  tempHp          Int      @default(0)
  ac              Int
  initiative      Int
  speed           Int      @default(30)

  // Skills & Proficiencies (JSON array of strings)
  proficiencies   Json     @default("[]")

  // Spells (JSON array of Spell objects)
  spells          Json     @default("[]")

  // Equipment (JSON array of EquipmentItem objects)
  equipment       Json     @default("[]")

  // Character Details
  background      String
  notes           String?
  avatarUrl       String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  tableMemberships TableMember[]
  messages        Message[]

  @@index([userId])
}

model Table {
  id              String   @id @default(cuid())
  ownerId         String
  name            String
  description     String
  playStyle       String   // sync, async, solo
  privacy         String   @default("private") // private, public, spectator
  inviteCode      String   @unique
  state           String   @default("setup") // setup, active, paused, completed
  schedule        String?
  maxPlayers      Int      @default(6)
  tags            String[] // Array of strings
  rulesVariant    String   @default("standard") // standard, homebrew
  thumbnailUrl    String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  lastActivityAt  DateTime @default(now())

  // Relations
  owner           User            @relation("TableOwner", fields: [ownerId], references: [id], onDelete: Cascade)
  members         TableMember[]
  messages        Message[]
  combatEncounters CombatEncounter[]

  @@index([ownerId])
  @@index([privacy, state]) // For public table discovery
  @@index([inviteCode])
}

model TableMember {
  id          String   @id @default(cuid())
  tableId     String
  userId      String
  characterId String
  role        String   @default("player") // dm, player
  status      String   @default("active") // active, invited, left
  joinedAt    DateTime @default(now())

  // Relations
  table       Table     @relation(fields: [tableId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character   Character @relation(fields: [characterId], references: [id], onDelete: Cascade)

  @@unique([tableId, userId]) // User can only join table once
  @@index([tableId])
  @@index([userId])
}

model Message {
  id          String   @id @default(cuid())
  tableId     String
  userId      String
  characterId String?  // Null for OOC messages
  type        String   // ic, ooc, dm-note, system
  content     String   @db.Text

  // Embedded data (JSON)
  diceRolls   Json     @default("[]") // Array of DiceRoll objects
  reactions   Json     @default("[]") // Array of Reaction objects

  parentId    String?  // For threading (async play)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  table       Table     @relation(fields: [tableId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  character   Character? @relation(fields: [characterId], references: [id], onDelete: SetNull)
  parent      Message?  @relation("MessageThread", fields: [parentId], references: [id], onDelete: Cascade)
  replies     Message[] @relation("MessageThread")

  @@index([tableId, createdAt]) // For message history pagination
  @@index([parentId])
}

model CombatEncounter {
  id          String   @id @default(cuid())
  tableId     String
  name        String
  round       Int      @default(1)
  state       String   @default("setup") // setup, active, ended

  // Combatants (JSON array of Combatant objects)
  combatants  Json     @default("[]")

  createdAt   DateTime @default(now())
  endedAt     DateTime?

  // Relations
  table       Table    @relation(fields: [tableId], references: [id], onDelete: Cascade)

  @@index([tableId])
}
```

**Key Indexes:**
- `User.email`, `User.username` - Login lookups
- `Table.privacy, Table.state` - Public table discovery
- `Message.tableId, Message.createdAt` - Message pagination
- `TableMember.tableId`, `TableMember.userId` - Membership queries

**JSON Fields Rationale:**
- `Character.spells`, `Character.equipment`, `Character.proficiencies` - Flexible D&D data, avoids many-to-many tables
- `Message.diceRolls`, `Message.reactions` - Embedded data, queried as part of message
- `CombatEncounter.combatants` - Ephemeral combat data, updated frequently as single document

---

## 10. FRONTEND ARCHITECTURE

### 10.1 Component Architecture

**Framework:** Next.js 14+ with App Router

**Component Organization:**

```
apps/web/src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth layout group
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/          # Dashboard layout group
│   │   ├── dashboard/
│   │   ├── tables/
│   │   ├── characters/
│   │   └── settings/
│   ├── tables/
│   │   └── [id]/             # Dynamic route
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/
│   ├── ui/                   # shadcn/ui components (from packages/ui)
│   ├── layout/               # Layout components (Nav, Footer)
│   ├── features/             # Feature-specific components
│   │   ├── chat/
│   │   ├── character-sheet/
│   │   ├── dice-roller/
│   │   └── combat-tracker/
│   └── shared/               # Shared components (EmptyState, ErrorBoundary)
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities, API client
├── stores/                   # Zustand stores
└── styles/                   # Global CSS, Tailwind config
```

**Component Template:**

```typescript
// apps/web/src/components/features/dice-roller/DicePanel.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDiceRoll } from '@/hooks/useDiceRoll';
import type { DiceRoll } from '@iarpg/shared';

interface DicePanelProps {
  tableId: string;
  characterId: string;
}

export function DicePanel({ tableId, characterId }: DicePanelProps) {
  const [notation, setNotation] = useState('');
  const { rollDice, isLoading } = useDiceRoll(tableId);

  const handleRoll = async () => {
    await rollDice({ notation, characterId });
    setNotation('');
  };

  return (
    <div className="space-y-4">
      {/* Quick dice buttons */}
      <div className="grid grid-cols-4 gap-2">
        {['d4', 'd6', 'd8', 'd10', 'd12', 'd20'].map((die) => (
          <Button
            key={die}
            variant="secondary"
            onClick={() => setNotation(`1${die}`)}
          >
            {die}
          </Button>
        ))}
      </div>

      {/* Custom notation input */}
      <div className="flex gap-2">
        <Input
          value={notation}
          onChange={(e) => setNotation(e.target.value)}
          placeholder="1d20+5"
        />
        <Button onClick={handleRoll} disabled={isLoading}>
          Roll
        </Button>
      </div>
    </div>
  );
}
```

---

### 10.2 State Management Architecture

**Tool:** Zustand

**State Structure:**

```typescript
// apps/web/src/stores/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@iarpg/shared';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
    }),
    { name: 'auth-storage' }
  )
);
```

**State Management Patterns:**
- **Auth state:** Global Zustand store (`useAuthStore`)
- **Table state:** Zustand store per table (`useTableStore`)
- **UI state:** React useState for local component state
- **Server state:** Avoid duplicating in Zustand, use React Query (future) or Server Components
- **Form state:** React Hook Form (uncontrolled components)

---

### 10.3 Routing Architecture

**Framework:** Next.js App Router (file-based)

**Route Organization:**

```
apps/web/src/app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx            # Auth layout (centered, no nav)
├── (dashboard)/
│   ├── layout.tsx            # Dashboard layout (nav, sidebar)
│   ├── dashboard/page.tsx
│   ├── tables/
│   │   ├── page.tsx          # Browse tables
│   │   └── new/page.tsx      # Create table
│   ├── characters/
│   │   ├── page.tsx          # My characters
│   │   └── new/page.tsx      # Create character
│   └── settings/
│       ├── page.tsx          # Account settings
│       └── billing/page.tsx
├── tables/
│   └── [id]/
│       ├── page.tsx          # Table view
│       └── settings/page.tsx
├── characters/
│   └── [id]/
│       ├── page.tsx          # Character sheet
│       └── edit/page.tsx
└── api/                      # Next.js API routes (minimal, mostly proxy to backend)
    └── upload/route.ts       # File upload handler
```

**Protected Route Pattern:**

```typescript
// apps/web/src/app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

---

### 10.4 Frontend Services Layer

**API Client Setup:**

```typescript
// apps/web/src/lib/api-client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/useAuthStore';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Add auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Service Example:**

```typescript
// apps/web/src/lib/services/characters.service.ts
import apiClient from '../api-client';
import type { Character } from '@iarpg/shared';

export const charactersService = {
  async getAll(): Promise<Character[]> {
    const { data } = await apiClient.get('/api/characters');
    return data.characters;
  },

  async getById(id: string): Promise<Character> {
    const { data } = await apiClient.get(`/api/characters/${id}`);
    return data.character;
  },

  async create(character: Partial<Character>): Promise<Character> {
    const { data } = await apiClient.post('/api/characters', character);
    return data.character;
  },

  async update(id: string, updates: Partial<Character>): Promise<Character> {
    const { data } = await apiClient.patch(`/api/characters/${id}`, updates);
    return data.character;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/characters/${id}`);
  },
};
```

---

## 11. BACKEND ARCHITECTURE

### 11.1 Service Architecture (Express.js)

**Structure:** Traditional server (not serverless functions)

**Controller/Route Organization:**

```
apps/api/src/
├── routes/
│   ├── auth.routes.ts
│   ├── users.routes.ts
│   ├── characters.routes.ts
│   ├── tables.routes.ts
│   ├── messages.routes.ts
│   ├── combat.routes.ts
│   └── ai.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── users.controller.ts
│   └── ...
├── services/
│   ├── auth.service.ts
│   ├── characters.service.ts
│   ├── ai.service.ts
│   └── ...
├── repositories/
│   ├── users.repository.ts
│   ├── characters.repository.ts
│   └── ...
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   ├── rate-limit.middleware.ts
│   └── error.middleware.ts
├── socket/
│   ├── socket.server.ts
│   ├── handlers/
│   │   ├── table.handler.ts
│   │   ├── dice.handler.ts
│   │   └── combat.handler.ts
│   └── middleware/
│       └── socket-auth.middleware.ts
├── utils/
│   ├── logger.ts
│   ├── dice-parser.ts
│   └── cache.ts
├── config/
│   └── index.ts
└── server.ts
```

**Controller Template:**

```typescript
// apps/api/src/controllers/characters.controller.ts
import { Request, Response, NextFunction } from 'express';
import { charactersService } from '../services/characters.service';
import { AppError } from '../utils/errors';

export const charactersController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id; // From auth middleware
      const characters = await charactersService.getAllByUser(userId);
      res.json({ characters });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const character = await charactersService.create(userId, req.body);
      res.status(201).json({ character });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const character = await charactersService.getById(req.params.id);

      // Authorization check
      if (character.userId !== req.user!.id) {
        throw new AppError('Forbidden', 403);
      }

      res.json({ character });
    } catch (error) {
      next(error);
    }
  },

  // ... update, delete
};
```

---

### 11.2 Database Architecture

**Schema Design:** See section 9 (Database Schema)

**Data Access Layer (Repository Pattern):**

```typescript
// apps/api/src/repositories/characters.repository.ts
import { prisma } from '@iarpg/db';
import type { Character } from '@iarpg/shared';

export const charactersRepository = {
  async findById(id: string): Promise<Character | null> {
    return prisma.character.findUnique({
      where: { id },
    });
  },

  async findAllByUser(userId: string): Promise<Character[]> {
    return prisma.character.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async create(data: Partial<Character>): Promise<Character> {
    return prisma.character.create({
      data: data as any, // Cast to satisfy Prisma types
    });
  },

  async update(id: string, data: Partial<Character>): Promise<Character> {
    return prisma.character.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.character.delete({
      where: { id },
    });
  },
};
```

---

### 11.3 Authentication and Authorization

**Auth Flow:**

```mermaid
sequenceDiagram
    actor User
    participant Web as Next.js
    participant API as Express API
    participant DB as PostgreSQL

    User->>Web: Enter credentials
    Web->>API: POST /api/auth/login
    API->>DB: Find user by email
    DB-->>API: User record
    API->>API: Verify password (bcrypt)

    alt Valid credentials
        API->>API: Generate JWT token
        API-->>Web: { user, token }
        Web->>Web: Store token in Zustand + localStorage
        Web-->>User: Redirect to dashboard
    else Invalid credentials
        API-->>Web: 401 Unauthorized
        Web-->>User: Show error
    end

    Note over User,API: Subsequent requests

    User->>Web: Access protected page
    Web->>API: GET /api/characters<br/>Authorization: Bearer {token}
    API->>API: Verify JWT token

    alt Valid token
        API->>DB: Query characters
        DB-->>API: Characters
        API-->>Web: { characters }
    else Invalid/expired token
        API-->>Web: 401 Unauthorized
        Web->>Web: Logout, redirect to /login
    end
```

**Middleware/Guards:**

```typescript
// apps/api/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errors';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Attach user to request
    req.user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401));
    } else {
      next(error);
    }
  }
}

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

---

## 12. UNIFIED PROJECT STRUCTURE

**Monorepo:** pnpm workspaces + Turborepo

```
iarpg/
├── .github/
│   └── workflows/
│       ├── ci.yaml                 # Test, lint, typecheck
│       └── deploy.yaml             # Deploy to Vercel + Railway
├── apps/
│   ├── web/                        # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                # App Router pages
│   │   │   ├── components/         # React components
│   │   │   ├── hooks/              # Custom hooks
│   │   │   ├── lib/                # Utilities, API client
│   │   │   ├── stores/             # Zustand stores
│   │   │   └── styles/             # Global CSS
│   │   ├── public/                 # Static assets
│   │   ├── tests/                  # Vitest tests
│   │   ├── next.config.js
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── api/                        # Express.js backend
│       ├── src/
│       │   ├── routes/             # API routes
│       │   ├── controllers/        # Route controllers
│       │   ├── services/           # Business logic
│       │   ├── repositories/       # Data access
│       │   ├── middleware/         # Express middleware
│       │   ├── socket/             # Socket.io server + handlers
│       │   ├── utils/              # Utilities
│       │   ├── config/             # Config loader
│       │   └── server.ts           # Entry point
│       ├── tests/                  # Vitest tests
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared/                     # Shared types + utils
│   │   ├── src/
│   │   │   ├── types/              # TypeScript interfaces
│   │   │   ├── validators/         # Zod schemas
│   │   │   ├── constants/          # Shared constants
│   │   │   └── utils/              # Shared utilities
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── ui/                         # Shared UI components
│   │   ├── src/
│   │   │   ├── components/         # shadcn/ui components
│   │   │   └── index.ts
│   │   ├── tailwind.config.js      # Shared Tailwind config
│   │   ├── tsconfig.json
│   │   └── package.json
│   ├── db/                         # Prisma schema + client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts            # Export Prisma client
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── config/                     # Shared configs
│       ├── eslint/
│       │   └── index.js
│       ├── typescript/
│       │   └── base.json
│       └── jest/
│           └── jest.config.js
├── docs/
│   ├── prd.md
│   ├── front-end-spec.md
│   └── fullstack-architecture.md   # This document
├── scripts/
│   ├── seed-db.ts                  # Database seeding
│   └── setup.sh                    # Initial setup script
├── .env.example
├── .gitignore
├── package.json                    # Root package.json
├── pnpm-workspace.yaml
├── turbo.json
├── README.md
└── tsconfig.json                   # Root TypeScript config
```

**Key Files:**

**`pnpm-workspace.yaml`:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**`turbo.json`:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Root `package.json`:**
```json
{
  "name": "iarpg",
  "private": true,
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "db:migrate": "pnpm --filter @iarpg/db prisma migrate dev",
    "db:studio": "pnpm --filter @iarpg/db prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  }
}
```

---

## 13. DEVELOPMENT WORKFLOW

### 13.1 Local Development Setup

**Prerequisites:**

```bash
# Install Node.js 20 LTS
node --version  # Should be v20.x.x

# Install pnpm
npm install -g pnpm@9

# Install Docker (optional, for local PostgreSQL)
docker --version
```

**Initial Setup:**

```bash
# Clone repository
git clone https://github.com/your-org/iarpg.git
cd iarpg

# Install all dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Supabase, OpenAI keys

# Run database migrations
pnpm db:migrate

# (Optional) Seed database with test data
pnpm db:seed

# Start all services in development mode
pnpm dev
```

**Development Commands:**

```bash
# Start all services (frontend + backend)
pnpm dev

# Start frontend only
pnpm --filter web dev

# Start backend only
pnpm --filter api dev

# Run tests (all packages)
pnpm test

# Run tests for specific package
pnpm --filter web test

# Lint all code
pnpm lint

# Type check
pnpm typecheck

# Build for production
pnpm build

# Database commands
pnpm db:migrate        # Run migrations
pnpm db:studio         # Open Prisma Studio
pnpm db:seed           # Seed test data
```

---

### 13.2 Environment Configuration

**Frontend (`.env.local` in `apps/web`):**

```bash
# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production

# Supabase (public)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optional)
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Backend (`.env` in `apps/api`):**

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/iarpg

# JWT
JWT_SECRET=your-jwt-secret-change-in-production

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Redis (Upstash)
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your-redis-token

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Anthropic (fallback)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Email (Resend)
RESEND_API_KEY=re_your-resend-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # Max requests per window
```

**Shared:**

```bash
# Logging
LOG_LEVEL=info  # debug, info, warn, error
```

---

## 14. DEPLOYMENT ARCHITECTURE

### 14.1 Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm turbo run build --filter=web`
- **Output Directory:** `apps/web/.next`
- **CDN/Edge:** Vercel Edge Network (automatic)
- **Environment:** `NEXT_PUBLIC_API_URL` set to production backend URL

**Backend Deployment:**
- **Platform:** Railway (or Render as alternative)
- **Build Command:** `pnpm turbo run build --filter=api`
- **Start Command:** `node apps/api/dist/server.js`
- **Deployment Method:** Docker container (Railway builds from Dockerfile)
- **Auto-scaling:** Railway handles based on traffic

---

### 14.2 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/ci.yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm typecheck

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # Vercel deployment (automatic via Vercel GitHub integration)
      # Railway deployment (automatic via Railway GitHub integration)

      - name: Run database migrations
        run: |
          pnpm db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

### 14.3 Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| **Development** | http://localhost:3000 | http://localhost:3001 | Local development |
| **Staging** | https://staging.iarpg.com | https://api-staging.iarpg.com | Pre-production testing |
| **Production** | https://iarpg.com | https://api.iarpg.com | Live environment |

**Environment-Specific Configuration:**
- **Development:** Verbose logging, hot reload, relaxed CORS
- **Staging:** Production-like, test Stripe keys, Sentry enabled
- **Production:** Optimized builds, strict CORS, monitoring enabled, rate limiting enforced

---

## 15. SECURITY AND PERFORMANCE

### 15.1 Security Requirements

**Frontend Security:**
- **CSP Headers:**
  ```
  Content-Security-Policy: default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    connect-src 'self' https://api.iarpg.com wss://api.iarpg.com https://api.openai.com;
  ```
- **XSS Prevention:** Sanitize user-generated content (DOMPurify for markdown), React auto-escaping
- **Secure Storage:** Sensitive tokens in httpOnly cookies (NextAuth), non-sensitive in localStorage

**Backend Security:**
- **Input Validation:** express-validator on all endpoints, Zod schemas for type validation
- **Rate Limiting:**
  ```typescript
  // Global: 100 requests per 15 minutes per IP
  // Auth endpoints: 5 requests per 15 minutes per IP
  // AI endpoints: 10 requests per day per user (free tier)
  ```
- **CORS Policy:**
  ```typescript
  app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }));
  ```

**Authentication Security:**
- **Token Storage:** JWT in httpOnly cookie (NextAuth handles this)
- **Session Management:** 30-day expiry, refresh token rotation
- **Password Policy:** Min 8 characters, bcrypt with 12 rounds

---

### 15.2 Performance Optimization

**Frontend Performance:**
- **Bundle Size Target:** <200KB initial JS (gzip)
- **Loading Strategy:**
  - Code splitting per route (Next.js automatic)
  - Dynamic imports for heavy components (character sheet, combat tracker)
  - Image optimization (Next.js Image component, WebP format)
- **Caching Strategy:**
  - Static assets: 1 year cache (immutable)
  - API responses: SWR pattern (stale-while-revalidate)
  - Service worker: Workbox for offline capabilities (future)

**Backend Performance:**
- **Response Time Target:** p95 <300ms for API requests
- **Database Optimization:**
  - Indexes on frequently queried fields (see schema)
  - Connection pooling (Prisma default: 10 connections)
  - N+1 query prevention (Prisma `include` for relations)
- **Caching Strategy:**
  - Redis for AI responses (TTL: 1 hour)
  - Redis for session data (TTL: 30 days)
  - In-memory cache for static data (D&D rules, spells)

---

## 16. TESTING STRATEGY

### 16.1 Testing Pyramid

```
           E2E Tests (Playwright)
              /                \
         Integration Tests (Vitest)
            /                      \
   Frontend Unit Tests      Backend Unit Tests
       (Vitest + RTL)            (Vitest)
```

**Coverage Targets:**
- Unit tests: 70%+ coverage
- Integration tests: Critical paths (auth, character creation, table join, combat)
- E2E tests: Happy paths for 3 core user journeys

---

### 16.2 Test Organization

**Frontend Tests:**

```
apps/web/tests/
├── unit/
│   ├── components/
│   │   ├── DicePanel.test.tsx
│   │   └── CharacterSheet.test.tsx
│   └── hooks/
│       └── useDiceRoll.test.ts
├── integration/
│   └── auth-flow.test.tsx
└── e2e/
    └── sync-play-session.spec.ts
```

**Backend Tests:**

```
apps/api/tests/
├── unit/
│   ├── services/
│   │   ├── characters.service.test.ts
│   │   └── ai.service.test.ts
│   └── utils/
│       └── dice-parser.test.ts
├── integration/
│   └── api/
│       ├── auth.routes.test.ts
│       └── characters.routes.test.ts
└── e2e/
    └── combat-encounter.spec.ts
```

---

### 16.3 Test Examples

**Frontend Component Test:**

```typescript
// apps/web/tests/unit/components/DicePanel.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DicePanel } from '@/components/features/dice-roller/DicePanel';

describe('DicePanel', () => {
  it('should render quick dice buttons', () => {
    render(<DicePanel tableId="test" characterId="char1" />);

    expect(screen.getByText('d20')).toBeInTheDocument();
    expect(screen.getByText('d6')).toBeInTheDocument();
  });

  it('should roll dice on button click', async () => {
    const mockRoll = vi.fn();
    render(<DicePanel tableId="test" characterId="char1" onRoll={mockRoll} />);

    fireEvent.click(screen.getByText('d20'));
    fireEvent.click(screen.getByText('Roll'));

    expect(mockRoll).toHaveBeenCalledWith({
      notation: '1d20',
      characterId: 'char1',
    });
  });
});
```

**Backend API Test:**

```typescript
// apps/api/tests/integration/api/characters.routes.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '@/server';
import { prisma } from '@iarpg/db';

describe('POST /api/characters', () => {
  let authToken: string;

  beforeAll(async () => {
    // Setup test user and get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password' });
    authToken = res.body.token;
  });

  it('should create a character', async () => {
    const res = await request(app)
      .post('/api/characters')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Thorin',
        race: 'Dwarf',
        class: 'Fighter',
        level: 1,
        abilityScores: {
          strength: 16,
          dexterity: 12,
          constitution: 14,
          intelligence: 10,
          wisdom: 11,
          charisma: 8,
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.character.name).toBe('Thorin');
  });

  it('should require authentication', async () => {
    const res = await request(app)
      .post('/api/characters')
      .send({ name: 'Gandalf' });

    expect(res.status).toBe(401);
  });
});
```

**E2E Test:**

```typescript
// apps/web/tests/e2e/sync-play-session.spec.ts
import { test, expect } from '@playwright/test';

test('user can join table and send message in sync play', async ({ page }) => {
  // Login
  await page.goto('http://localhost:3000/login');
  await page.fill('input[name="email"]', 'player@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navigate to table
  await page.goto('http://localhost:3000/dashboard');
  await page.click('text=Lost Mines');

  // Wait for table to load
  await expect(page.locator('h1')).toContainText('Lost Mines');

  // Send message
  const messageInput = page.locator('input[placeholder*="message"]');
  await messageInput.fill('I attack the goblin!');
  await messageInput.press('Enter');

  // Verify message appears
  await expect(page.locator('text=I attack the goblin!')).toBeVisible();
});
```

---

## 17. CODING STANDARDS

### 17.1 Critical Fullstack Rules

- **Type Sharing:** Always define shared types in `packages/shared/src/types` and import from `@iarpg/shared` - never duplicate types between frontend/backend
- **API Calls:** Never make direct HTTP calls from components - use service layer (`lib/services/*.service.ts`)
- **Environment Variables:** Access only through config objects (`config/index.ts`), never `process.env` directly in business logic
- **Error Handling:** All API routes must use the standard error handler middleware - throw `AppError` for expected errors
- **State Updates:** Never mutate state directly in Zustand - use store actions only
- **Database Access:** Always use repository layer - controllers should never call Prisma directly
- **Validation:** Use Zod schemas from `packages/shared` for both frontend forms and backend validation
- **Async Code:** Use `async/await`, never raw Promises with `.then/.catch`

---

### 17.2 Naming Conventions

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| **Components** | PascalCase | - | `CharacterSheet.tsx` |
| **Hooks** | camelCase with `use` prefix | - | `useAuth.ts`, `useDiceRoll.ts` |
| **API Routes** | - | kebab-case | `/api/user-profile`, `/api/tables/:id/join` |
| **Database Tables** | - | snake_case | `user_profiles`, `table_members` |
| **Files (general)** | kebab-case | kebab-case | `dice-panel.tsx`, `auth.service.ts` |
| **Constants** | SCREAMING_SNAKE_CASE | SCREAMING_SNAKE_CASE | `MAX_PLAYERS`, `DEFAULT_TIER` |
| **Interfaces/Types** | PascalCase | PascalCase | `User`, `DiceRoll`, `ApiError` |

---

## 18. ERROR HANDLING STRATEGY

### 18.1 Error Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    Frontend->>Backend: API Request
    Backend->>Backend: Validate input (Zod)

    alt Validation Error
        Backend-->>Frontend: 400 Bad Request { error }
        Frontend->>Frontend: Show inline error (form field)
        Frontend-->>User: Display error message
    else Valid Input
        Backend->>Database: Query

        alt Database Error
            Database-->>Backend: Error
            Backend->>Backend: Log error (Sentry)
            Backend-->>Frontend: 500 Internal Server Error
            Frontend->>Frontend: Show error banner
            Frontend-->>User: "Something went wrong, try again"
        else Success
            Database-->>Backend: Data
            Backend-->>Frontend: 200 OK { data }
            Frontend-->>User: Display data
        end
    end
```

---

### 18.2 Error Response Format

```typescript
// packages/shared/src/types/error.ts
interface ApiError {
  error: {
    code: string;            // Machine-readable code (e.g., "VALIDATION_ERROR")
    message: string;         // Human-readable message
    details?: Record<string, any>; // Additional context (e.g., field errors)
    timestamp: string;       // ISO timestamp
    requestId: string;       // For debugging
  };
}
```

**Example Responses:**

```json
// Validation Error (400)
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": {
      "email": "Email is required",
      "password": "Password must be at least 8 characters"
    },
    "timestamp": "2025-09-30T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}

// Unauthorized (401)
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "timestamp": "2025-09-30T12:00:00.000Z",
    "requestId": "req_def456"
  }
}

// Not Found (404)
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Character not found",
    "timestamp": "2025-09-30T12:00:00.000Z",
    "requestId": "req_ghi789"
  }
}

// Internal Server Error (500)
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "timestamp": "2025-09-30T12:00:00.000Z",
    "requestId": "req_jkl012"
  }
}
```

---

### 18.3 Frontend Error Handling

```typescript
// apps/web/src/lib/api-client.ts (interceptor)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError = error.response?.data?.error;

    // Log to Sentry
    Sentry.captureException(error, {
      extra: { apiError },
    });

    // Handle specific error codes
    if (apiError?.code === 'UNAUTHORIZED') {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    // Show toast notification
    toast.error(apiError?.message || 'Something went wrong');

    return Promise.reject(apiError);
  }
);
```

---

### 18.4 Backend Error Handling

```typescript
// apps/api/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import logger from '../utils/logger';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = req.id || Math.random().toString(36);

  // Log error
  logger.error('API Error', {
    requestId,
    path: req.path,
    method: req.method,
    error: err,
  });

  // Handle known errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  // Validation errors (Zod)
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: err.errors,
        timestamp: new Date().toISOString(),
        requestId,
      },
    });
  }

  // Database errors (Prisma)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_ENTRY',
          message: 'Resource already exists',
          details: err.meta,
          timestamp: new Date().toISOString(),
          requestId,
        },
      });
    }
  }

  // Unknown errors
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      requestId,
    },
  });
}
```

---

## 19. MONITORING AND OBSERVABILITY

### 19.1 Monitoring Stack

- **Frontend Monitoring:** Sentry (errors), Vercel Analytics (performance), PostHog (product analytics)
- **Backend Monitoring:** Sentry (errors), Pino (structured logging), Railway metrics (CPU/memory)
- **Error Tracking:** Sentry (unified for frontend + backend)
- **Performance Monitoring:** Sentry Performance, Vercel Web Vitals

---

### 19.2 Key Metrics

**Frontend Metrics:**
- **Core Web Vitals:**
  - LCP (Largest Contentful Paint): <2.5s
  - FID (First Input Delay): <100ms
  - CLS (Cumulative Layout Shift): <0.1
- **JavaScript errors:** Track unhandled exceptions, React errors
- **API response times:** p50, p95, p99 latencies
- **User interactions:** Button clicks, form submissions (PostHog)

**Backend Metrics:**
- **Request rate:** Requests per minute (RPM)
- **Error rate:** Percentage of 4xx/5xx responses (target <1%)
- **Response time:** p50 <100ms, p95 <300ms, p99 <1s
- **Database query performance:** Slow query log (>1s queries)
- **WebSocket connections:** Active connections, message throughput

**Business Metrics (PostHog):**
- Weekly Active Tables (WAT) - North Star Metric
- DAU/WAU/MAU
- Signup → Activation rate
- Activation → First Session rate
- Free → Premium conversion rate

---

## 20. CHANGE LOG

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-30 | 1.0 | Initial fullstack architecture document | Winston (Architect) |

---

**Status:** ✅ **Ready for Implementation**

**Next Steps:**
1. **Setup monorepo:** Initialize pnpm workspace structure
2. **Configure tooling:** ESLint, TypeScript, Tailwind, Prisma
3. **Implement Epic 1:** Infrastructure + Auth (Stories 1.1 - 1.13)
4. **Begin development** following this architecture spec

---

**Related Documents:**
- [PRD v1.1](./prd.md) - Product requirements and epics
- [Front-End Spec v1.4](./front-end-spec.md) - UI/UX design specification
