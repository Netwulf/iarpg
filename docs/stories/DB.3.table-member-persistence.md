# Story DB.3: Table & Member Persistence

**Epic**: Database Integration
**Priority**: Critical
**Points**: 8
**Status**: Completed ✅
**Dependencies**: DB.1

## User Story

As a user, I want my tables and memberships to be persisted in the database so that I can create tables, invite members, and return to my games later.

## Context

Currently, table and member data is mocked. This story integrates Supabase for full table lifecycle:
- Create and persist tables
- Generate unique invite codes
- Join tables via invite code
- Load table details and member list
- Implement presence tracking (online/offline status)

## Acceptance Criteria

- [x] POST /api/tables creates table in Supabase
- [x] GET /api/tables/:id retrieves table with members from Supabase
- [x] POST /api/tables/:id/join adds user to table_members
- [x] GET /api/tables lists user's tables
- [x] GET /api/tables/by-code/:code retrieves table by invite code
- [x] Invite code generation is unique and URL-safe
- [x] Member list shows online/offline status
- [x] Socket.io updates presence on connect/disconnect
- [x] Character information stored and displayed for members
- [x] Table owner (DM) has proper permissions
- [x] All existing tests pass (lint + typecheck)

## Technical Implementation

### Table Creation

```typescript
// apps/api/src/routes/tables.routes.ts

// POST /api/tables
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { name, description, playStyle, maxPlayers } = req.body;

    // Generate unique invite code
    const inviteCode = generateInviteCode();

    const { data: table, error } = await supabase
      .from('tables')
      .insert({
        name,
        description,
        play_style: playStyle,
        owner_id: userId,
        invite_code: inviteCode,
        max_players: maxPlayers || 6,
        state: 'setup',
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ table });
  } catch (error) {
    next(error);
  }
});

function generateInviteCode(): string {
  // Generate 6-character uppercase alphanumeric code
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

### Table Retrieval with Members

```typescript
// GET /api/tables/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select(`
        *,
        owner:users!owner_id (
          id,
          username,
          avatar_url
        ),
        members:table_members (
          id,
          role,
          status,
          user:users!user_id (
            id,
            username,
            avatar_url,
            online_status,
            last_seen_at
          ),
          character:characters!character_id (
            id,
            name,
            class,
            level,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (tableError) throw tableError;

    res.json({ table });
  } catch (error) {
    next(error);
  }
});
```

### Join Table via Invite Code

```typescript
// POST /api/tables/:id/join
router.post('/:id/join', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const userId = req.user!.id;
    const { characterId } = req.body;

    // Verify table exists and has space
    const { data: table, error: tableError } = await supabase
      .from('tables')
      .select('*, members:table_members(count)')
      .eq('id', tableId)
      .single();

    if (tableError) throw tableError;
    if (!table) throw new AppError('Table not found', 404);

    const memberCount = table.members?.[0]?.count || 0;
    if (memberCount >= table.max_players) {
      throw new AppError('Table is full', 400);
    }

    // Add member
    const { data: member, error: memberError } = await supabase
      .from('table_members')
      .insert({
        table_id: tableId,
        user_id: userId,
        character_id: characterId,
        role: 'player',
        status: 'active',
      })
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          avatar_url
        ),
        character:characters!character_id (
          id,
          name,
          class,
          level
        )
      `)
      .single();

    if (memberError) {
      if (memberError.code === '23505') {
        throw new AppError('Already a member of this table', 400);
      }
      throw memberError;
    }

    // Broadcast to Socket.io room
    const io = getIO();
    io.to(`table:${tableId}`).emit('table:member-joined', {
      member,
    });

    res.status(201).json({ member });
  } catch (error) {
    next(error);
  }
});
```

### Presence Tracking

```typescript
// apps/api/src/socket/index.ts

socket.on('user:online', async () => {
  const userId = socket.data.userId;
  if (!userId) return;

  // Update user status in database
  await supabase
    .from('users')
    .update({
      online_status: 'online',
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Broadcast to all rooms user is in
  socket.rooms.forEach((room) => {
    if (room.startsWith('table:')) {
      socket.to(room).emit('presence:update', {
        userId,
        status: 'online',
      });
    }
  });
});

socket.on('disconnect', async () => {
  const userId = socket.data.userId;
  if (!userId) return;

  // Update user status in database
  await supabase
    .from('users')
    .update({
      online_status: 'offline',
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Broadcast to all rooms user was in
  socket.rooms.forEach((room) => {
    if (room.startsWith('table:')) {
      io.to(room).emit('presence:update', {
        userId,
        status: 'offline',
      });
    }
  });
});
```

## Definition of Done

- Tables persist across sessions
- Members can join via invite code
- Member list displays with online/offline status
- Table owner permissions work correctly
- Character information displays in member list
- Real-time presence updates via Socket.io
- All tests pass (lint + typecheck)
- No regressions in existing functionality

## Dependencies

- DB.1 (Database Setup with Supabase) must be complete
- User authentication must be working

## Risks & Mitigations

- **Risk**: Invite code collisions
  **Mitigation**: Check for uniqueness, retry on collision

- **Risk**: Race conditions when multiple users join simultaneously
  **Mitigation**: Use database constraints (UNIQUE on table_id + user_id)

- **Risk**: Stale presence data
  **Mitigation**: Update presence on every socket event, timeout after 30s

## File List

### Modified Files
- `apps/api/src/routes/tables.routes.ts` - Update all table endpoints to use Supabase
- `apps/api/src/socket/index.ts` - Add presence tracking
- `apps/web/src/app/tables/[id]/table-page-client.tsx` - Load table/members from API
- `apps/web/src/hooks/useTableSocket.ts` - Handle presence updates

### New Files
- `apps/api/src/utils/invite-code.ts` - Invite code generation utility (optional)

## Testing Strategy

- Manual: Create table and verify it persists
- Manual: Join table via invite code
- Manual: Verify member list updates
- Manual: Test presence indicators
- Manual: Test table full scenario
- Integration: Socket.io + Database presence sync

## Timeline Estimate

- Table CRUD endpoints: 2.5 hours
- Join/invite system: 2 hours
- Presence tracking: 2 hours
- Testing + bug fixes: 1.5 hours
- **Total**: ~8 hours
