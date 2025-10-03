// Supabase exports (primary)
export { supabase, createSupabaseAdmin } from './supabase';
export type {
  Database,
  User,
  Character,
  Table,
  TableMember,
  Message,
  CombatEncounter,
  UserInsert,
  CharacterInsert,
  TableInsert,
  TableMemberInsert,
  MessageInsert,
  CombatEncounterInsert,
  UserUpdate,
  CharacterUpdate,
  TableUpdate,
  TableMemberUpdate,
  MessageUpdate,
  CombatEncounterUpdate,
  Spell,
  EquipmentItem,
  DiceRoll,
  Reaction,
  Combatant,
} from './types';

// Legacy Prisma exports (for migration compatibility)
export { prisma } from './client';
export type { Prisma } from '@prisma/client';
