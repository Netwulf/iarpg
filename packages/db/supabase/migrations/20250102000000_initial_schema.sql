-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
-- Stores user account information and online status
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  avatar_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'premium', 'master')),
  stripe_customer_id TEXT UNIQUE,
  online_status TEXT DEFAULT 'offline' CHECK (online_status IN ('online', 'offline', 'away')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table
-- Stores player character sheets with stats and equipment
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER DEFAULT 1,

  -- Ability Scores
  strength INTEGER NOT NULL,
  dexterity INTEGER NOT NULL,
  constitution INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  wisdom INTEGER NOT NULL,
  charisma INTEGER NOT NULL,

  -- Core Stats
  proficiency_bonus INTEGER DEFAULT 2,
  hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  temp_hp INTEGER DEFAULT 0,
  ac INTEGER NOT NULL,
  initiative INTEGER NOT NULL,
  speed INTEGER DEFAULT 30,

  -- Skills & Proficiencies (JSON array of strings)
  proficiencies JSONB DEFAULT '[]'::jsonb,

  -- Spells (JSON array of Spell objects)
  spells JSONB DEFAULT '[]'::jsonb,

  -- Equipment (JSON array of EquipmentItem objects)
  equipment JSONB DEFAULT '[]'::jsonb,

  -- Character Details
  background TEXT NOT NULL,
  notes TEXT,
  avatar_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tables table
-- Stores game table/session information
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  play_style TEXT NOT NULL CHECK (play_style IN ('sync', 'async', 'solo')),
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('private', 'public', 'spectator')),
  invite_code TEXT UNIQUE NOT NULL,
  state TEXT DEFAULT 'setup' CHECK (state IN ('setup', 'active', 'paused', 'completed')),
  schedule TEXT,
  max_players INTEGER DEFAULT 6,
  tags TEXT[] DEFAULT '{}',
  rules_variant TEXT DEFAULT 'standard' CHECK (rules_variant IN ('standard', 'homebrew')),
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table Members junction table
-- Links users and characters to game tables
CREATE TABLE table_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'player' CHECK (role IN ('dm', 'player')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'left')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, user_id)
);

-- Messages table
-- Stores all chat messages with dice rolls and reactions
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('ic', 'ooc', 'dm-note', 'system')),
  content TEXT NOT NULL,

  -- Embedded data (JSONB)
  dice_rolls JSONB DEFAULT '[]'::jsonb,
  reactions JSONB DEFAULT '[]'::jsonb,

  parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Combat Encounters table
-- Stores active combat state with initiative order
CREATE TABLE combat_encounters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  round INTEGER DEFAULT 1,
  state TEXT DEFAULT 'setup' CHECK (state IN ('setup', 'active', 'ended')),

  -- Combatants (JSONB array of Combatant objects)
  combatants JSONB DEFAULT '[]'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

CREATE INDEX idx_characters_user_id ON characters(user_id);

CREATE INDEX idx_tables_owner_id ON tables(owner_id);
CREATE INDEX idx_tables_privacy_state ON tables(privacy, state);
CREATE INDEX idx_tables_invite_code ON tables(invite_code);

CREATE INDEX idx_table_members_table_id ON table_members(table_id);
CREATE INDEX idx_table_members_user_id ON table_members(user_id);

CREATE INDEX idx_messages_table_id_created_at ON messages(table_id, created_at);
CREATE INDEX idx_messages_parent_id ON messages(parent_id);

CREATE INDEX idx_combat_encounters_table_id ON combat_encounters(table_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
  BEFORE UPDATE ON tables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE combat_encounters ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own profile, admins can read all
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Characters: Can read own characters
CREATE POLICY characters_select_own ON characters
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY characters_insert_own ON characters
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY characters_update_own ON characters
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY characters_delete_own ON characters
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Tables: Can read tables you own or are a member of
CREATE POLICY tables_select_own_or_member ON tables
  FOR SELECT USING (
    auth.uid()::text = owner_id::text OR
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = tables.id
      AND table_members.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY tables_insert_own ON tables
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id::text);

CREATE POLICY tables_update_own ON tables
  FOR UPDATE USING (auth.uid()::text = owner_id::text);

CREATE POLICY tables_delete_own ON tables
  FOR DELETE USING (auth.uid()::text = owner_id::text);

-- Table Members: Can read members of tables you belong to
CREATE POLICY table_members_select_own_table ON table_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM table_members tm
      WHERE tm.table_id = table_members.table_id
      AND tm.user_id::text = auth.uid()::text
    )
  );

-- Messages: Can read messages from tables you belong to
CREATE POLICY messages_select_own_table ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = messages.table_id
      AND table_members.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY messages_insert_own ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id::text AND
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = messages.table_id
      AND table_members.user_id::text = auth.uid()::text
    )
  );

-- Combat Encounters: Can read encounters from tables you belong to
CREATE POLICY combat_encounters_select_own_table ON combat_encounters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM table_members
      WHERE table_members.table_id = combat_encounters.table_id
      AND table_members.user_id::text = auth.uid()::text
    )
  );
