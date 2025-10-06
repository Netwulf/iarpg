# WEEK3.1 Bug Summary Report

**Project:** IA-RPG MVP
**Sprint:** WEEK3 - QA & Bug Fixes
**QA Date:** 2025-10-05
**QA Method:** Static Code Analysis
**QA Agent:** Claude (Dev Agent)

---

## Executive Summary

Completed comprehensive code analysis across all MVP features. Identified **16 bugs** affecting security, business logic, and user experience.

### Critical Findings

- **4 P0 bugs** that are production blockers (security vulnerabilities and missing features)
- **8 P1 bugs** that significantly impact user experience (calculation errors, validation gaps)
- **4 P2 bugs** that reduce polish (missing error handling)
- **0 P3 bugs**

### Key Insights

1. **Zero bugs caught by existing 96 automated tests** - tests rely too heavily on mocks
2. **Security gaps:** Hardcoded JWT secret fallback, missing authorization checks
3. **Incomplete features:** Dice rolls not persisted, table membership not verified
4. **Calculation errors:** HP and proficiency bonus don't scale with level

---

## Bugs by Severity

| Severity | Count | % of Total | Must Fix for MVP? |
|----------|-------|------------|-------------------|
| **P0 (Critical)** | 4 | 25% | ✅ YES |
| **P1 (High)** | 8 | 50% | ⚠️ Top 5 |
| **P2 (Medium)** | 4 | 25% | ❌ Nice to have |
| **P3 (Low)** | 0 | 0% | ❌ Backlog |
| **Total** | 16 | 100% | |

---

## Bugs by Feature Area

| Feature Area | P0 | P1 | P2 | P3 | Total |
|--------------|----|----|----|----|-------|
| **Dice Rolling** | 2 | 0 | 0 | 0 | 2 |
| **Authentication** | 2 | 0 | 0 | 0 | 2 |
| **Character Management** | 0 | 5 | 0 | 0 | 5 |
| **Table Management** | 0 | 3 | 0 | 0 | 3 |
| **Dashboard (Frontend)** | 0 | 0 | 3 | 0 | 3 |
| **Error Handling** | 0 | 0 | 1 | 0 | 1 |
| **Total** | 4 | 8 | 4 | 0 | 16 |

---

## P0 (Critical Blockers) - MUST FIX IMMEDIATELY

### Bug #1: Missing Table Membership Verification for Dice Rolls
- **File:** `apps/api/src/routes/dice.routes.ts:23-24`
- **Impact:** Any authenticated user can roll dice in any table (security breach)
- **Fix Effort:** 30 minutes
- **Test:** Add E2E test for unauthorized roll attempt

### Bug #2: Dice Rolls Not Persisted to Database
- **File:** `apps/api/src/routes/dice.routes.ts:65-66`
- **Impact:** Roll history lost on page refresh, no audit trail
- **Fix Effort:** 1-2 hours (requires database migration + API changes)
- **Test:** E2E test verifying roll persistence after page refresh

### Bug #3: Hardcoded JWT Secret Fallback
- **File:** `apps/api/src/middleware/auth.middleware.ts:36`
- **Impact:** CRITICAL SECURITY VULNERABILITY - all JWTs predictable if env var missing
- **Fix Effort:** 15 minutes
- **Test:** Unit test verifying app refuses to start without NEXTAUTH_SECRET

### Bug #4: Inconsistent Error Format in Auth Middleware
- **File:** `apps/api/src/middleware/auth.middleware.ts:28,42`
- **Impact:** Frontend error handling breaks for 401 errors
- **Fix Effort:** 15 minutes
- **Test:** Unit test verifying error format consistency

---

## P1 (High Priority) - Fix Top 5 for MVP

### Top 5 P1 Bugs Selected for WEEK3.2

#### Bug #5: HP Calculation Only Works for Level 1 Characters ⭐
- **File:** `apps/api/src/routes/characters.routes.ts:26-48`
- **Impact:** Level 5 character has 12 HP instead of 44 HP (game-breaking)
- **Fix Effort:** 1 hour
- **Test:** Unit test for level 1-20 HP calculation

#### Bug #6: Proficiency Bonus Doesn't Scale with Level ⭐
- **File:** `apps/api/src/routes/characters.routes.ts:49`
- **Impact:** Level 20 character has +2 proficiency instead of +6 (game-breaking)
- **Fix Effort:** 15 minutes
- **Test:** Unit test for proficiency bonus scaling

#### Bug #8: Ability Scores Not Validated for Range ⭐
- **File:** `apps/api/src/routes/characters.routes.ts:14-23`
- **Impact:** Users can create characters with STR 999 or negative stats
- **Fix Effort:** 30 minutes
- **Test:** Unit test rejecting invalid ability scores

#### Bug #9: Character PATCH Allows Unvalidated Field Updates ⭐
- **File:** `apps/api/src/routes/characters.routes.ts:178`
- **Impact:** Users can cheat by setting HP to 9999 via PATCH
- **Fix Effort:** 1 hour
- **Test:** Unit test verifying only allowed fields can be updated

#### Bug #10: Invite Code Generation Doesn't Check for Duplicates ⭐
- **File:** `apps/api/src/routes/tables.routes.ts:13-20`
- **Impact:** Potential database constraint violation on table creation
- **Fix Effort:** 45 minutes
- **Test:** Unit test verifying unique code generation

### Other P1 Bugs (Deferred to WEEK4 or Backlog)

#### Bug #7: Hit Dice Lookup Without Validation
- **Fix Effort:** 15 minutes
- **Defer Reason:** Low probability (className validated on frontend)

#### Bug #11: Table Member Count Doesn't Include Owner
- **Fix Effort:** 10 minutes
- **Defer Reason:** Edge case, max_players typically set higher than needed

#### Bug #12: Message Content Validation Order Incorrect
- **Fix Effort:** 10 minutes
- **Defer Reason:** Edge case, unlikely to be exploited

---

## P2 (Medium Priority) - Defer to WEEK3.3 or WEEK4

All P2 bugs deferred to WEEK3.3 (Error Handling & Edge Cases):

- Bug #13: 401 errors not redirecting to login
- Bug #14: Missing validation for tables data structure
- Bug #15: No retry logic for network failures
- Bug #16: Generic errors lack detail in development

---

## WEEK3.2 Scope Recommendation

### Must Fix (P0) - 4 bugs
1. ✅ Bug #1: Add table membership verification
2. ✅ Bug #2: Persist dice rolls to database
3. ✅ Bug #3: Remove JWT secret fallback
4. ✅ Bug #4: Fix auth error format

### Should Fix (P1) - Top 5 bugs
5. ✅ Bug #5: Fix HP calculation scaling
6. ✅ Bug #6: Fix proficiency bonus scaling
7. ✅ Bug #8: Validate ability score range
8. ✅ Bug #9: Validate PATCH allowed fields
9. ✅ Bug #10: Ensure unique invite codes

### Total WEEK3.2 Scope: 9 bugs (4 P0 + 5 P1)

**Estimated Effort:** ~8 hours
**Story Points:** 5 (matches WEEK3.2 estimate)

---

## Test Coverage Gaps Identified

### Why Didn't Tests Catch These Bugs?

1. **Over-reliance on Mocks (10 bugs)**
   - HP/proficiency calculation bugs not caught because tests mock database responses
   - Invite code collision not caught because tests don't check uniqueness
   - **Recommendation:** Add integration tests with real database

2. **Missing Security Tests (3 bugs)**
   - No tests verifying table membership before actions
   - No tests for environment variable validation
   - **Recommendation:** Add security-focused test suite

3. **Missing Error Scenario Tests (3 bugs)**
   - No tests for 401 redirect behavior
   - No tests for network retry logic
   - **Recommendation:** Add E2E tests for error scenarios

### Test Improvements for WEEK3.2

For each bug fix, add corresponding test:
- Bug #1: E2E test for unauthorized roll attempt → 403
- Bug #2: E2E test for roll persistence after refresh
- Bug #3: Unit test for app startup without NEXTAUTH_SECRET → error
- Bug #5: Unit test for HP at levels 1, 5, 10, 15, 20
- Bug #6: Unit test for proficiency at levels 1, 5, 9, 13, 17
- Bug #8: Unit test for ability scores 2, 3, 20, 21 → validation
- Bug #9: Unit test for PATCH with forbidden fields → 400
- Bug #10: Unit test for generateUniqueInviteCode retry logic

**New Tests to Add:** 9 tests (1 per bug fix)
**Total Test Count After WEEK3.2:** 96 + 9 = 105 tests

---

## Risk Assessment

### High Risk Bugs (Must Fix Before Production)

1. **Bug #3 (JWT Secret):** Catastrophic security risk
2. **Bug #1 (Table Membership):** Allows unauthorized access
3. **Bug #5 (HP Calc):** Makes game unplayable at higher levels
4. **Bug #9 (PATCH Validation):** Enables cheating

### Medium Risk Bugs (Should Fix for MVP Quality)

5. **Bug #2 (Roll Persistence):** Poor UX but not blocking
6. **Bug #6 (Proficiency):** Noticeable but not game-breaking
7. **Bug #8 (Ability Validation):** Can be exploited but unlikely
8. **Bug #10 (Invite Codes):** Very low probability collision

### Low Risk Bugs (Polish for Post-MVP)

9-16. All P2 bugs: Nice-to-have improvements

---

## Timeline and Next Steps

### ✅ WEEK3.1 - Complete (1 day actual, 3 days planned)
- Code analysis and bug documentation

### 📋 WEEK3.2 - Starting Now (3 days)
- Fix 4 P0 bugs (Day 1)
- Fix 5 P1 bugs (Day 2)
- Add tests and regression check (Day 3)

### 📅 WEEK3.3 - After WEEK3.2 (3 days)
- Implement error handling (P2 bugs)
- Add input validation (Zod)
- Add retry logic and WebSocket reconnection

### 🚀 WEEK4 - Production Prep
- Fix remaining P1/P2 bugs if time allows
- Performance optimization
- Production deployment

---

## Recommendations for Product Owner

### Immediate Actions Required

1. **Deploy Block:** Do NOT deploy to production until bugs #1, #3 resolved
2. **Scope Confirmation:** Approve WEEK3.2 scope (9 bugs = 5 story points)
3. **Timeline Adjustment:** WEEK3.1 completed faster than expected (1 day vs 3), use extra time for WEEK3.2

### Post-MVP Improvements

1. **Testing Strategy:** Shift from mocks to integration tests
2. **Security Audit:** Add automated security scanning
3. **Code Review:** Establish peer review process before merging

---

**Report Generated By:** Claude (Dev Agent)
**Report Date:** 2025-10-05
**Next Action:** Begin WEEK3.2 bug fixes (starting with P0 bugs)
