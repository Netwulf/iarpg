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

// Helper type exports for convenience
export type User = Database['public']['Tables']['users']['Row'];
export type Character = Database['public']['Tables']['characters']['Row'];
export type Table = Database['public']['Tables']['tables']['Row'];
export type TableMember = Database['public']['Tables']['table_members']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type CombatEncounter = Database['public']['Tables']['combat_encounters']['Row'];

export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type CharacterInsert = Database['public']['Tables']['characters']['Insert'];
export type TableInsert = Database['public']['Tables']['tables']['Insert'];
export type TableMemberInsert = Database['public']['Tables']['table_members']['Insert'];
export type MessageInsert = Database['public']['Tables']['messages']['Insert'];
export type CombatEncounterInsert = Database['public']['Tables']['combat_encounters']['Insert'];

export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CharacterUpdate = Database['public']['Tables']['characters']['Update'];
export type TableUpdate = Database['public']['Tables']['tables']['Update'];
export type TableMemberUpdate = Database['public']['Tables']['table_members']['Update'];
export type MessageUpdate = Database['public']['Tables']['messages']['Update'];
export type CombatEncounterUpdate = Database['public']['Tables']['combat_encounters']['Update'];
