# Day 1 Investigation Report - Deployment Gaps

**Data:** 2025-10-06
**Agent:** @dev (James)
**Status:** ✅ **COMPLETO**
**Tempo:** ~2h

---

## Executive Summary

Investigação completa dos 3 deployment gaps identificados no Audit. **Todos os problemas têm root cause identificado e ações claras para Day 2.**

### Deployment Health Score
- **Antes:** 70% (Good)
- **Projeção Pós-Fix:** 95% (Excellent)

---

## Task 1.1: Vercel Deployment Error ✅

### Root Cause Identified

**Erro:** Last deploy (6h ago) failed with Error status, duration 4s

**Root Cause:**
```typescript
// apps/web/src/lib/auth.ts:7
import jwt from 'jsonwebtoken'; // ❌ PROBLEMA!
```

**Technical Details:**
- `jsonwebtoken` library uses Node.js APIs (`process.nextTick`)
- Vercel Edge Runtime does NOT support Node.js APIs
- Build error:
  ```
  A Node.js API is used (process.nextTick at line: 29)
  which is not supported in the Edge Runtime.
  Import trace: jsonwebtoken → ./src/lib/auth.ts
  ```

### Impact
- **Severity:** 🔴 High
- **User Impact:** None (previous deploy still serving traffic at https://iarpg-web.vercel.app)
- **Deployment:** Blocked - can't deploy new versions

### Solution (Day 2 Task 2.1)

**Option 1 (Recommended):** Replace `jsonwebtoken` with Edge-compatible lib
```bash
cd apps/web
pnpm remove jsonwebtoken
pnpm add jose
```

**Code changes:**
```typescript
// OLD (apps/web/src/lib/auth.ts)
import jwt from 'jsonwebtoken';
const token = jwt.sign(payload, secret);
const decoded = jwt.verify(token, secret);

// NEW (Edge-compatible)
import * as jose from 'jose';
const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
const token = await new jose.SignJWT(payload)
  .setProtectedHeader({ alg: 'HS256' })
  .sign(secret);
const { payload: decoded } = await jose.jwtVerify(token, secret);
```

**Option 2 (Alternative):** Move auth logic to API Route
- Change auth.ts to API Route (uses Node.js runtime)
- Requires more refactoring

**Estimated Time:** 2-3h (Option 1)

---

## Task 1.2: Supabase Schema Validation ✅

### Root Cause Identified

**App usa snake_case schema ✅ CORRETO**

**Evidência:**
```typescript
// packages/db/src/types.ts:9-50
export interface Database {
  public: {
    Tables: {
      users: { ... }      // ✅ snake_case
      characters: { ... } // ✅ snake_case
      tables: { ... }     // ✅ snake_case
    }
  }
}
```

### Schema Status

#### ✅ Snake_case (ATIVO - CORRETO)
```sql
-- RLS Status Query Results
users               → RLS: true  ✅ | 4 rows
characters          → RLS: true  ✅ | 0 rows
tables              → RLS: true  ✅ | 0 rows
table_members       → RLS: true  ✅ | 0 rows
messages            → RLS: true  ✅ | 0 rows
combat_encounters   → RLS: true  ✅ | 0 rows
```

#### ⚠️ CamelCase (LEGACY - ÓRFÃO)
```sql
-- Data Distribution Query Results
User       → RLS: false ❌ | 3 rows (órfãos sem proteção!)
Character  → RLS: false ❌ | 2 rows (órfãos sem proteção!)
Table      → RLS: false ❌ | 0 rows
```

### Impact
- **Severity:** 🟡 Medium
- **Security Risk:** 3 users + 2 characters **expostos sem RLS** (mas não usados pelo app)
- **Data Loss Risk:** Low (só 5 rows legacy)

### Solution (Day 2 Task 2.2)

**Step 1:** Backup legacy data
```sql
-- Create migration backup
CREATE TABLE _migration_backup_users AS SELECT * FROM "User";
CREATE TABLE _migration_backup_characters AS SELECT * FROM "Character";
```

**Step 2:** Migrate data to snake_case schema
```sql
-- Migrate users (map camelCase → snake_case)
INSERT INTO users (id, username, email, created_at, updated_at)
SELECT id, username, email, "createdAt", "updatedAt"
FROM "User"
ON CONFLICT (id) DO NOTHING;

-- Migrate characters
INSERT INTO characters (id, user_id, name, race, class, created_at, updated_at)
SELECT id, "userId", name, race, class, "createdAt", "updatedAt"
FROM "Character"
ON CONFLICT (id) DO NOTHING;
```

**Step 3:** Drop legacy tables
```sql
DROP TABLE "User" CASCADE;
DROP TABLE "Character" CASCADE;
DROP TABLE "Table" CASCADE;
```

**Estimated Time:** 1-2h

---

## Task 1.3: Railway Config Conflicts ✅

### Root Cause Identified

**3 Railway configs coexistindo com valores conflitantes:**

#### 1. `apps/api/railway.json` ✅ ATIVO
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```
- **Modified:** Oct 6 10:25 (recent)
- **Status:** Used by Railway deployment
- **Evidence:** Railway vars show `RAILWAY_SERVICE_NAME: "iarpg"` matches this config

#### 2. `.railway/config.toml` ⚠️ LEGACY
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "pnpm --filter=api start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```
- **Modified:** Oct 3 14:18 (older)
- **Status:** NOT USED (builder mismatch: dockerfile vs NIXPACKS)
- **Risk:** Can cause confusion during troubleshooting

#### 3. `infrastructure/railway.yaml` 📄 DOCUMENTATION
```yaml
build:
  builder: NIXPACKS
  buildCommand: pnpm build
  startCommand: pnpm start  # ❌ Conflict: actual is "npm run start"

healthcheck:
  path: /health
  interval: 30
  # ... extra configs not in railway.json
```
- **Modified:** Oct 6 11:33 (most recent)
- **Status:** Documentation only (has features not in actual config)
- **Issue:** `startCommand` doesn't match reality

### Conflicts Matrix

| Config         | Builder    | Start Command              | Status      |
|----------------|------------|----------------------------|-------------|
| railway.json   | NIXPACKS   | `npm run start`           | ✅ ATIVO    |
| config.toml    | Dockerfile | `pnpm --filter=api start` | ❌ LEGACY   |
| railway.yaml   | NIXPACKS   | `pnpm start`              | 📄 DOCS     |

### Impact
- **Severity:** 🟡 Medium
- **Deployment:** No impact (railway.json is correct)
- **Maintenance:** High confusion risk during troubleshooting

### Solution (Day 2 Task 2.3)

**Step 1:** Delete legacy config
```bash
git rm .railway/config.toml
git commit -m "chore: remove legacy Railway config (using railway.json)"
```

**Step 2:** Sync documentation with reality
```bash
# Update infrastructure/railway.yaml to match apps/api/railway.json
# OR migrate railway.json to use railway.yaml as source of truth
```

**Decision needed:**
- **Option A:** Keep `railway.json` minimal (current), update docs
- **Option B:** Expand `railway.json` with healthcheck/resources from yaml

**Recommended:** Option A (simpler, Railway auto-configures healthcheck)

**Estimated Time:** 1h

---

## Task 1.4: Summary & Action Plan

### Day 1 Achievements ✅
- [x] Root cause identified for Vercel error (jsonwebtoken Edge incompatibility)
- [x] Confirmed app uses correct schema (snake_case + RLS enabled)
- [x] Identified 5 orphan rows in legacy camelCase tables (security risk)
- [x] Mapped Railway config conflicts (3 files, 1 active)

### Day 2 Action Items

#### High Priority 🔴
**Task 2.1:** Fix Vercel deploy (2-3h)
- Replace `jsonwebtoken` → `jose` in `apps/web/src/lib/auth.ts`
- Test build locally
- Deploy to Vercel
- Verify deployment success

#### Medium Priority 🟡
**Task 2.2:** Migrate Supabase legacy data (1-2h)
- Backup legacy tables
- Migrate 3 users + 2 characters to snake_case
- Drop legacy camelCase tables
- Verify no data loss

**Task 2.3:** Consolidate Railway configs (1h)
- Delete `.railway/config.toml`
- Sync `infrastructure/railway.yaml` docs with `apps/api/railway.json`
- Update ADR 005 if needed

#### Low Priority 🟢
**Task 2.4:** Create automation scripts (1h)
- `scripts/sync-env.sh` - sync Vercel ↔ Railway env vars
- `scripts/validate-deploy.sh` - pre-deploy health check

### Day 3 Validation

**Task 3.1:** Test health checks (1h)
- Verify `/health` endpoints (Vercel + Railway)
- Test Supabase RLS policies
- Run E2E tests

**Task 3.2:** Update documentation (1-2h)
- Update DEPLOYMENT-AUDIT-REPORT.md with final sync score
- Document migration steps in ADR
- Update README deployment section

**Task 3.3:** Execute validation checklist (1h)
- Run full deployment validation
- Verify all services healthy
- Confirm 95% sync score achieved

---

## Risk Assessment

### Risks Identified

1. **Vercel Deploy Fix (High Risk)**
   - **Risk:** Breaking auth if `jose` migration has bugs
   - **Mitigation:** Test thoroughly in local + preview deploy first
   - **Rollback:** Revert commit, previous deploy still works

2. **Supabase Data Migration (Medium Risk)**
   - **Risk:** Data loss during migration
   - **Mitigation:** Backup tables first (`_migration_backup_*`)
   - **Rollback:** Restore from backup tables

3. **Railway Config Changes (Low Risk)**
   - **Risk:** Breaking active deployment
   - **Mitigation:** Only delete legacy file, don't touch active `railway.json`
   - **Rollback:** Git revert

### Estimated Total Time

- **Day 1:** 2h ✅ DONE
- **Day 2:** 6-8h
- **Day 3:** 2-4h
- **Total:** 10-14h

---

## Technical Debt Created

### Documentation Debt
- [ ] Update ADR 005 with Railway config decision
- [ ] Document `jose` migration in auth docs
- [ ] Add Supabase schema migration to changelog

### Testing Debt
- [ ] Add E2E test for auth with `jose` library
- [ ] Add migration verification tests
- [ ] Update CI/CD to catch Edge Runtime incompatibilities

---

## Appendix: Commands Used

### Vercel Investigation
```bash
cd apps/web
vercel ls
vercel inspect dpl_Du2Hkp4d7hDPg9VzwFdUff2Kzzq9
pnpm build  # Reproduced error locally
```

### Supabase Investigation
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'characters', 'tables', 'table_members', 'messages', 'combat_encounters')
ORDER BY tablename;

-- Check data distribution
SELECT 'users (snake)' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'User (camel)', COUNT(*) FROM "User"
UNION ALL SELECT 'characters (snake)', COUNT(*) FROM characters
UNION ALL SELECT 'Character (camel)', COUNT(*) FROM "Character";
```

### Railway Investigation
```bash
cd apps/api
railway status
railway vars
ls -la railway.json .railway/config.toml ../infrastructure/railway.yaml
```

---

**Status:** ✅ **INVESTIGATION COMPLETE**
**Next:** Execute Day 2 fixes (est. 6-8h)
**Goal:** Deployment Sync 70% → 95%
