/**
 * Migration script to add AsyncTurn model (Story 7.1)
 * Run with: npx tsx src/scripts/migrate-async-turn.ts
 */
import '../env-loader'; // Load environment variables
import { prisma } from '@iarpg/db';

async function main() {
  console.log('🔄 Starting migration: Add Async Turn model...\n');

  try {
    // Add async mode fields to Table
    console.log('📝 Adding async mode fields to Table...');
    await prisma.$executeRaw`
      ALTER TABLE "Table"
      ADD COLUMN IF NOT EXISTS "turnDeadlineHours" INTEGER,
      ADD COLUMN IF NOT EXISTS "currentTurnIndex" INTEGER DEFAULT 0 NOT NULL,
      ADD COLUMN IF NOT EXISTS "turnOrder" JSONB DEFAULT '[]'::jsonb NOT NULL;
    `;
    console.log('✅ Table fields added\n');

    // Create AsyncTurn table
    console.log('📝 Creating AsyncTurn table...');
    await prisma.$executeRaw`
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
    `;
    console.log('✅ AsyncTurn table created\n');

    // Add asyncTurnId to Message table
    console.log('📝 Adding asyncTurnId to Message...');
    await prisma.$executeRaw`
      ALTER TABLE "Message"
      ADD COLUMN IF NOT EXISTS "asyncTurnId" TEXT;
    `;
    console.log('✅ Message column added\n');

    // Add foreign key constraints
    console.log('📝 Adding foreign key constraints...');
    await prisma.$executeRaw`
      ALTER TABLE "AsyncTurn"
      ADD CONSTRAINT IF NOT EXISTS "AsyncTurn_tableId_fkey"
      FOREIGN KEY ("tableId") REFERENCES "Table"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "AsyncTurn"
      ADD CONSTRAINT IF NOT EXISTS "AsyncTurn_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
    `;

    await prisma.$executeRaw`
      ALTER TABLE "Message"
      ADD CONSTRAINT IF NOT EXISTS "Message_asyncTurnId_fkey"
      FOREIGN KEY ("asyncTurnId") REFERENCES "AsyncTurn"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
    `;
    console.log('✅ Foreign keys added\n');

    // Create indexes
    console.log('📝 Creating indexes...');
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AsyncTurn_tableId_startedAt_idx"
      ON "AsyncTurn"("tableId", "startedAt");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "AsyncTurn_deadline_idx"
      ON "AsyncTurn"("deadline");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Message_asyncTurnId_idx"
      ON "Message"("asyncTurnId");
    `;
    console.log('✅ Indexes created\n');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
