# ✅ QA CHECKLIST - SPRINT WEEK 1

**Date:** 2025-10-04
**Sprint:** Week 1 - Critical Fixes
**Stories:** WEEK1.1, WEEK1.2, WEEK1.3, WEEK1.4, WEEK1.5
**QA Approach:** Manual testing + Critical automated tests

---

## 🎯 PRE-DEPLOYMENT CHECKLIST

### Phase 1: Database Migration (CRITICAL - DO FIRST)
- [ ] **1.1** Connect to Supabase dashboard
- [ ] **1.2** Navigate to SQL Editor
- [ ] **1.3** Copy contents of `/packages/db/supabase/migrations/20250104000000_create_missing_tables.sql`
- [ ] **1.4** Execute migration SQL
- [ ] **1.5** Verify 4 tables created: `ai_usage`, `async_turns`, `subscriptions`, `campaign_logs`
- [ ] **1.6** Check RLS policies enabled on all 4 tables
- [ ] **1.7** Verify indexes created (check query plan)

**Expected Result:**
```sql
-- Should return 4 rows
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('ai_usage', 'async_turns', 'subscriptions', 'campaign_logs');
```

---

### Phase 2: Code Deployment
- [ ] **2.1** Push code to GitHub: `git push origin main`
- [ ] **2.2** Verify Vercel auto-deploy triggered
- [ ] **2.3** Check build logs for errors
- [ ] **2.4** Wait for deployment to complete
- [ ] **2.5** Note deployment URL

---

## 🧪 FUNCTIONAL TESTING

### WEEK1.1: Auth Credentials

**Test Case 1.1: Login Flow**
- [ ] Navigate to production URL
- [ ] Click "Login"
- [ ] Enter valid credentials
- [ ] Submit login form
- [ ] ✅ **PASS:** Redirects to dashboard (no 401 errors)
- [ ] ❌ **FAIL:** Error message or stuck on login

**Test Case 1.2: Dashboard API Calls**
- [ ] Open browser DevTools → Network tab
- [ ] Navigate to dashboard
- [ ] Filter requests by `/api/`
- [ ] ✅ **PASS:** All API calls return 200 status
- [ ] ✅ **PASS:** Request headers include `credentials: include`
- [ ] ❌ **FAIL:** Any 401 Unauthorized responses

**Test Case 1.3: Characters Page**
- [ ] Navigate to `/characters`
- [ ] Check Network tab for API calls
- [ ] ✅ **PASS:** Characters list loads (or shows "Create first character")
- [ ] ✅ **PASS:** No 401 errors in console
- [ ] ❌ **FAIL:** Error message or infinite loading

**Test Case 1.4: Tables Browser**
- [ ] Navigate to `/tables/browse`
- [ ] Check Network tab for API calls
- [ ] ✅ **PASS:** Tables grid loads (or shows "No tables found")
- [ ] ✅ **PASS:** Filters render correctly
- [ ] ❌ **FAIL:** 401 error or blank page

**Test Case 1.5: Table Detail Page**
- [ ] Create or join a table
- [ ] Navigate to table detail page
- [ ] ✅ **PASS:** Table name, members, messages all load
- [ ] ✅ **PASS:** Chat input is enabled
- [ ] ❌ **FAIL:** Missing data or error messages

**Acceptance Criteria Coverage:**
- [x] AC1: All fetch requests include `credentials: 'include'`
- [x] AC2: Auth middleware validates sessions
- [x] AC3: Protected routes authenticate successfully
- [x] AC6: Session cookies sent cross-origin
- [x] AC7: No regression in login/logout

---

### WEEK1.2: WebSocket Connection

**Test Case 2.1: Socket.io Connection**
- [ ] Open browser DevTools → Network tab → WS filter
- [ ] Navigate to any table detail page
- [ ] ✅ **PASS:** WebSocket connection established (ws://... or wss://...)
- [ ] ✅ **PASS:** Socket.io handshake successful (101 status)
- [ ] ❌ **FAIL:** No WebSocket connection or connection failed

**Test Case 2.2: Real-Time Messages**
- [ ] Open same table in two browser windows (Window A, Window B)
- [ ] In Window A: Type and send a message
- [ ] In Window B: Watch chat area
- [ ] ✅ **PASS:** Message appears instantly in Window B (< 1 second)
- [ ] ❌ **FAIL:** Message requires page refresh to appear

**Test Case 2.3: Typing Indicators**
- [ ] Open same table in two windows
- [ ] In Window A: Start typing in chat input
- [ ] In Window B: Watch for typing indicator
- [ ] ✅ **PASS:** "User is typing..." appears in Window B
- [ ] ✅ **PASS:** Indicator disappears when typing stops
- [ ] ❌ **FAIL:** No typing indicator shown

**Test Case 2.4: Combat Updates**
- [ ] Open table in two windows
- [ ] In Window A (as DM): Start combat
- [ ] In Window B: Watch combat tracker
- [ ] ✅ **PASS:** Combat tracker appears instantly in Window B
- [ ] In Window A: Advance turn
- [ ] ✅ **PASS:** Turn updates in Window B immediately
- [ ] ❌ **FAIL:** Updates require manual refresh

**Acceptance Criteria Coverage:**
- [x] AC1: SocketContext provider wraps app
- [x] AC2: Socket connects to backend
- [x] AC3: Real-time messages work
- [x] AC5: Connection persists across navigation
- [x] AC8: No memory leaks (check DevTools Memory tab)

---

### WEEK1.3: Dashboard Real Data

**Test Case 3.1: Character Count**
- [ ] Navigate to dashboard
- [ ] Check "Characters" stat card
- [ ] ✅ **PASS:** Shows correct count (not "0" unless user has 0 characters)
- [ ] Create a new character
- [ ] Navigate back to dashboard
- [ ] ✅ **PASS:** Count increments by 1
- [ ] ❌ **FAIL:** Still shows "0" or wrong count

**Test Case 3.2: Active Tables Count**
- [ ] Navigate to dashboard
- [ ] Check "Active Tables" stat card
- [ ] ✅ **PASS:** Shows count of tables where user is member/owner with state='active'
- [ ] Join or create an active table
- [ ] Refresh dashboard
- [ ] ✅ **PASS:** Count increments correctly
- [ ] ❌ **FAIL:** Shows "0" or incorrect count

**Test Case 3.3: Campaigns Count**
- [ ] Navigate to dashboard
- [ ] Check "Campaigns" stat card
- [ ] ✅ **PASS:** Shows total tables count (all states)
- [ ] ❌ **FAIL:** Shows "0" or hardcoded value

**Test Case 3.4: Loading States**
- [ ] Open DevTools → Network tab → Throttling → Slow 3G
- [ ] Navigate to dashboard
- [ ] ✅ **PASS:** Shows loading spinner while fetching
- [ ] ✅ **PASS:** Loading spinner disappears after data loads
- [ ] ❌ **FAIL:** No loading indicator or permanent loading

**Test Case 3.5: Error Handling**
- [ ] Stop backend API server (or block requests in DevTools)
- [ ] Navigate to dashboard
- [ ] ✅ **PASS:** Error message displayed
- [ ] ✅ **PASS:** "Retry" button appears
- [ ] Click "Retry"
- [ ] ✅ **PASS:** Fetches data again
- [ ] ❌ **FAIL:** App crashes or no error handling

**Acceptance Criteria Coverage:**
- [x] AC1: Displays actual character count
- [x] AC2: Shows count of active tables
- [x] AC3: Displays ongoing campaigns count
- [x] AC6: Loading states shown
- [x] AC8: Error states handled gracefully

---

### WEEK1.4: Missing Database Tables

**Test Case 4.1: Tables Exist**
- [ ] Open Supabase dashboard → Table Editor
- [ ] ✅ **PASS:** `ai_usage` table exists
- [ ] ✅ **PASS:** `async_turns` table exists
- [ ] ✅ **PASS:** `subscriptions` table exists
- [ ] ✅ **PASS:** `campaign_logs` table exists
- [ ] ❌ **FAIL:** Any table missing

**Test Case 4.2: Schema Validation**
```sql
-- Run in Supabase SQL Editor
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ai_usage';
```
- [ ] ✅ **PASS:** All columns match migration schema
- [ ] ✅ **PASS:** Foreign keys to users/tables exist
- [ ] ❌ **FAIL:** Missing columns or wrong types

**Test Case 4.3: RLS Policies**
```sql
-- Check RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('ai_usage', 'async_turns', 'subscriptions', 'campaign_logs');
```
- [ ] ✅ **PASS:** All 4 tables have `rowsecurity = true`
- [ ] ❌ **FAIL:** RLS not enabled on any table

**Test Case 4.4: AI Usage Insert (Manual)**
- [ ] Navigate to table detail page
- [ ] Open AI Assistant tab (if DM)
- [ ] Generate AI response
- [ ] Check Supabase → `ai_usage` table
- [ ] ✅ **PASS:** New row inserted with prompt/response/tokens/cost
- [ ] ❌ **FAIL:** No insert or error in backend logs

**Test Case 4.5: Indexes Created**
```sql
-- Check indexes exist
SELECT indexname FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('ai_usage', 'async_turns', 'subscriptions', 'campaign_logs');
```
- [ ] ✅ **PASS:** All expected indexes created (6+ indexes total)
- [ ] ❌ **FAIL:** Missing indexes

**Acceptance Criteria Coverage:**
- [x] AC1-4: All 4 tables created with correct schema
- [x] AC5: Foreign key constraints working
- [x] AC6: RLS policies configured
- [x] AC7: Indexes created
- [x] AC8: Migration idempotent (can re-run safely)

---

### WEEK1.5: Table Browser Real API

**Test Case 5.1: Tables Display**
- [ ] Navigate to `/tables/browse`
- [ ] ✅ **PASS:** Table cards render in grid layout
- [ ] ✅ **PASS:** Each card shows: name, owner, member count, tags
- [ ] ✅ **PASS:** Empty state shown if no tables (not loading forever)
- [ ] ❌ **FAIL:** Blank page or mock data

**Test Case 5.2: Search Filter**
- [ ] Navigate to table browser
- [ ] Type "dragon" in search box
- [ ] Wait 300ms (debounce)
- [ ] Check Network tab → API call includes `?search=dragon`
- [ ] ✅ **PASS:** Only tables matching "dragon" shown
- [ ] Clear search
- [ ] ✅ **PASS:** All tables shown again
- [ ] ❌ **FAIL:** Filter doesn't work

**Test Case 5.3: Play Style Filter**
- [ ] Check "Async" checkbox
- [ ] Check Network tab → API call includes `?playStyles=async`
- [ ] ✅ **PASS:** Only async tables shown
- [ ] Check "Sync" checkbox also
- [ ] ✅ **PASS:** Both async and sync tables shown
- [ ] Uncheck all
- [ ] ✅ **PASS:** All tables shown
- [ ] ❌ **FAIL:** Filter broken

**Test Case 5.4: Pagination**
- [ ] Create 15+ tables (or use seed data)
- [ ] Navigate to table browser
- [ ] ✅ **PASS:** Shows "Page 1 of 2" (or similar)
- [ ] Click "Next →"
- [ ] ✅ **PASS:** Shows next 12 tables
- [ ] ✅ **PASS:** "Previous" button enabled
- [ ] ❌ **FAIL:** All tables on one page or pagination broken

**Test Case 5.5: Clear Filters**
- [ ] Apply multiple filters (search + play style)
- [ ] Click "Clear Filters (2)"
- [ ] ✅ **PASS:** All filters reset
- [ ] ✅ **PASS:** All tables shown
- [ ] ✅ **PASS:** Page resets to 1
- [ ] ❌ **FAIL:** Filters not cleared

**Test Case 5.6: Table Card Click**
- [ ] Click any table card
- [ ] ✅ **PASS:** Navigates to `/tables/[id]`
- [ ] ✅ **PASS:** Table detail page loads
- [ ] ❌ **FAIL:** Navigation broken

**Acceptance Criteria Coverage:**
- [x] AC1: Fetches tables from `/api/tables`
- [x] AC2: Filters send correct query params
- [x] AC3: Pagination works
- [x] AC7: Table cards display real data
- [x] AC8: Loading state shown
- [x] AC9: Empty state handled

---

## 🔬 CRITICAL AUTOMATED TESTS

### Test File 1: Auth Credentials Test
**Location:** `/apps/web/__tests__/auth/credentials.test.tsx`

```typescript
import { render, waitFor } from '@testing-library/react';
import { DashboardContent } from '@/components/dashboard-content';

describe('Auth Credentials', () => {
  it('includes credentials in API fetch calls', async () => {
    const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], characters: [] }),
    } as Response);

    render(<DashboardContent />);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/characters'),
        expect.objectContaining({ credentials: 'include' })
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/api/tables'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });
});
```

**Status:**
- [ ] Test created
- [ ] Test passes
- [ ] CI integration configured

---

### Test File 2: Dashboard Data Test
**Location:** `/apps/web/__tests__/dashboard/real-data.test.tsx`

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { DashboardContent } from '@/components/dashboard-content';

describe('Dashboard Real Data', () => {
  it('displays actual character and table counts', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: '1' }, { id: '2' }], // 2 characters
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          tables: [
            { id: '1', state: 'active' },
            { id: '2', state: 'paused' },
            { id: '3', state: 'active' },
          ],
        }),
      } as Response);

    render(<DashboardContent />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // character count
      expect(screen.getByText('2')).toBeInTheDocument(); // active tables (2 active)
      expect(screen.getByText('3')).toBeInTheDocument(); // total tables
    });
  });
});
```

**Status:**
- [ ] Test created
- [ ] Test passes
- [ ] CI integration configured

---

### Test File 3: Table Browser API Test
**Location:** `/apps/web/__tests__/tables/browser-api.test.tsx`

```typescript
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { TableBrowserClient } from '@/app/tables/browse/table-browser-client';

describe('Table Browser API', () => {
  it('fetches and displays tables from API', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        tables: [{ id: '1', name: 'Dragon Quest', playStyle: 'async' }],
        pagination: { page: 1, totalPages: 1 },
      }),
    } as Response);

    render(<TableBrowserClient />);

    await waitFor(() => {
      expect(screen.getByText('Dragon Quest')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/tables?'),
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  it('applies filters to API query', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ tables: [], pagination: {} }),
    } as Response);

    render(<TableBrowserClient />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: 'dragon' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=dragon'),
        expect.anything()
      );
    }, { timeout: 500 });
  });
});
```

**Status:**
- [ ] Test created
- [ ] Test passes
- [ ] CI integration configured

---

## 📊 QA SUMMARY

### Test Results
- **Total Test Cases:** 26
- **Passed:** ___
- **Failed:** ___
- **Blocked:** ___
- **Not Tested:** ___

### Critical Issues Found
1. ___________________________________
2. ___________________________________
3. ___________________________________

### Non-Critical Issues
1. ___________________________________
2. ___________________________________

### Recommendations
- [ ] Ready for production deployment
- [ ] Needs fixes before deployment
- [ ] Needs additional testing

---

## ✅ FINAL SIGN-OFF

- [ ] All critical test cases passed
- [ ] Database migration executed successfully
- [ ] Code deployed to production
- [ ] Smoke tests passed on production URL
- [ ] No blocking issues found

**QA Completed By:** _________________
**Date:** _________________
**Approved for Production:** [ ] YES [ ] NO
