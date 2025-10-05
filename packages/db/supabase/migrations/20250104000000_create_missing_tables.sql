-- Migration: Create Missing Database Tables
-- Story WEEK1.4: Add ai_usage, async_turns, subscriptions, campaign_logs
-- Date: 2025-10-04

-- ==========================================
-- 1. AI Usage Tracking Table
-- ==========================================
-- Tracks AI model requests for rate limiting and analytics

CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost DECIMAL(10,4) NOT NULL,
  model VARCHAR(100) DEFAULT 'claude-3-5-sonnet-20241022',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created ON ai_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_table ON ai_usage(table_id);

-- RLS Policy
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI usage"
  ON ai_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert AI usage"
  ON ai_usage FOR INSERT
  WITH CHECK (true);

-- ==========================================
-- 2. Async Turns Table
-- ==========================================
-- Persistence for async (play-by-post) turn-based play

CREATE TABLE IF NOT EXISTS async_turns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  turn_number INTEGER NOT NULL,
  deadline TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'skipped')),
  content TEXT,
  dice_rolls JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_async_turns_table_turn ON async_turns(table_id, turn_number);
CREATE INDEX IF NOT EXISTS idx_async_turns_user_deadline ON async_turns(user_id, deadline);

-- RLS Policy
ALTER TABLE async_turns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Table members can view async turns"
  ON async_turns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = async_turns.table_id
        AND table_members.user_id = auth.uid()
        AND table_members.status = 'active'
    )
  );

CREATE POLICY "Users can submit their own turns"
  ON async_turns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own turns"
  ON async_turns FOR UPDATE
  USING (auth.uid() = user_id);

-- ==========================================
-- 3. Subscriptions Table
-- ==========================================
-- Stripe subscription management

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'premium', 'master')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

-- RLS Policy
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can manage subscriptions"
  ON subscriptions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ==========================================
-- 4. Campaign Logs Table
-- ==========================================
-- Session history and campaign notes

CREATE TABLE IF NOT EXISTS campaign_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  summary TEXT,
  dm_notes TEXT,
  player_notes JSONB DEFAULT '{}'::jsonb,
  key_events JSONB DEFAULT '[]'::jsonb,
  npcs_introduced JSONB DEFAULT '[]'::jsonb,
  loot_acquired JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_logs_table_session ON campaign_logs(table_id, session_number DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_logs_date ON campaign_logs(session_date DESC);

-- RLS Policy
ALTER TABLE campaign_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Table members can view campaign logs"
  ON campaign_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = campaign_logs.table_id
        AND table_members.user_id = auth.uid()
        AND table_members.status = 'active'
    )
  );

CREATE POLICY "DM can manage campaign logs"
  ON campaign_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = campaign_logs.table_id
        AND table_members.user_id = auth.uid()
        AND table_members.role = 'dm'
    )
  );

-- ==========================================
-- Migration Complete
-- ==========================================
-- Tables created: ai_usage, async_turns, subscriptions, campaign_logs
-- All RLS policies enabled for security
-- Indexes created for query performance
