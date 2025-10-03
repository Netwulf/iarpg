# Database Integration Sprint

## Overview

This sprint migrates the IARPG application from mock data to Supabase for production-ready data persistence.

## Status

- **Sprint Status**: In Progress
- **Started**: 2025-01-02
- **Target Completion**: TBD
- **Total Points**: 21

## Stories

### ✅ DB.1: Database Setup with Supabase (5 points) - COMPLETED
**Status**: Completed
**Dependencies**: None

Setup Supabase as the database backend:
- ✅ Installed @supabase/supabase-js
- ✅ Created Supabase client configuration
- ✅ Created complete schema migration (6 tables)
- ✅ Generated TypeScript types
- ✅ Added environment variable templates
- ✅ Updated health check endpoints
- ✅ Wrote comprehensive documentation

**Files Created**:
- `packages/db/src/supabase.ts` - Client configuration
- `packages/db/src/types.ts` - TypeScript types
- `packages/db/supabase/migrations/20250102000000_initial_schema.sql` - Schema
- `packages/db/README.md` - Setup documentation
- `packages/db/.env.example` - Environment variables

**Next Steps**: User needs to:
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Copy environment variables to `.env` files
3. Run migration SQL in Supabase dashboard

---

### 📋 DB.2: Message Persistence Integration (8 points) - NOT STARTED
**Status**: Not Started
**Dependencies**: DB.1

Integrate Supabase for message persistence:
- [ ] Update POST /api/tables/:id/messages to save to Supabase
- [ ] Update GET /api/tables/:id/messages to retrieve from Supabase
- [ ] Implement message pagination (50 messages per page)
- [ ] Load message history on table join
- [ ] Maintain real-time Socket.io broadcasts
- [ ] Populate user information in messages

**Estimated Time**: ~7 hours

---

### 📋 DB.3: Table & Member Persistence (8 points) - NOT STARTED
**Status**: Not Started
**Dependencies**: DB.1

Integrate Supabase for table and member data:
- [ ] Implement table creation (POST /api/tables)
- [ ] Implement table retrieval with members (GET /api/tables/:id)
- [ ] Implement join via invite code (POST /api/tables/:id/join)
- [ ] Generate unique invite codes
- [ ] Track online/offline presence
- [ ] Update Socket.io for presence broadcasting

**Estimated Time**: ~8 hours

---

## Technical Architecture

### Database Schema

The Supabase schema includes 6 main tables:

1. **users** - User accounts and profiles
   - Authentication data, avatar, bio, tier
   - Online status and last seen tracking

2. **characters** - Player character sheets
   - Full D&D 5e stats (abilities, HP, AC, etc.)
   - Spells and equipment (JSONB)
   - Notes and background

3. **tables** - Game sessions
   - Table metadata, invite codes, state
   - Owner, privacy, play style
   - Max players, tags, rules variant

4. **table_members** - Junction table
   - Links users + characters to tables
   - Role (DM/player), status (active/invited/left)

5. **messages** - Chat messages
   - Content, type (IC/OOC/DM-note/system)
   - Dice rolls and reactions (JSONB)
   - Parent ID for threading

6. **combat_encounters** - Combat state
   - Initiative order, round tracking
   - Combatants array (JSONB)

### Row Level Security (RLS)

All tables have RLS policies that enforce:
- Users can only read their own data
- Users can read/write data for tables they belong to
- Table owners have full control over their tables
- Messages require table membership to view/create

### Real-time Integration

The architecture combines:
- **Supabase** for persistence and queries
- **Socket.io** for real-time broadcasts
- **React Query** (future) for client-side caching

**Pattern**:
1. Client sends message to API
2. API saves to Supabase
3. API broadcasts via Socket.io with DB-generated ID
4. All clients receive real-time update

## Migration Strategy

### Phase 1: Setup (DB.1) ✅
- Install Supabase client
- Create schema and types
- Configure environment
- Test connection

### Phase 2: Messages (DB.2)
- Migrate message endpoints to Supabase
- Implement pagination
- Maintain Socket.io broadcasts

### Phase 3: Tables (DB.3)
- Migrate table CRUD to Supabase
- Implement invite system
- Add presence tracking

### Phase 4: Cleanup (Future)
- Remove Prisma dependencies
- Remove mock data
- Update all remaining endpoints

## Environment Setup

### Required Environment Variables

**apps/web/.env.local**:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

**apps/api/.env**:
```bash
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

**packages/db/.env**:
```bash
SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Testing Strategy

### Manual Testing Checklist

After DB.2 (Messages):
- [ ] Send message and verify it persists
- [ ] Refresh browser and verify messages reload
- [ ] Test pagination with 100+ messages
- [ ] Verify real-time updates still work
- [ ] Test with multiple users in same table

After DB.3 (Tables):
- [ ] Create table and verify it persists
- [ ] Join table via invite code
- [ ] Verify member list shows online status
- [ ] Test presence updates (connect/disconnect)
- [ ] Test table full scenario

### Automated Testing

Future implementation:
- Integration tests for API + Supabase
- E2E tests with Playwright
- Real-time sync tests with multiple clients

## Rollback Plan

If issues arise:
1. Keep Prisma dependencies in place during migration
2. Feature flag new endpoints
3. Can revert to mock data if needed
4. Database schema is additive (won't break existing Prisma)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Socket.io Documentation](https://socket.io/docs/v4/)

## Timeline

| Story | Points | Status | Estimated Time |
|-------|--------|--------|----------------|
| DB.1  | 5      | ✅ Complete | ~4 hours |
| DB.2  | 8      | 📋 Not Started | ~7 hours |
| DB.3  | 8      | 📋 Not Started | ~8 hours |
| **Total** | **21** | **33% Complete** | **~19 hours** |

## Next Steps

1. **User Setup**: Create Supabase project and configure environment variables
2. **Run Migration**: Apply schema SQL in Supabase dashboard
3. **Verify Connection**: Test health check endpoints
4. **Begin DB.2**: Start message persistence integration

Once DB.1 is fully set up by the user, we can proceed with DB.2 and DB.3 in parallel if desired.
