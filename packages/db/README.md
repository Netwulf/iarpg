# @iarpg/db

Database package for IARPG - provides Supabase client and TypeScript types for database operations.

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Copy your project URL and API keys from Settings > API

### 2. Configure Environment Variables

Create `.env` file in this directory:

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```bash
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

Also add these to:
- `apps/web/.env.local` (with NEXT_PUBLIC_ prefix for client-side)
- `apps/api/.env` (for server-side API)

### 3. Run Database Migrations

Apply the schema to your Supabase database:

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/20250102000000_initial_schema.sql`
4. Paste and run the SQL

Alternatively, use Supabase CLI:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Verify Connection

Start the API server and test the health endpoint:

```bash
pnpm dev

# Test health check
curl http://localhost:3001/health
curl http://localhost:3001/health/db
```

## Usage

### Client-Side (Next.js App)

```typescript
import { supabase, type User, type Table } from '@iarpg/db';

// Query data
const { data: users, error } = await supabase
  .from('users')
  .select('*')
  .eq('username', 'alice');

// Insert data
const { data: newTable, error } = await supabase
  .from('tables')
  .insert({
    name: 'Dragon Hunt',
    description: 'Epic adventure',
    play_style: 'sync',
    invite_code: 'DRGHNT',
    owner_id: userId,
  })
  .select()
  .single();
```

### Server-Side (API with Admin Privileges)

```typescript
import { createSupabaseAdmin, type MessageInsert } from '@iarpg/db';

// Create admin client (bypasses RLS)
const supabaseAdmin = createSupabaseAdmin();

// Insert message
const { data, error } = await supabaseAdmin
  .from('messages')
  .insert({
    table_id: tableId,
    user_id: userId,
    type: 'ic',
    content: 'Hello adventurers!',
  })
  .select()
  .single();
```

## Schema Overview

### Tables

- **users** - User accounts and profile information
- **characters** - Player character sheets with stats
- **tables** - Game sessions/tables
- **table_members** - Junction table linking users and characters to tables
- **messages** - Chat messages with dice rolls and reactions
- **combat_encounters** - Combat state with initiative order

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can read their own data
- Users can read/write data for tables they belong to
- Owners have full control over their tables

## TypeScript Types

All database types are auto-exported:

```typescript
import type {
  User,
  Character,
  Table,
  Message,
  UserInsert,
  CharacterUpdate,
  Database,
} from '@iarpg/db';
```

## Migration from Prisma

This package maintains backward compatibility with Prisma during the migration period:

```typescript
// Legacy Prisma (deprecated)
import { prisma, type Prisma } from '@iarpg/db';

// New Supabase (recommended)
import { supabase, type User } from '@iarpg/db';
```

## Development

```bash
# Lint
pnpm lint

# Type check
pnpm typecheck
```

## Troubleshooting

### "Missing SUPABASE_URL environment variable"

Make sure you've created `.env` files in all required locations:
- `packages/db/.env`
- `apps/api/.env`
- `apps/web/.env.local`

### "Table does not exist"

Run the schema migration SQL in your Supabase dashboard's SQL Editor.

### RLS Policy Errors

If you're getting permission denied errors, you may need to:
1. Use the service role key (server-side only)
2. Disable RLS temporarily for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
3. Review and update RLS policies in the migration file

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
