/**
 * Migration script using Supabase Admin Client (Story 7.1)
 * Run with: npx tsx src/scripts/migrate-async-supabase.ts
 */
import '../env-loader';
import { createSupabaseAdmin } from '@iarpg/db';

async function main() {
  console.log('🔄 Starting migration: Add Async Turn model...\n');

  const supabase = createSupabaseAdmin();

  try {
    // Step 1: Add async mode fields to Table
    console.log('📝 Step 1/7: Adding async mode fields to Table...');
    const { error: tableError } = await supabase.rpc('exec_sql');

    if (tableError || true) {
      // If rpc doesn't exist, try direct SQL via Supabase SQL Editor
      console.log('ℹ️  RPC method not available, please run SQL manually in Supabase Dashboard');
      console.log('\nSQL to execute:\n');
      console.log(`
-- Step 1: Add async mode fields to Table
ALTER TABLE "Table"
ADD COLUMN IF NOT EXISTS "turnDeadlineHours" INTEGER,
ADD COLUMN IF NOT EXISTS "currentTurnIndex" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "turnOrder" JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Step 2: Create AsyncTurn table
CREATE TABLE IF NOT EXISTS "AsyncTurn" (
  "id" TEXT NOT NULL,
  "tableId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP(3),
  "deadline" TIMESTAMP(3) NOT NULL,
  "skipped" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "AsyncTurn_pkey" PRIMARY KEY ("id")
);

-- Step 3: Add asyncTurnId to Message table
ALTER TABLE "Message"
ADD COLUMN IF NOT EXISTS "asyncTurnId" TEXT;

-- Step 4: Add foreign key constraints
ALTER TABLE "AsyncTurn"
ADD CONSTRAINT "AsyncTurn_tableId_fkey"
FOREIGN KEY ("tableId") REFERENCES "Table"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AsyncTurn"
ADD CONSTRAINT "AsyncTurn_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message"
ADD CONSTRAINT "Message_asyncTurnId_fkey"
FOREIGN KEY ("asyncTurnId") REFERENCES "AsyncTurn"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 5: Create indexes
CREATE INDEX IF NOT EXISTS "AsyncTurn_tableId_startedAt_idx"
ON "AsyncTurn"("tableId", "startedAt");

CREATE INDEX IF NOT EXISTS "AsyncTurn_deadline_idx"
ON "AsyncTurn"("deadline");

CREATE INDEX IF NOT EXISTS "Message_asyncTurnId_idx"
ON "Message"("asyncTurnId");
      `);

      console.log('\n⚠️  Please execute the SQL above in the Supabase Dashboard:');
      console.log('   1. Go to https://supabase.com/dashboard');
      console.log('   2. Select your project');
      console.log('   3. Navigate to SQL Editor');
      console.log('   4. Paste and run the SQL above');

      process.exit(0);
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
