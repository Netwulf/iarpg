# 🚀 SPRINT WEEK 1 - CRITICAL FIXES BACKLOG

**Sprint Goal:** Fix critical blockers preventing MVP functionality - auth, real-time, and data display

**Duration:** 1 week (5 working days)
**Start Date:** 2025-10-04
**Team:** Dev Agent (full stack)
**Mode:** YOLO (auto-approve, fast execution)

---

## 📊 SPRINT OVERVIEW

### Success Metrics
- [ ] Users can log in and see their real data on dashboard
- [ ] Table browser shows available tables to join
- [ ] Real-time messages work in table chat
- [ ] AI usage tracking persists to database
- [ ] All P0 items from GAP-ANALYSIS.md completed

### Dependencies
Stories MUST be completed in order (1 → 2 → 3 → 4 → 5):
1. **WEEK1.1** - Auth fixes (required for all other stories)
2. **WEEK1.2** - WebSocket (depends on auth working)
3. **WEEK1.3** - Dashboard (depends on auth working)
4. **WEEK1.4** - Database tables (independent, can run parallel)
5. **WEEK1.5** - Table browser (depends on auth working)

---

## 📋 STORY BACKLOG (Priority Order)

### 🔴 WEEK1.1: Fix Auth Credentials ⚡ HIGHEST PRIORITY
**Status:** Ready for Dev
**File:** `/docs/stories/WEEK1.1.fix-auth-credentials.md`
**Estimate:** 2-3 hours

**What:** Add `credentials: 'include'` to all frontend API fetch calls
**Why:** Backend returns 401 on all requests, breaking entire app
**Impact:** BLOCKS all other features - must be done first

**Files to Change:**
- `/apps/web/src/components/dashboard-content.tsx`
- `/apps/web/src/app/characters/page.tsx` (verify pattern)
- `/apps/web/src/app/tables/browse/table-browser-client.tsx`
- `/apps/web/src/app/tables/[id]/table-page-client.tsx` (multiple fetch calls)

**Acceptance:**
- ✅ Dashboard loads without 401 errors
- ✅ Characters page shows real data
- ✅ Tables page shows real data
- ✅ Login → Dashboard flow works end-to-end

---

### 🟡 WEEK1.2: Connect WebSocket
**Status:** Ready for Dev (depends on WEEK1.1)
**File:** `/docs/stories/WEEK1.2.connect-websocket.md`
**Estimate:** 2 hours

**What:** Wrap app with SocketContext provider to enable real-time features
**Why:** Socket.io backend ready but frontend not connected
**Impact:** Real-time messages, combat updates, typing indicators broken

**Files to Change:**
- `/apps/web/src/contexts/SocketContext.tsx` (verify exists and works)
- `/apps/web/src/app/layout.tsx` (add `<SocketProvider>` wrapper)

**Acceptance:**
- ✅ Socket.io connects to backend
- ✅ Messages appear instantly in table chat
- ✅ Typing indicators work
- ✅ Combat updates in real-time

---

### 🟡 WEEK1.3: Dashboard Real Data
**Status:** Ready for Dev (depends on WEEK1.1)
**File:** `/docs/stories/WEEK1.3.dashboard-real-data.md`
**Estimate:** 2 hours

**What:** Fetch real character/table counts instead of hardcoded "0"
**Why:** Dashboard shows "0" for everything, terrible UX
**Impact:** First impression after login is broken

**Files to Change:**
- `/apps/web/src/components/dashboard-content.tsx` (convert to client component, add useEffect)

**Acceptance:**
- ✅ Character count shows real number
- ✅ Active tables count shows real number
- ✅ Campaigns count shows real number
- ✅ Loading state while fetching
- ✅ Error handling with retry

---

### 🟢 WEEK1.4: Create Missing DB Tables
**Status:** Ready for Dev (independent, can run anytime)
**File:** `/docs/stories/WEEK1.4.create-missing-db-tables.md`
**Estimate:** 3 hours

**What:** Create 4 missing database tables via SQL migration
**Why:** AI tracking, async play, Stripe integration all broken without these
**Impact:** Critical features fail silently

**Files to Create:**
- `/packages/db/migrations/002_create_missing_tables.sql`
- Update `/packages/db/src/types.ts` (add TypeScript types)

**Tables to Create:**
1. `ai_usage` - Track AI requests and costs
2. `async_turns` - Persist async play mode turns
3. `subscriptions` - Stripe billing integration
4. `campaign_logs` - Session history

**Acceptance:**
- ✅ All 4 tables exist in Supabase
- ✅ Foreign keys work correctly
- ✅ RLS policies configured
- ✅ AI assistant saves usage to `ai_usage` table
- ✅ Migration is idempotent (can re-run safely)

---

### 🟢 WEEK1.5: Table Browser Real API
**Status:** Ready for Dev (depends on WEEK1.1)
**File:** `/docs/stories/WEEK1.5.table-browser-real-api.md`
**Estimate:** 2 hours

**What:** Connect table browser UI to backend API (currently shows mock empty data)
**Why:** Users can't discover or join tables
**Impact:** Core game discovery feature broken

**Files to Change:**
- `/apps/web/src/app/tables/browse/table-browser-client.tsx` (uncomment API call line 51-55)

**Acceptance:**
- ✅ Table browser shows real tables from database
- ✅ Search filter works
- ✅ Play style filters work
- ✅ Pagination works
- ✅ Clicking table navigates to detail page

---

## 📐 EXECUTION PLAN

### Day 1: Foundation (Auth + WebSocket)
**Morning:**
- [ ] Story WEEK1.1 - Fix Auth Credentials (2-3h)
- [ ] Test: Login → Dashboard → Characters → Tables all work

**Afternoon:**
- [ ] Story WEEK1.2 - Connect WebSocket (2h)
- [ ] Test: Real-time messages in table chat
- [ ] Commit & Deploy to Vercel

### Day 2: Data & Database
**Morning:**
- [ ] Story WEEK1.3 - Dashboard Real Data (2h)
- [ ] Test: Dashboard shows correct counts

**Afternoon:**
- [ ] Story WEEK1.4 - Create DB Tables (3h)
- [ ] Test: AI usage logs to `ai_usage` table
- [ ] Commit & Deploy

### Day 3: Discovery & Polish
**Morning:**
- [ ] Story WEEK1.5 - Table Browser API (2h)
- [ ] Test: Table discovery flow works

**Afternoon:**
- [ ] Integration testing (all stories together)
- [ ] Bug fixes from testing
- [ ] Commit & Deploy

### Day 4-5: Buffer & Documentation
- [ ] Handle any blockers or edge cases
- [ ] Update GAP-ANALYSIS.md with completed items
- [ ] Prepare for Week 2 stories (Stripe, Profile, Analytics)

---

## 🎯 DEFINITION OF DONE (Sprint)

### Functional
- [x] Users can log in and access all features without 401 errors
- [x] Dashboard displays real character/table/campaign counts
- [x] Table browser shows available tables with working filters
- [x] Real-time messaging works in table chat
- [x] AI usage tracking persists to database

### Technical
- [x] All 5 stories completed and tested
- [x] No console errors on any page
- [x] All auth flows work (login, logout, OAuth)
- [x] Database migrations run successfully
- [x] Code committed and deployed to production

### Quality
- [x] Manual testing completed for all flows
- [x] No regressions in existing functionality
- [x] Loading/error states work correctly
- [x] GAP-ANALYSIS.md updated with progress

---

## 🚨 RISKS & MITIGATIONS

### Risk 1: Auth fix breaks OAuth (Google/Discord)
**Mitigation:** Test OAuth flows immediately after WEEK1.1 complete
**Rollback:** Revert auth changes if OAuth breaks

### Risk 2: WebSocket connection fails in production
**Mitigation:** Test in both dev and production environments
**Fallback:** App still works without real-time (polling fallback)

### Risk 3: Database migration fails
**Mitigation:** Test migration on local/staging DB first
**Rollback:** Have DOWN migration ready (`002_down.sql`)

### Risk 4: Table browser API returns unexpected format
**Mitigation:** Verify backend response structure before frontend changes
**Rollback:** Re-comment API call, revert to mock data

---

## 📚 REFERENCE DOCUMENTS

- **GAP-ANALYSIS.md** - Complete gap analysis with P0 items
- **PRD.md** - Product requirements (database schema lines 961-1502)
- **Story Files:**
  - `/docs/stories/WEEK1.1.fix-auth-credentials.md`
  - `/docs/stories/WEEK1.2.connect-websocket.md`
  - `/docs/stories/WEEK1.3.dashboard-real-data.md`
  - `/docs/stories/WEEK1.4.create-missing-db-tables.md`
  - `/docs/stories/WEEK1.5.table-browser-real-api.md`

---

## 🎬 GETTING STARTED (Dev Agent Instructions)

**Step 1:** Read `/docs/stories/WEEK1.1.fix-auth-credentials.md` in full
**Step 2:** Execute all tasks in order (check them off as you go)
**Step 3:** Test acceptance criteria before moving to next story
**Step 4:** Commit with message: `feat(WEEK1.1): fix auth credentials - add credentials include`
**Step 5:** Move to WEEK1.2 and repeat

**YOLO Mode Active:** No approval needed, execute all stories automatically

---

## ✅ STORY COMPLETION CHECKLIST

- [x] **WEEK1.1** - Auth Credentials ✅ COMPLETE
- [x] **WEEK1.2** - WebSocket Connection ✅ COMPLETE (already done)
- [x] **WEEK1.3** - Dashboard Data ✅ COMPLETE (done in WEEK1.1)
- [x] **WEEK1.4** - Database Tables ✅ COMPLETE
- [x] **WEEK1.5** - Table Browser API ✅ COMPLETE (done in WEEK1.1)

---

**Sprint Owner:** PO (Sarah)
**Executed By:** Dev Agent (auto-mode)
**Mode:** YOLO (fast-track, auto-approve)
**Success Criteria:** All P0 items from GAP-ANALYSIS complete, app fully functional
