import { z } from 'zod';

// Create table schema
export const createTableSchema = z.object({
  name: z
    .string()
    .min(3, 'Table name must be at least 3 characters')
    .max(50, 'Table name must be less than 50 characters'),

  description: z.string().max(500, 'Description too long (max 500 characters)').optional(),

  playStyle: z.enum(['sync', 'async', 'solo'], {
    errorMap: () => ({ message: 'Play style must be sync, async, or solo' }),
  }),

  privacy: z.enum(['private', 'public', 'spectator'], {
    errorMap: () => ({ message: 'Privacy must be private, public, or spectator' }),
  }),

  maxPlayers: z
    .number()
    .int('Max players must be an integer')
    .min(2, 'Max players must be at least 2')
    .max(8, 'Max players cannot exceed 8')
    .optional()
    .default(6),

  schedule: z.string().optional(),

  tags: z.array(z.string()).max(10, 'Too many tags (max 10)').optional().default([]),
});

// Update table schema
export const updateTableSchema = z.object({
  name: z
    .string()
    .min(3, 'Table name must be at least 3 characters')
    .max(50, 'Table name must be less than 50 characters')
    .optional(),

  description: z.string().max(500, 'Description too long (max 500 characters)').optional(),

  schedule: z.string().optional(),

  tags: z.array(z.string()).max(10, 'Too many tags (max 10)').optional(),
});

// Join table schema
export const joinTableSchema = z.object({
  characterId: z.string().uuid('Invalid character ID format'),
});

// Create message schema
export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, 'Message content is required')
    .max(1000, 'Message too long (max 1000 characters)')
    .transform((val) => val.trim()),

  type: z.enum(['ic', 'ooc', 'dm-note', 'system'], {
    errorMap: () => ({ message: 'Invalid message type. Must be ic, ooc, dm-note, or system' }),
  }).optional().default('ic'),

  character_id: z.string().uuid('Invalid character ID format').optional().nullable(),
});

// Dice roll schema
export const diceRollSchema = z.object({
  notation: z
    .string()
    .min(1, 'Dice notation is required')
    .regex(/^(\d+)?d(\d+)([+-]\d+)?$/i, 'Invalid dice notation (e.g., 1d20, 2d6+3)')
    .transform((val) => val.trim()),

  reason: z.string().max(100, 'Reason too long (max 100 characters)').optional(),

  advantage: z.boolean().optional(),

  disadvantage: z.boolean().optional(),
}).refine((data) => !(data.advantage && data.disadvantage), {
  message: 'Cannot have both advantage and disadvantage',
  path: ['advantage'],
});

// Export types
export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
export type JoinTableInput = z.infer<typeof joinTableSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type DiceRollInput = z.infer<typeof diceRollSchema>;
