# Story WEEK1.2: Connect WebSocket for Real-Time Features

## Status
Draft

## Story
**As a** player in a table,
**I want** real-time updates for messages, combat, and player actions,
**so that** I can see what's happening instantly without refreshing the page.

## Story Context

**Existing System Integration:**
- Integrates with: Socket.io backend (`/apps/api/src/socket/index.ts`), React Context API
- Technology: Socket.io client v4, React Context, Next.js App Router
- Follows pattern: React Context provider pattern (like auth context)
- Touch points: Table page, combat tracker, message system, typing indicators

**Current Issue:**
- Socket.io backend fully implemented and emitting events
- Frontend has `useTableSocket` hook ready
- **Missing:** SocketContext Provider wrapper in app layout
- Result: `useSocket()` returns undefined, no real-time features work

## Acceptance Criteria

**Functional Requirements:**

1. SocketContext provider wraps the entire app in `/apps/web/src/app/layout.tsx`
2. Socket.io client connects to backend at `process.env.NEXT_PUBLIC_API_URL`
3. Real-time messages appear instantly in table chat without refresh

**Integration Requirements:**

4. Existing `useTableSocket` hook works without modifications
5. Socket connection persists across page navigation within app
6. Socket reconnects automatically if connection drops

**Quality Requirements:**

7. Connection status visible to user (connected/disconnected indicator)
8. No memory leaks from socket listeners
9. Graceful degradation if WebSocket unavailable (fallback to polling)

## Technical Notes

**Files Requiring Changes:**
```
Create SocketContext Provider:
- /apps/web/src/contexts/SocketContext.tsx (EXISTS, verify it works)
- /apps/web/src/app/layout.tsx (ADD provider wrapper)

Verify Working:
- /apps/web/src/hooks/useTableSocket.ts (should work once context exists)
- /apps/web/src/app/tables/[id]/table-page-client.tsx (already uses hook)
```

**Integration Approach:**
1. Verify `SocketContext.tsx` creates Socket.io client correctly
2. Add `<SocketProvider>` to `layout.tsx` (wrap children)
3. Configure socket to connect to `NEXT_PUBLIC_API_URL`
4. Test connection in table page

**Existing Pattern Reference:**
- Context pattern: Similar to NextAuth `SessionProvider`
- Socket.io client: `io(NEXT_PUBLIC_API_URL, { withCredentials: true })`

**Key Constraints:**
- Must work with SSR (Next.js App Router)
- Socket connection only on client-side (use 'use client')
- Handle auth credentials for socket connection
- Cleanup listeners on component unmount

## Definition of Done

- [x] SocketContext provider created and working
- [x] Provider wraps app in `layout.tsx`
- [x] Socket.io connects to backend successfully
- [x] Real-time messages work in table chat
- [x] Combat updates appear instantly
- [x] Typing indicators show/hide in real-time
- [x] Connection status indicator shows connected/disconnected
- [x] No console errors about socket connection
- [x] Socket reconnects after network interruption

## Risk and Compatibility Check

**Primary Risk:** SSR/hydration issues with Socket.io client in Next.js App Router

**Mitigation:**
- Use 'use client' directive in SocketContext
- Only initialize socket in useEffect (client-side only)
- Provide default state for SSR (not connected)

**Rollback:**
- Remove `<SocketProvider>` from layout.tsx
- App falls back to HTTP polling (existing behavior)

**Compatibility Verification:**
- [x] No breaking changes to existing APIs
- [x] Existing table page UI unchanged
- [x] Works with existing auth flow
- [x] Performance: WebSocket more efficient than polling

## Tasks / Subtasks

- [ ] Verify SocketContext Implementation (AC: 1, 2)
  - [ ] Read `/apps/web/src/contexts/SocketContext.tsx`
  - [ ] Verify it creates Socket.io client with correct URL
  - [ ] Ensure `withCredentials: true` for auth
  - [ ] Check connected state management

- [ ] Add Provider to App Layout (AC: 1, 4)
  - [ ] Edit `/apps/web/src/app/layout.tsx`
  - [ ] Import SocketProvider
  - [ ] Wrap children with `<SocketProvider>`
  - [ ] Ensure 'use client' if needed

- [ ] Test Socket Connection (AC: 2, 3, 6, 9)
  - [ ] Open browser DevTools Network tab
  - [ ] Navigate to table page
  - [ ] Verify WebSocket connection established
  - [ ] Check for successful socket.io handshake

- [ ] Verify Real-Time Features (AC: 3, 7, 8)
  - [ ] Open table in two browser windows
  - [ ] Send message in window 1 -> appears instantly in window 2
  - [ ] Start typing in window 1 -> typing indicator shows in window 2
  - [ ] Start combat -> both windows update

- [ ] Add Connection Indicator (AC: 7)
  - [ ] Add small indicator in table header
  - [ ] Green dot = connected, red = disconnected
  - [ ] Show reconnecting state

- [ ] Test Reconnection (AC: 6)
  - [ ] Simulate network interruption (DevTools offline mode)
  - [ ] Verify socket attempts reconnect
  - [ ] Confirm features work after reconnection

## Dev Notes

**Relevant Source Tree:**
```
/apps/web/src/
  ├── contexts/SocketContext.tsx (create/verify)
  ├── app/layout.tsx (add provider)
  ├── hooks/useTableSocket.ts (already done, uses context)
  └── app/tables/[id]/table-page-client.tsx (already uses hook)

/apps/api/src/
  ├── socket/index.ts (backend - already working)
  └── server.ts (Socket.io server setup - done)
```

**Important Notes from Architecture:**
- Socket.io v4 with CORS enabled in backend (`server.ts:17-22`)
- Events emitted by backend: `message:new`, `combat:started`, `typing:start`, etc.
- Auth handled via session cookie (same as REST API)
- Room-based: users join `table:${tableId}` room

**From GAP-ANALYSIS:**
- Backend Socket.io fully implemented (15% coverage)
- All events defined but frontend not connected
- `useTableSocket` hook exists and ready to use
- Just needs SocketContext provider to activate

### Testing

**Test Standards:**
- Location: `/apps/web/__tests__/socket/`
- Framework: Jest + @testing-library/react
- Pattern: Mock Socket.io for unit tests, real connection for E2E

**Specific Testing Requirements:**
1. Test SocketContext provides socket instance
2. Test hook receives events correctly
3. Test reconnection logic
4. E2E: real-time message delivery

**Test Cases to Add:**
```typescript
// /apps/web/__tests__/socket/socket-context.test.tsx
describe('SocketContext', () => {
  it('provides socket instance to children', () => {
    // Render with SocketProvider
    // Access socket via useSocket hook
    // Assert socket is defined
  })

  it('connects to correct URL on mount', () => {
    // Mock io()
    // Render SocketProvider
    // Assert io() called with NEXT_PUBLIC_API_URL
  })

  it('handles disconnection and reconnection', () => {
    // Simulate disconnect event
    // Assert connected state = false
    // Simulate reconnect
    // Assert connected state = true
  })
})
```

**E2E Test:**
```typescript
// /apps/web/__tests__/e2e/real-time-messages.test.tsx
describe('Real-time Messages', () => {
  it('delivers messages instantly between clients', async () => {
    // Open two browser contexts
    // Navigate both to same table
    // Send message from client 1
    // Assert message appears in client 2 within 100ms
  })
})
```

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-04 | 1.0 | Initial story from GAP-ANALYSIS.md P0 item | PO (Sarah) |

## Dev Agent Record

### Agent Model Used
*To be populated by dev agent*

### Debug Log References
*To be populated by dev agent*

### Completion Notes List
*To be populated by dev agent*

### File List
*To be populated by dev agent*

## QA Results
*To be populated by QA agent*
