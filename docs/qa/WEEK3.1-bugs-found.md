# WEEK3.1 QA - Bugs Found (Code Analysis)

**QA Execution Date:** 2025-10-05
**QA Method:** Static Code Analysis
**Total Bugs Found:** 16

## Bug Summary by Severity

- **P0 (Critical Blockers):** 4 bugs
- **P1 (High Priority):** 8 bugs
- **P2 (Medium Priority):** 4 bugs
- **P3 (Low Priority):** 0 bugs

---

## P0 (Critical Blockers) - MUST FIX

### Bug #1: Missing Table Membership Verification for Dice Rolls
**File:** `apps/api/src/routes/dice.routes.ts:23-24`
**Severity:** P0
**Status:** Open

#### Description
Dice rolling endpoint does not verify that the user is a member of the table before allowing them to roll dice. This is a critical security issue that allows any authenticated user to roll dice in any table.

#### Steps to Reproduce
1. User A creates a private table (table-123)
2. User B (not a member) sends POST request to `/api/tables/table-123/roll`
3. Roll succeeds even though User B is not a member

#### Expected Behavior
Should return 403 Forbidden if user is not a member of the table.

#### Actual Behavior
Roll succeeds for any authenticated user, regardless of table membership.

#### Code Reference
```typescript
// TODO: Verify user is member of table
// For now, we'll skip this check
```

#### Proposed Fix
Add table membership verification before processing the roll:
```typescript
// Verify user is member of table
const { data: member } = await supabase
  .from('table_members')
  .select('id')
  .eq('table_id', tableId)
  .eq('user_id', userId)
  .single();

if (!member) {
  throw new AppError('You are not a member of this table', 403, 'FORBIDDEN');
}
```

---

### Bug #2: Dice Rolls Not Persisted to Database
**File:** `apps/api/src/routes/dice.routes.ts:65-66`
**Severity:** P0
**Status:** Open

#### Description
Dice rolls are broadcasted via WebSocket but never saved to the database. This means:
- No history of dice rolls
- Rolls lost on page refresh
- Cannot display roll history to players who join mid-session

#### Steps to Reproduce
1. Join a table
2. Roll dice (e.g., 1d20+5)
3. Refresh the page
4. Roll history is empty

#### Expected Behavior
Rolls should be saved to database and retrieved on page load.

#### Actual Behavior
Rolls only exist in memory and are lost on refresh.

#### Code Reference
```typescript
// TODO: Save to database
// For now, just return the roll
```

#### Proposed Fix
Create a `dice_rolls` table and save each roll:
```typescript
const { data: savedRoll, error } = await supabase
  .from('dice_rolls')
  .insert({
    table_id: tableId,
    user_id: userId,
    notation: roll.notation,
    rolls: roll.rolls,
    total: roll.total,
    type: roll.type,
    reason: reason || null,
  })
  .select()
  .single();
```

---

### Bug #3: Hardcoded JWT Secret Fallback
**File:** `apps/api/src/middleware/auth.middleware.ts:36`
**Severity:** P0
**Status:** Open

#### Description
Authentication middleware uses a hardcoded 'fallback-secret' if `NEXTAUTH_SECRET` environment variable is not set. This is a CRITICAL security vulnerability that makes all JWTs predictable in production if the environment variable is missing.

#### Steps to Reproduce
1. Deploy API without NEXTAUTH_SECRET env var
2. Generate JWT with 'fallback-secret' as signing key
3. Access any protected endpoint with forged JWT
4. Gain unauthorized access

#### Expected Behavior
Should throw an error and refuse to start if NEXTAUTH_SECRET is not configured.

#### Actual Behavior
Silently falls back to insecure hardcoded secret.

#### Code Reference
```typescript
const decoded = jwt.verify(
  token,
  process.env.NEXTAUTH_SECRET || 'fallback-secret' // DANGEROUS!
) as JWTPayload;
```

#### Proposed Fix
Fail fast on startup if secret is missing:
```typescript
const JWT_SECRET = process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET) {
  throw new Error('NEXTAUTH_SECRET environment variable is required');
}

// Later in auth middleware:
const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
```

---

### Bug #4: Inconsistent Error Format in Auth Middleware
**File:** `apps/api/src/middleware/auth.middleware.ts:28,42`
**Severity:** P0
**Status:** Open

#### Description
Auth middleware returns errors in a different format than the rest of the API. While other endpoints use AppError which formats errors as `{ error: { code, message, timestamp } }`, auth middleware returns `{ error: "string" }`.

This breaks error handling on the frontend which expects consistent error format.

#### Steps to Reproduce
1. Send request without Authorization header
2. Response: `{ error: 'Unauthorized - No token provided' }`
3. Compare to other API errors: `{ error: { code, message, timestamp } }`

#### Expected Behavior
All API errors should use consistent AppError format.

#### Actual Behavior
Auth errors use different format, breaking frontend error handling.

#### Code Reference
```typescript
// Inconsistent format:
return res.status(401).json({ error: 'Unauthorized - No token provided' });

// Should be:
throw new AppError('No token provided', 401, 'UNAUTHORIZED');
```

#### Proposed Fix
Replace direct JSON responses with AppError:
```typescript
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  throw new AppError('No token provided', 401, 'UNAUTHORIZED');
}

// In catch block:
catch (error) {
  throw new AppError('Invalid or expired token', 401, 'INVALID_TOKEN');
}
```

---

## P1 (High Priority) - Should Fix for MVP

### Bug #5: HP Calculation Only Works for Level 1 Characters
**File:** `apps/api/src/routes/characters.routes.ts:26-48`
**Severity:** P1
**Status:** Open

#### Description
Hit Points calculation always uses level 1 formula: `hitDie + constitutionModifier`. For higher levels, HP should accumulate with each level.

#### Expected Behavior
HP formula for level N character:
- Level 1: max hit die + CON modifier
- Levels 2-N: average of hit die + CON modifier per level
- Example: Level 5 Fighter (CON 14, +2 mod): 10 + 2 + (6+2)*4 = 44 HP

#### Actual Behavior
Level 5 Fighter gets 10 + 2 = 12 HP (same as Level 1)

#### Proposed Fix
```typescript
const level = req.body.level || 1;
let maxHP = hitDie + constitutionModifier; // Level 1

// Add HP for additional levels
for (let i = 2; i <= level; i++) {
  const averageRoll = Math.floor((hitDie / 2) + 1);
  maxHP += averageRoll + constitutionModifier;
}
```

---

### Bug #6: Proficiency Bonus Doesn't Scale with Level
**File:** `apps/api/src/routes/characters.routes.ts:49`
**Severity:** P1
**Status:** Open

#### Description
Proficiency bonus is hardcoded to 2, but it should scale with character level according to D&D 5e rules.

#### Expected Behavior
- Levels 1-4: +2
- Levels 5-8: +3
- Levels 9-12: +4
- Levels 13-16: +5
- Levels 17-20: +6

#### Actual Behavior
Always +2 regardless of level.

#### Proposed Fix
```typescript
const level = req.body.level || 1;
const proficiencyBonus = 2 + Math.floor((level - 1) / 4);
```

---

### Bug #7: Hit Dice Lookup Without Validation
**File:** `apps/api/src/routes/characters.routes.ts:45`
**Severity:** P1
**Status:** Open

#### Description
Hit dice lookup doesn't validate if className exists in the dictionary, leading to undefined being used as hit die value.

#### Expected Behavior
Should throw validation error for invalid class names.

#### Actual Behavior
Uses undefined, causing NaN in HP calculation.

#### Proposed Fix
```typescript
const hitDie = hitDice[className];
if (!hitDie) {
  throw new AppError(
    `Invalid class name: ${className}. Must be one of: ${Object.keys(hitDice).join(', ')}`,
    400,
    'VALIDATION_ERROR'
  );
}
```

---

### Bug #8: Ability Scores Not Validated for Range
**File:** `apps/api/src/routes/characters.routes.ts:14-23`
**Severity:** P1
**Status:** Open

#### Description
Ability scores validation only checks if object exists, not if values are within valid D&D 5e range (3-20).

#### Expected Behavior
Should reject ability scores below 3 or above 20.

#### Actual Behavior
Accepts any number, including negative numbers or values above 20.

#### Proposed Fix
```typescript
// After checking abilityScores exists:
const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
for (const ability of abilities) {
  const score = abilityScores[ability];
  if (typeof score !== 'number' || score < 3 || score > 20) {
    throw new AppError(
      `${ability} must be a number between 3 and 20`,
      400,
      'VALIDATION_ERROR'
    );
  }
}
```

---

### Bug #9: Character PATCH Allows Unvalidated Field Updates
**File:** `apps/api/src/routes/characters.routes.ts:178`
**Severity:** P1
**Status:** Open

#### Description
PATCH endpoint accepts `req.body` directly without validation, allowing users to update any field including derived stats (HP, AC) that should be calculated.

#### Expected Behavior
Should only allow updating specific editable fields and recalculate derived stats.

#### Actual Behavior
Users can set HP to 9999 or AC to 50 directly via PATCH.

#### Proposed Fix
```typescript
// Whitelist editable fields
const allowedUpdates = ['name', 'level', 'equipment', 'background', 'notes'];
const updates: any = {};

for (const key of allowedUpdates) {
  if (req.body[key] !== undefined) {
    updates[key] = req.body[key];
  }
}

// If level changed, recalculate derived stats
if (updates.level && updates.level !== character.level) {
  // Recalculate HP, proficiency bonus, etc.
}

const { data: updatedCharacter } = await supabase
  .from('characters')
  .update(updates) // Only allowed fields
  .eq('id', req.params.id)
  .select()
  .single();
```

---

### Bug #10: Invite Code Generation Doesn't Check for Duplicates
**File:** `apps/api/src/routes/tables.routes.ts:13-20`
**Severity:** P1
**Status:** Open

#### Description
generateInviteCode() creates random 6-character codes without checking if they already exist in the database, leading to potential collisions.

#### Expected Behavior
Should generate code and verify it's unique, retrying if collision occurs.

#### Actual Behavior
May generate duplicate codes, causing database constraint violations.

#### Proposed Fix
```typescript
async function generateUniqueInviteCode(): Promise<string> {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateInviteCode();

    // Check if code already exists
    const { data } = await supabase
      .from('tables')
      .select('id')
      .eq('invite_code', code)
      .single();

    if (!data) {
      return code; // Unique code found
    }
  }
  throw new AppError('Failed to generate unique invite code', 500, 'CODE_GENERATION_FAILED');
}
```

---

### Bug #11: Table Member Count Doesn't Include Owner
**File:** `apps/api/src/routes/tables.routes.ts:338-340`
**Severity:** P1
**Status:** Open

#### Description
When checking if table is full, code only counts `table_members` but table owner is not in table_members, allowing max_players + 1 people at the table.

#### Expected Behavior
If max_players is 4, should allow 4 total people (owner + 3 members).

#### Actual Behavior
Allows 5 people (1 owner + 4 members).

#### Proposed Fix
```typescript
const currentMemberCount = (table.members?.[0]?.count || 0) + 1; // +1 for owner
if (currentMemberCount >= table.max_players) {
  throw new AppError('Table is full', 400, 'TABLE_FULL');
}
```

---

### Bug #12: Message Content Validation Order Incorrect
**File:** `apps/api/src/routes/tables.routes.ts:426-432`
**Severity:** P1
**Status:** Open

#### Description
Code checks `content.length > 1000` before checking if content is empty after trim. This means whitespace-only 1001-character strings pass validation.

#### Expected Behavior
Should trim first, then check length.

#### Actual Behavior
Allows extremely long whitespace strings.

#### Proposed Fix
```typescript
const trimmedContent = content?.trim();

if (!trimmedContent) {
  throw new AppError('Message content is required', 400, 'VALIDATION_ERROR');
}

if (trimmedContent.length > 1000) {
  throw new AppError('Message too long (max 1000 characters)', 400, 'VALIDATION_ERROR');
}

// Use trimmedContent in insert
```

---

## P2 (Medium Priority) - Nice to Have

### Bug #13: 401 Errors Not Redirecting to Login
**File:** `apps/web/src/components/dashboard-content.tsx:44-45`
**Severity:** P2
**Status:** Open

#### Description
When fetchWithAuth returns 401 (unauthorized), error is shown but user is not automatically redirected to login page.

#### Expected Behavior
Should detect 401 and redirect to /login.

#### Actual Behavior
Shows generic error message without redirect.

#### Proposed Fix
```typescript
if (!charactersRes.ok || !tablesRes.ok) {
  if (charactersRes.status === 401 || tablesRes.status === 401) {
    router.push('/login');
    return;
  }
  throw new Error('Failed to fetch dashboard data');
}
```

---

### Bug #14: Missing Validation for Tables Data Structure
**File:** `apps/web/src/components/dashboard-content.tsx:52-55`
**Severity:** P2
**Status:** Open

#### Description
Code assumes `tablesData.tables` exists without validating structure, leading to potential runtime errors.

#### Expected Behavior
Should validate structure before accessing nested properties.

#### Actual Behavior
May throw "Cannot read property 'tables' of undefined" if API response changes.

#### Proposed Fix
```typescript
const tables = Array.isArray(tablesData?.tables) ? tablesData.tables : [];
const activeTables = tables.filter((t: any) => t.state === 'active').length;
```

---

### Bug #15: No Retry Logic for Network Failures
**File:** `apps/web/src/components/dashboard-content.tsx:40-42`
**Severity:** P2
**Status:** Open

#### Description
Dashboard fetches data without retry logic. If network request fails transiently, user must manually retry.

#### Expected Behavior
Should automatically retry on network failures with exponential backoff.

#### Actual Behavior
Shows error immediately, requiring manual retry.

#### Proposed Fix
Implement in WEEK3.3 with fetchWithRetry utility.

---

### Bug #16: Generic Errors Lack Detail in Development
**File:** `apps/api/src/middleware/error.middleware.ts:40-47`
**Severity:** P2
**Status:** Open

#### Description
Unknown errors return generic "An unexpected error occurred" even in development mode, making debugging difficult.

#### Expected Behavior
In development, should include error stack trace and details.

#### Actual Behavior
Same generic message in dev and production.

#### Proposed Fix
```typescript
// Unknown error
const isDev = process.env.NODE_ENV === 'development';
return res.status(500).json({
  error: {
    code: 'INTERNAL_ERROR',
    message: isDev ? error.message : 'An unexpected error occurred',
    stack: isDev ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  },
});
```

---

## Test Coverage Impact

**Bugs Found by Automated Tests:** 0 / 16
**Bugs Found by Code Analysis:** 16 / 16

### Why Weren't These Caught by Tests?

1. **Business Logic Bugs (5-12):** Tests used mocks instead of real business logic
2. **Security Bugs (1, 3, 4):** Tests didn't verify authorization or environment config
3. **Data Persistence Bugs (2):** Tests didn't check database persistence
4. **Integration Bugs (13-15):** E2E tests didn't cover error scenarios

### Recommendations

1. Add integration tests with real database (not mocks)
2. Add security-focused tests (authorization, environment validation)
3. Add error scenario tests (network failures, invalid inputs)
4. Add E2E tests for 401 redirects and retry logic

---

**QA Completed By:** Claude (Dev Agent)
**Next Steps:** Proceed to WEEK3.2 to fix all P0 and top 5 P1 bugs
