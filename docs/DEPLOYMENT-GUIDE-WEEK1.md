# 🚀 DEPLOYMENT GUIDE - SPRINT WEEK 1

**Sprint:** Week 1 - Critical Fixes
**Date:** 2025-10-04
**Stories:** WEEK1.1, WEEK1.2, WEEK1.3, WEEK1.4, WEEK1.5

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [x] All code committed to git
- [x] All stories marked as "Complete"
- [x] QA checklist created
- [ ] Automated tests passing
- [ ] Database migration ready
- [ ] Environment variables verified

---

## 🗄️ STEP 1: RUN DATABASE MIGRATION (CRITICAL)

### Option A: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `iarpg-deploy`

2. **Go to SQL Editor**
   - Sidebar → "SQL Editor"
   - Click "+ New query"

3. **Copy Migration SQL**
   ```bash
   # Copy the entire file content
   cat packages/db/supabase/migrations/20250104000000_create_missing_tables.sql
   ```

4. **Execute Migration**
   - Paste SQL into editor
   - Click "Run" or press Cmd+Enter
   - Wait for success message

5. **Verify Tables Created**
   ```sql
   -- Run this to verify
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('ai_usage', 'async_turns', 'subscriptions', 'campaign_logs');

   -- Should return 4 rows
   ```

6. **Check RLS Policies**
   ```sql
   -- Verify RLS enabled
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename IN ('ai_usage', 'async_turns', 'subscriptions', 'campaign_logs');

   -- All should have rowsecurity = true
   ```

### Option B: Via Supabase CLI (Advanced)

```bash
# Install Supabase CLI if not installed
brew install supabase/tap/supabase

# Login
supabase login

# Link to project
cd /Users/taypuri/iarpg-deploy
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push

# Verify
supabase db diff
```

### ⚠️ IMPORTANT NOTES

- **DO NOT skip this step** - Without these tables, Week 2 features will break
- **Migration is idempotent** - Safe to run multiple times
- **Backup recommended** - Take snapshot before running (Supabase Dashboard → Database → Backups)

---

## 🧪 STEP 2: RUN AUTOMATED TESTS

### 2.1: Install Test Dependencies

```bash
cd apps/web

# Install testing libraries if not present
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### 2.2: Configure Jest

Create `apps/web/jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
};

module.exports = createJestConfig(customJestConfig);
```

Create `apps/web/jest.setup.js`:

```javascript
import '@testing-library/jest-dom';
```

### 2.3: Run Tests

```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test auth/credentials.test.tsx
pnpm test dashboard/real-data.test.tsx
pnpm test tables/browser-api.test.tsx

# Run with coverage
pnpm test --coverage
```

### Expected Results

```
PASS  __tests__/auth/credentials.test.tsx
  ✓ includes credentials in character API fetch
  ✓ includes credentials in tables API fetch
  ✓ makes parallel API calls with credentials
  ✓ handles 401 errors gracefully

PASS  __tests__/dashboard/real-data.test.tsx
  ✓ displays actual character and table counts
  ✓ shows loading state initially
  ✓ handles zero characters gracefully
  ✓ displays error message on fetch failure
  ✓ retries fetch on error when retry button clicked
  ✓ calculates active tables correctly

PASS  __tests__/tables/browser-api.test.tsx
  ✓ fetches and displays tables from API on mount
  ✓ includes search filter in API query
  ✓ includes play style filters in API query
  ✓ handles multiple play style filters
  ✓ displays pagination controls
  ✓ navigates to next page on pagination click
  ✓ clears all filters when clear button clicked
  ✓ shows empty state when no tables found
  ✓ shows loading state initially
  ✓ handles fetch errors gracefully
  ✓ resets to page 1 when filters change

Test Suites: 3 passed, 3 total
Tests:       21 passed, 21 total
```

---

## 📦 STEP 3: DEPLOY TO PRODUCTION

### 3.1: Push Code to GitHub

```bash
cd /Users/taypuri/iarpg-deploy

# Verify status
git status

# Should show: "Your branch is ahead of 'origin/main' by 3 commits"

# Push to remote
git push origin main

# Verify push succeeded
git log --oneline -3
```

### 3.2: Verify Vercel Auto-Deploy

1. **Check Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Find project: `iarpg-web`
   - Should see deployment in progress

2. **Monitor Build Logs**
   - Click on deployment
   - Watch build progress
   - Check for errors

3. **Wait for Deployment**
   - Typical time: 2-5 minutes
   - Status should change to "Ready"

4. **Note Deployment URL**
   ```
   Production: https://iarpg-web.vercel.app
   Preview: https://iarpg-web-git-main-[your-team].vercel.app
   ```

### 3.3: Verify Environment Variables

Ensure these are set in Vercel:

```bash
# Frontend (Vercel → iarpg-web → Settings → Environment Variables)
NEXT_PUBLIC_API_URL=https://iarpg-api.railway.app
NEXTAUTH_URL=https://iarpg-web.vercel.app
NEXTAUTH_SECRET=[your-secret]
NEXT_PUBLIC_SUPABASE_URL=[your-supabase-url]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]

# Backend (Railway → iarpg-api → Variables)
DATABASE_URL=[supabase-connection-string]
CORS_ORIGIN=https://iarpg-web.vercel.app
PORT=8080
```

---

## ✅ STEP 4: SMOKE TESTING

### 4.1: Basic Flow Test

```bash
# Open production URL
open https://iarpg-web.vercel.app
```

**Test Checklist:**
- [ ] Homepage loads without errors
- [ ] Can navigate to /login
- [ ] Can log in with valid credentials
- [ ] Redirects to /dashboard after login
- [ ] Dashboard shows real data (not all "0"s)
- [ ] Can navigate to /characters
- [ ] Can navigate to /tables/browse
- [ ] Table browser shows tables (or empty state)
- [ ] No console errors in DevTools

### 4.2: API Connectivity Test

Open DevTools → Network tab:

- [ ] All `/api/*` requests return 200 (not 401)
- [ ] Request headers include cookies
- [ ] Response times < 2 seconds
- [ ] No CORS errors

### 4.3: WebSocket Test

Open DevTools → Network → WS filter:

- [ ] Navigate to any table detail page
- [ ] WebSocket connection established
- [ ] Socket.io handshake successful (101 status)
- [ ] Connection stays open (no immediate disconnection)

### 4.4: Database Test

Check Supabase Dashboard → Table Editor:

- [ ] `ai_usage` table exists and is empty (or has test data)
- [ ] `async_turns` table exists
- [ ] `subscriptions` table exists
- [ ] `campaign_logs` table exists

---

## 📊 STEP 5: POST-DEPLOYMENT VALIDATION

### 5.1: Run Full QA Checklist

Execute all test cases in `/docs/QA-WEEK1-CHECKLIST.md`:

```bash
# Open checklist
open /Users/taypuri/iarpg-deploy/docs/QA-WEEK1-CHECKLIST.md
```

- [ ] Complete all WEEK1.1 test cases
- [ ] Complete all WEEK1.2 test cases
- [ ] Complete all WEEK1.3 test cases
- [ ] Complete all WEEK1.4 test cases
- [ ] Complete all WEEK1.5 test cases

### 5.2: Update Story QA Results

For each story, update the "QA Results" section:

```markdown
## QA Results

**QA Date:** 2025-10-04
**Environment:** Production (https://iarpg-web.vercel.app)
**Status:** ✅ PASSED

**Test Results:**
- Auth credentials: ✅ All API calls include credentials
- Dashboard data: ✅ Shows real counts
- Table browser: ✅ Fetches and displays tables
- WebSocket: ✅ Real-time features working
- Database: ✅ All tables created with RLS

**Issues Found:** None

**Signed Off By:** [Your Name]
```

### 5.3: Update Sprint Backlog

Edit `/docs/SPRINT-WEEK1-BACKLOG.md`:

```markdown
## 🎯 DEFINITION OF DONE (Sprint)

### Functional
- [x] Users can log in and access all features without 401 errors ✅ VERIFIED
- [x] Dashboard displays real character/table/campaign counts ✅ VERIFIED
- [x] Table browser shows available tables with working filters ✅ VERIFIED
- [x] Real-time messaging works in table chat ✅ VERIFIED
- [x] AI usage tracking persists to database ✅ VERIFIED

### Technical
- [x] All 5 stories completed and tested ✅ DONE
- [x] No console errors on any page ✅ VERIFIED
- [x] All auth flows work (login, logout, OAuth) ✅ VERIFIED
- [x] Database migrations run successfully ✅ EXECUTED
- [x] Code committed and deployed to production ✅ DEPLOYED

### Quality
- [x] Manual testing completed for all flows ✅ QA DONE
- [x] No regressions in existing functionality ✅ VERIFIED
- [x] Loading/error states work correctly ✅ VERIFIED
- [x] GAP-ANALYSIS.md updated with progress ✅ PENDING
```

---

## 🔄 ROLLBACK PLAN (If Issues Found)

### Critical Issues Found During Deployment

If you encounter blocking issues:

#### Option 1: Revert Code
```bash
# Revert to previous commit
git revert HEAD~3..HEAD

# Push revert
git push origin main

# Vercel will auto-deploy previous version
```

#### Option 2: Rollback Migration
```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS ai_usage CASCADE;
DROP TABLE IF EXISTS async_turns CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS campaign_logs CASCADE;
```

#### Option 3: Disable Features
- Remove SocketProvider from layout (disable WebSocket)
- Revert dashboard to hardcoded "0"s
- Re-comment table browser API call

---

## 📝 DEPLOYMENT CHECKLIST SUMMARY

### Pre-Deployment
- [x] Code committed and documented
- [ ] Database migration executed
- [ ] Automated tests passing
- [ ] Environment variables verified

### Deployment
- [ ] Code pushed to GitHub
- [ ] Vercel build successful
- [ ] Production URL accessible

### Validation
- [ ] Smoke tests passed
- [ ] Full QA checklist completed
- [ ] No critical issues found

### Sign-Off
- [ ] All stories QA results updated
- [ ] Sprint backlog marked complete
- [ ] GAP-ANALYSIS.md updated
- [ ] Ready for Week 2 planning

---

## 🎉 SUCCESS CRITERIA

Sprint Week 1 is successfully deployed when:

✅ All 5 stories pass QA
✅ Database migration executed without errors
✅ Production site loads without console errors
✅ Users can log in and see real data
✅ Real-time features working (WebSocket connected)
✅ No critical bugs found in smoke testing

---

## 📞 SUPPORT

**Issues?**
- Check Vercel logs: https://vercel.com/[your-team]/iarpg-web/deployments
- Check Railway logs: https://railway.app/project/[your-project]
- Check Supabase logs: https://supabase.com/dashboard/project/[your-project]/logs

**Rollback needed?**
- Follow "ROLLBACK PLAN" section above
- Document issues in GitHub Issues
- Notify team in Slack/Discord

---

**Deployment Guide Version:** 1.0
**Created:** 2025-10-04
**Author:** Sarah (PO)
