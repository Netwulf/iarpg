# Story DB.2: Message Persistence Integration

**Epic**: Database Integration
**Priority**: Critical
**Points**: 8
**Status**: Completed ✅
**Dependencies**: DB.1

## User Story

As a user, I want my messages to be persisted in the database so that I can see message history when I return to a table.

## Context

Currently, messages are only stored in-memory and broadcast via Socket.io. This story integrates Supabase for message persistence:
- Save messages to database when sent
- Load message history on table join
- Update Socket.io to work with persisted data
- Implement pagination for large message histories

## Acceptance Criteria

- [x] POST /api/tables/:id/messages saves to Supabase
- [x] GET /api/tables/:id/messages retrieves from Supabase with pagination
- [x] Message history loads when joining table
- [x] Socket.io broadcasts include database-persisted message IDs
- [x] Message pagination implemented (limit 50 per page, max 100)
- [x] Real-time messages automatically appear without refresh
- [x] User information populated in messages (username, avatar)
- [x] Timestamp stored and displayed correctly
- [x] All existing tests pass (lint + typecheck)

## Technical Implementation

### API Routes Updates

```typescript
// apps/api/src/routes/tables.routes.ts

// GET /api/tables/:id/messages
router.get('/:id/messages', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const { limit = 50, before } = req.query;

    // Query with pagination
    let query = supabase
      .from('messages')
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('table_id', tableId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error } = await query;

    if (error) throw error;

    res.json({ messages: messages.reverse() });
  } catch (error) {
    next(error);
  }
});

// POST /api/tables/:id/messages
router.post('/:id/messages', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const userId = req.user!.id;
    const { content, type = 'ic' } = req.body;

    // Insert message into Supabase
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        table_id: tableId,
        user_id: userId,
        content: content.trim(),
        type,
      })
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    // Broadcast to Socket.io room
    const io = getIO();
    io.to(`table:${tableId}`).emit('message:new', message);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});
```

### Client-Side Message Loading

```typescript
// apps/web/src/app/tables/[id]/table-page-client.tsx

useEffect(() => {
  const fetchMessages = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tables/${tableId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  fetchMessages();
}, [tableId]);
```

### Message History Pagination

```typescript
const loadMoreMessages = async () => {
  if (messages.length === 0) return;

  const oldestMessage = messages[0];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/tables/${tableId}/messages?before=${oldestMessage.created_at}`
    );
    const data = await response.json();
    setMessages((prev) => [...data.messages, ...prev]);
  } catch (error) {
    console.error('Error loading more messages:', error);
  }
};
```

## Definition of Done

- Messages persist across browser refreshes
- Message history loads on table join
- Pagination works for tables with >50 messages
- Real-time updates continue to work via Socket.io
- User information displays correctly in messages
- All tests pass (lint + typecheck)
- No regressions in existing chat functionality

## Dependencies

- DB.1 (Database Setup with Supabase) must be complete
- Supabase project must be configured with schema applied

## Risks & Mitigations

- **Risk**: Race condition between Socket.io broadcast and database save
  **Mitigation**: Save to DB first, then broadcast with DB-generated ID

- **Risk**: Large message histories causing slow loads
  **Mitigation**: Implement pagination from the start

- **Risk**: Message deduplication issues
  **Mitigation**: Use database-generated UUIDs instead of client-side IDs

## File List

### Modified Files
- `apps/api/src/routes/tables.routes.ts` - Update message endpoints to use Supabase
- `apps/web/src/app/tables/[id]/table-page-client.tsx` - Load messages from API on mount
- `apps/web/src/hooks/useTableSocket.ts` - Update message handling

### Potential New Files
- `apps/web/src/hooks/useMessages.ts` - Hook for message loading and pagination (optional)

## Testing Strategy

- Manual: Send messages and verify they persist
- Manual: Refresh browser and verify messages reload
- Manual: Test pagination with 100+ messages
- Manual: Verify real-time updates still work
- Integration: Test Socket.io + Database integration

## Timeline Estimate

- API routes update: 2 hours
- Client-side integration: 2 hours
- Pagination implementation: 1.5 hours
- Testing + bug fixes: 1.5 hours
- **Total**: ~7 hours
