-- Migration: Migrate Legacy CamelCase Data to snake_case Schema
-- Date: 2025-10-07
-- Purpose: Move orphaned data from camelCase tables (User, Character) to snake_case (users, characters)
-- Risk: Low (only 3 users + 2 characters affected)

-- =======================
-- STEP 1: Create Backup Tables
-- =======================

CREATE TABLE IF NOT EXISTS _migration_backup_users AS
SELECT * FROM "User";

CREATE TABLE IF NOT EXISTS _migration_backup_characters AS
SELECT * FROM "Character";

-- Verify backups created
SELECT
  (SELECT COUNT(*) FROM _migration_backup_users) as backup_users_count,
  (SELECT COUNT(*) FROM _migration_backup_characters) as backup_characters_count;

-- =======================
-- STEP 2: Migrate Users
-- =======================

-- Insert legacy users into snake_case table
-- Map camelCase columns → snake_case columns
INSERT INTO users (
  id,
  username,
  email,
  password_hash,
  avatar_url,
  bio,
  tier,
  stripe_customer_id,
  online_status,
  last_seen_at,
  created_at,
  updated_at
)
SELECT
  id,
  username,
  email,
  "passwordHash" as password_hash,  -- camelCase → snake_case
  "avatarUrl" as avatar_url,
  bio,
  COALESCE(tier, 'free') as tier,  -- Default to 'free' if NULL
  "stripeCustomerId" as stripe_customer_id,
  COALESCE("onlineStatus", 'offline') as online_status,
  "lastSeenAt" as last_seen_at,
  "createdAt" as created_at,
  "updatedAt" as updated_at
FROM "User"
ON CONFLICT (id) DO NOTHING;  -- Skip if already exists

-- Verify migration
SELECT
  'users (snake_case)' as table_name,
  COUNT(*) as row_count
FROM users
UNION ALL
SELECT
  'User (camelCase - legacy)' as table_name,
  COUNT(*) as row_count
FROM "User";

-- =======================
-- STEP 3: Migrate Characters
-- =======================

-- Insert legacy characters into snake_case table
INSERT INTO characters (
  id,
  user_id,
  name,
  race,
  class,
  level,
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  proficiency_bonus,
  hp,
  max_hp,
  temp_hp,
  ac,
  initiative,
  speed,
  proficiencies,
  spells,
  equipment,
  background,
  notes,
  avatar_url,
  created_at,
  updated_at
)
SELECT
  id,
  "userId" as user_id,  -- camelCase → snake_case
  name,
  race,
  class,
  level,
  strength,
  dexterity,
  constitution,
  intelligence,
  wisdom,
  charisma,
  "proficiencyBonus" as proficiency_bonus,
  hp,
  "maxHp" as max_hp,
  COALESCE("tempHp", 0) as temp_hp,
  ac,
  initiative,
  speed,
  COALESCE(proficiencies, ARRAY[]::text[]) as proficiencies,
  COALESCE(spells, ARRAY[]::jsonb[]) as spells,
  COALESCE(equipment, ARRAY[]::jsonb[]) as equipment,
  background,
  notes,
  "avatarUrl" as avatar_url,
  "createdAt" as created_at,
  "updatedAt" as updated_at
FROM "Character"
ON CONFLICT (id) DO NOTHING;  -- Skip if already exists

-- Verify migration
SELECT
  'characters (snake_case)' as table_name,
  COUNT(*) as row_count
FROM characters
UNION ALL
SELECT
  'Character (camelCase - legacy)' as table_name,
  COUNT(*) as row_count
FROM "Character";

-- =======================
-- STEP 4: Verify Data Integrity
-- =======================

-- Check for orphaned user_ids in characters table
SELECT
  c.id,
  c.name,
  c.user_id,
  CASE
    WHEN u.id IS NULL THEN 'ORPHANED - User not found'
    ELSE 'OK'
  END as status
FROM characters c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- =======================
-- STEP 5: Drop Legacy Tables (COMMENTED OUT - RUN MANUALLY AFTER VERIFICATION)
-- =======================

-- DANGER ZONE! Only run after verifying migration success
-- Uncomment these lines manually after confirming data integrity

-- DROP TABLE IF EXISTS "User" CASCADE;
-- DROP TABLE IF EXISTS "Character" CASCADE;
-- DROP TABLE IF EXISTS "Table" CASCADE;

-- =======================
-- STEP 6: Clean Up Backup Tables (OPTIONAL - RUN AFTER 7 DAYS)
-- =======================

-- DROP TABLE IF EXISTS _migration_backup_users;
-- DROP TABLE IF EXISTS _migration_backup_characters;

-- =======================
-- Migration Complete!
-- =======================

-- Final verification query
SELECT
  'Migration Summary' as status,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM characters) as total_characters,
  (SELECT COUNT(*) FROM _migration_backup_users) as backup_users,
  (SELECT COUNT(*) FROM _migration_backup_characters) as backup_characters;
