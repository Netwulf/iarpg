# Story DB.1: Database Setup with Supabase

**Epic**: Database Integration
**Priority**: Critical
**Points**: 5
**Status**: Completed ✅

## User Story

As a developer, I need to set up Supabase as the database backend so that the application can persist data for tables, messages, and users.

## Context

Currently, the application uses mock data throughout. To move toward production, we need to integrate Supabase as the database backend. This story focuses on:
- Setting up Supabase project and client
- Creating database schema
- Configuring environment variables
- Testing connection

## Acceptance Criteria

- [x] Supabase project created and configured (ready for user setup)
- [x] Supabase client package installed (@supabase/supabase-js)
- [x] Database schema created with migrations:
  - `users` table (id, username, email, avatar_url, created_at, updated_at, online_status, last_seen_at)
  - `tables` table (id, name, game_system, description, invite_code, dm_id, max_players, created_at, updated_at)
  - `table_members` table (id, table_id, user_id, character_name, character_class, character_level, joined_at)
  - `messages` table (id, table_id, user_id, content, type, created_at)
  - `characters` table (full character sheet with stats)
  - `combat_encounters` table (combat state tracking)
- [x] Environment variables configured (.env.local for web, .env for api)
- [x] Supabase client singleton created in packages/db or shared location
- [x] Connection test endpoint created (GET /api/health/db)
- [x] Row Level Security (RLS) policies defined and enabled
- [x] TypeScript types generated from schema
- [x] All tests pass (lint + typecheck)

## Technical Notes

### Supabase Setup
```typescript
// packages/db/src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// For server-side with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Schema Example (SQL Migration)
```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  online_status TEXT DEFAULT 'offline' CHECK (online_status IN ('online', 'offline', 'away')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- tables table
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  game_system TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  dm_id UUID REFERENCES users(id) ON DELETE SET NULL,
  max_players INTEGER DEFAULT 6,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- table_members junction table
CREATE TABLE table_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  character_class TEXT NOT NULL,
  character_level INTEGER DEFAULT 1,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, user_id)
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'system', 'roll')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_messages_table_id ON messages(table_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_table_members_table_id ON table_members(table_id);
CREATE INDEX idx_table_members_user_id ON table_members(user_id);
CREATE INDEX idx_tables_invite_code ON tables(invite_code);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Environment Variables
```bash
# .env.local (apps/web)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# .env (apps/api)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### TypeScript Types
```typescript
// packages/db/src/types.ts
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          avatar_url: string | null;
          online_status: 'online' | 'offline' | 'away';
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          avatar_url?: string | null;
          online_status?: 'online' | 'offline' | 'away';
          last_seen_at?: string | null;
        };
        Update: {
          username?: string;
          email?: string;
          avatar_url?: string | null;
          online_status?: 'online' | 'offline' | 'away';
          last_seen_at?: string | null;
        };
      };
      // ... other tables
    };
  };
}
```

## Definition of Done

- Supabase project accessible and configured
- Schema migrations applied successfully
- Environment variables set and validated
- Database health check endpoint returns success
- TypeScript types available for all tables
- Documentation updated with setup instructions
- All existing tests pass (no regressions)

## Dependencies

- None (this is the foundation)

## Risks & Mitigations

- **Risk**: Supabase free tier limits
  **Mitigation**: Document limits, plan for upgrade if needed

- **Risk**: Connection issues in development
  **Mitigation**: Provide clear error messages and troubleshooting guide

## File List

### New Files
- ✅ `packages/db/src/supabase.ts` - Supabase client configuration
- ✅ `packages/db/src/types.ts` - TypeScript types from schema
- ✅ `packages/db/supabase/migrations/20250102000000_initial_schema.sql` - Initial schema migration
- ✅ `packages/db/.env.example` - Environment variable template
- ✅ `packages/db/README.md` - Database setup documentation

### Modified Files
- ✅ `.env.example` - Added Supabase environment variables
- ✅ `packages/db/package.json` - Added @supabase/supabase-js dependency
- ✅ `packages/db/src/index.ts` - Added Supabase exports
- ✅ `apps/api/src/routes/health.routes.ts` - Updated to use Supabase

## Testing Strategy

- Manual: Create Supabase project and verify setup
- Manual: Run health check endpoint
- Manual: Test connection with sample query
- Automated: Add basic connection test if possible

## Timeline Estimate

- Setup + Schema: 2 hours
- Client config + Types: 1 hour
- Testing + Documentation: 1 hour
- **Total**: ~4 hours
