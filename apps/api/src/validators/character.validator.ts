import { z } from 'zod';

// Valid D&D 5e classes
const validClasses = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
] as const;

// Valid D&D 5e races
const validRaces = [
  'Human',
  'Elf',
  'Dwarf',
  'Halfling',
  'Dragonborn',
  'Gnome',
  'Half-Elf',
  'Half-Orc',
  'Tiefling',
] as const;

// Ability scores schema (3-20 per D&D 5e rules)
const abilityScoresSchema = z.object({
  strength: z.number().int().min(3, 'Strength must be at least 3').max(20, 'Strength cannot exceed 20'),
  dexterity: z.number().int().min(3, 'Dexterity must be at least 3').max(20, 'Dexterity cannot exceed 20'),
  constitution: z.number().int().min(3, 'Constitution must be at least 3').max(20, 'Constitution cannot exceed 20'),
  intelligence: z.number().int().min(3, 'Intelligence must be at least 3').max(20, 'Intelligence cannot exceed 20'),
  wisdom: z.number().int().min(3, 'Wisdom must be at least 3').max(20, 'Wisdom cannot exceed 20'),
  charisma: z.number().int().min(3, 'Charisma must be at least 3').max(20, 'Charisma cannot exceed 20'),
});

// Create character schema
export const createCharacterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),

  race: z.enum(validRaces, {
    errorMap: () => ({ message: `Race must be one of: ${validRaces.join(', ')}` }),
  }),

  class: z.enum(validClasses, {
    errorMap: () => ({ message: `Class must be one of: ${validClasses.join(', ')}` }),
  }),

  level: z
    .number()
    .int('Level must be an integer')
    .min(1, 'Level must be at least 1')
    .max(20, 'Level cannot exceed 20')
    .optional()
    .default(1),

  abilityScores: abilityScoresSchema,

  equipment: z.array(z.string()).optional().default([]),

  background: z.string().max(500, 'Background too long (max 500 characters)').optional().default(''),
});

// Update character schema (only allowed fields)
export const updateCharacterSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
    .optional(),

  level: z
    .number()
    .int('Level must be an integer')
    .min(1, 'Level must be at least 1')
    .max(20, 'Level cannot exceed 20')
    .optional(),

  equipment: z.array(z.string()).optional(),

  background: z.string().max(500, 'Background too long').optional(),

  notes: z.string().max(2000, 'Notes too long (max 2000 characters)').optional(),

  avatar_url: z.string().url('Invalid avatar URL').optional(),
});

// Export types
export type CreateCharacterInput = z.infer<typeof createCharacterSchema>;
export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>;
