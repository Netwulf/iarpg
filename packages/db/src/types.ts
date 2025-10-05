/**
 * Database type definitions generated from Supabase schema
 * Update these types when schema changes
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          password_hash: string | null;
          avatar_url: string | null;
          bio: string | null;
          tier: 'free' | 'premium' | 'master';
          stripe_customer_id: string | null;
          online_status: 'online' | 'offline' | 'away';
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          email: string;
          password_hash?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          tier?: 'free' | 'premium' | 'master';
          stripe_customer_id?: string | null;
          online_status?: 'online' | 'offline' | 'away';
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          email?: string;
          password_hash?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          tier?: 'free' | 'premium' | 'master';
          stripe_customer_id?: string | null;
          online_status?: 'online' | 'offline' | 'away';
          last_seen_at?: string | null;
          updated_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          race: string;
          class: string;
          level: number;
          strength: number;
          dexterity: number;
          constitution: number;
          intelligence: number;
          wisdom: number;
          charisma: number;
          proficiency_bonus: number;
          hp: number;
          max_hp: number;
          temp_hp: number;
          ac: number;
          initiative: number;
          speed: number;
          proficiencies: string[];
          spells: Spell[];
          equipment: EquipmentItem[];
          background: string;
          notes: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          race: string;
          class: string;
          level?: number;
          strength: number;
          dexterity: number;
          constitution: number;
          intelligence: number;
          wisdom: number;
          charisma: number;
          proficiency_bonus?: number;
          hp: number;
          max_hp: number;
          temp_hp?: number;
          ac: number;
          initiative: number;
          speed?: number;
          proficiencies?: string[];
          spells?: Spell[];
          equipment?: EquipmentItem[];
          background: string;
          notes?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          race?: string;
          class?: string;
          level?: number;
          strength?: number;
          dexterity?: number;
          constitution?: number;
          intelligence?: number;
          wisdom?: number;
          charisma?: number;
          proficiency_bonus?: number;
          hp?: number;
          max_hp?: number;
          temp_hp?: number;
          ac?: number;
          initiative?: number;
          speed?: number;
          proficiencies?: string[];
          spells?: Spell[];
          equipment?: EquipmentItem[];
          background?: string;
          notes?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
      };
      tables: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string;
          play_style: 'sync' | 'async' | 'solo';
          privacy: 'private' | 'public' | 'spectator';
          invite_code: string;
          state: 'setup' | 'active' | 'paused' | 'completed';
          schedule: string | null;
          max_players: number;
          tags: string[];
          rules_variant: 'standard' | 'homebrew';
          thumbnail_url: string | null;
          created_at: string;
          updated_at: string;
          last_activity_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description: string;
          play_style: 'sync' | 'async' | 'solo';
          privacy?: 'private' | 'public' | 'spectator';
          invite_code: string;
          state?: 'setup' | 'active' | 'paused' | 'completed';
          schedule?: string | null;
          max_players?: number;
          tags?: string[];
          rules_variant?: 'standard' | 'homebrew';
          thumbnail_url?: string | null;
          created_at?: string;
          updated_at?: string;
          last_activity_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          play_style?: 'sync' | 'async' | 'solo';
          privacy?: 'private' | 'public' | 'spectator';
          state?: 'setup' | 'active' | 'paused' | 'completed';
          schedule?: string | null;
          max_players?: number;
          tags?: string[];
          rules_variant?: 'standard' | 'homebrew';
          thumbnail_url?: string | null;
          updated_at?: string;
          last_activity_at?: string;
        };
      };
      table_members: {
        Row: {
          id: string;
          table_id: string;
          user_id: string;
          character_id: string;
          role: 'dm' | 'player';
          status: 'active' | 'invited' | 'left';
          joined_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          user_id: string;
          character_id: string;
          role?: 'dm' | 'player';
          status?: 'active' | 'invited' | 'left';
          joined_at?: string;
        };
        Update: {
          role?: 'dm' | 'player';
          status?: 'active' | 'invited' | 'left';
        };
      };
      messages: {
        Row: {
          id: string;
          table_id: string;
          user_id: string;
          character_id: string | null;
          type: 'ic' | 'ooc' | 'dm-note' | 'system';
          content: string;
          dice_rolls: DiceRoll[];
          reactions: Reaction[];
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_id: string;
          user_id: string;
          character_id?: string | null;
          type: 'ic' | 'ooc' | 'dm-note' | 'system';
          content: string;
          dice_rolls?: DiceRoll[];
          reactions?: Reaction[];
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          dice_rolls?: DiceRoll[];
          reactions?: Reaction[];
          updated_at?: string;
        };
      };
      combat_encounters: {
        Row: {
          id: string;
          table_id: string;
          name: string;
          round: number;
          state: 'setup' | 'active' | 'ended';
          combatants: Combatant[];
          created_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          table_id: string;
          name: string;
          round?: number;
          state?: 'setup' | 'active' | 'ended';
          combatants?: Combatant[];
          created_at?: string;
          ended_at?: string | null;
        };
        Update: {
          name?: string;
          round?: number;
          state?: 'setup' | 'active' | 'ended';
          combatants?: Combatant[];
          ended_at?: string | null;
        };
      };
      ai_usage: {
        Row: {
          id: string;
          user_id: string | null;
          table_id: string | null;
          prompt: string;
          response: string;
          tokens_used: number;
          cost: number;
          model: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          table_id?: string | null;
          prompt: string;
          response: string;
          tokens_used: number;
          cost: number;
          model?: string;
          created_at?: string;
        };
        Update: {
          prompt?: string;
          response?: string;
          tokens_used?: number;
          cost?: number;
          model?: string;
        };
      };
      async_turns: {
        Row: {
          id: string;
          table_id: string | null;
          character_id: string | null;
          user_id: string | null;
          turn_number: number;
          deadline: string;
          status: 'pending' | 'submitted' | 'skipped';
          content: string | null;
          dice_rolls: DiceRoll[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_id?: string | null;
          character_id?: string | null;
          user_id?: string | null;
          turn_number: number;
          deadline: string;
          status?: 'pending' | 'submitted' | 'skipped';
          content?: string | null;
          dice_rolls?: DiceRoll[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          turn_number?: number;
          deadline?: string;
          status?: 'pending' | 'submitted' | 'skipped';
          content?: string | null;
          dice_rolls?: DiceRoll[];
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string | null;
          stripe_subscription_id: string | null;
          stripe_customer_id: string | null;
          plan: 'free' | 'premium' | 'master';
          status: 'active' | 'canceled' | 'past_due' | 'incomplete';
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          plan: 'free' | 'premium' | 'master';
          status: 'active' | 'canceled' | 'past_due' | 'incomplete';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_subscription_id?: string | null;
          stripe_customer_id?: string | null;
          plan?: 'free' | 'premium' | 'master';
          status?: 'active' | 'canceled' | 'past_due' | 'incomplete';
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
      campaign_logs: {
        Row: {
          id: string;
          table_id: string | null;
          session_number: number;
          session_date: string;
          summary: string | null;
          dm_notes: string | null;
          player_notes: Record<string, string>;
          key_events: string[];
          npcs_introduced: NPC[];
          loot_acquired: LootItem[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          table_id?: string | null;
          session_number: number;
          session_date: string;
          summary?: string | null;
          dm_notes?: string | null;
          player_notes?: Record<string, string>;
          key_events?: string[];
          npcs_introduced?: NPC[];
          loot_acquired?: LootItem[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          session_number?: number;
          session_date?: string;
          summary?: string | null;
          dm_notes?: string | null;
          player_notes?: Record<string, string>;
          key_events?: string[];
          npcs_introduced?: NPC[];
          loot_acquired?: LootItem[];
          updated_at?: string;
        };
      };
    };
  };
}

// Supporting types for JSONB fields

export interface Spell {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string[];
  duration: string;
  description: string;
  prepared?: boolean;
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  quantity: number;
  weight: number;
  description?: string;
  equipped?: boolean;
}

export interface DiceRoll {
  id: string;
  formula: string;
  result: number;
  breakdown: string;
  timestamp: string;
}

export interface Reaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface Combatant {
  id: string;
  name: string;
  initiative: number;
  hp: number;
  maxHp: number;
  ac: number;
  type: 'player' | 'npc' | 'monster';
  characterId?: string;
  conditions: string[];
}

export interface NPC {
  id: string;
  name: string;
  description?: string;
  role?: string;
  location?: string;
}

export interface LootItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  value?: number;
}

// Helper type exports for convenience
export type User = Database['public']['Tables']['users']['Row'];
export type Character = Database['public']['Tables']['characters']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type TableMember = Database['public']['Tables']['table_members']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type CombatEncounter = Database['public']['Tables']['combat_encounters']['Row'];
export type AIUsage = Database['public']['Tables']['ai_usage']['Row'];
export type AsyncTurn = Database['public']['Tables']['async_turns']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type CampaignLog = Database['public']['Tables']['campaign_logs']['Row'];

export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type CharacterInsert = Database['public']['Tables']['characters']['Insert'];
export type TableInsert = Database['public']['Tables']['tables']['Insert'];
export type TableMemberInsert = Database['public']['Tables']['table_members']['Insert'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type CombatEncounterInsert = Database['public']['Tables']['combat_encounters']['Insert'];
export type AIUsageInsert = Database['public']['Tables']['ai_usage']['Insert'];
export type AsyncTurnInsert = Database['public']['Tables']['async_turns']['Insert'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type CampaignLogInsert = Database['public']['Tables']['campaign_logs']['Insert'];

export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CharacterUpdate = Database['public']['Tables']['characters']['Update'];
export type TableUpdate = Database['public']['Tables']['tables']['Update'];
export type TableMemberUpdate = Database['public']['Tables']['table_members']['Update'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];
export type CombatEncounterUpdate = Database['public']['Tables']['combat_encounters']['Update'];
export type AIUsageUpdate = Database['public']['Tables']['ai_usage']['Update'];
export type AsyncTurnUpdate = Database['public']['Tables']['async_turns']['Update'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
export type CampaignLogUpdate = Database['public']['Tables']['campaign_logs']['Update'];
