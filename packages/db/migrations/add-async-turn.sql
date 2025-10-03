-- Migration: Add Async Turn model (Story 7.1)
-- Add async mode fields to Table
ALTER TABLE "Table"
ADD COLUMN IF NOT EXISTS "turnDeadlineHours" INTEGER,
ADD COLUMN IF NOT EXISTS "currentTurnIndex" INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS "turnOrder" JSONB DEFAULT '[]' NOT NULL;

-- Create AsyncTurn table
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

-- Add asyncTurnId to Message table
ALTER TABLE "Message"
ADD COLUMN IF NOT EXISTS "asyncTurnId" TEXT;

-- Add foreign key constraints
ALTER TABLE "AsyncTurn" ADD CONSTRAINT "AsyncTurn_tableId_fkey"
    FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AsyncTurn" ADD CONSTRAINT "AsyncTurn_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Message" ADD CONSTRAINT "Message_asyncTurnId_fkey"
    FOREIGN KEY ("asyncTurnId") REFERENCES "AsyncTurn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create indexes
CREATE INDEX IF NOT EXISTS "AsyncTurn_tableId_startedAt_idx" ON "AsyncTurn"("tableId", "startedAt");
CREATE INDEX IF NOT EXISTS "AsyncTurn_deadline_idx" ON "AsyncTurn"("deadline");
CREATE INDEX IF NOT EXISTS "Message_asyncTurnId_idx" ON "Message"("asyncTurnId");
