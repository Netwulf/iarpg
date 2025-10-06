import { Router } from 'express';
import { supabase } from '@iarpg/db';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// All character routes require authentication
router.use(authMiddleware);

// POST /api/characters - Create a new character
router.post('/', async (req, res, next) => {
  try {
    const { name, race, class: className, level, abilityScores, equipment, background } = req.body;

    // Validation
    if (!name || !race || !className) {
      throw new AppError('Name, race, and class are required', 400, 'VALIDATION_ERROR');
    }

    if (!abilityScores || typeof abilityScores !== 'object') {
      throw new AppError('Valid ability scores are required', 400, 'VALIDATION_ERROR');
    }

    // Validate ability scores range (3-20 per D&D 5e rules)
    const abilities = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    for (const ability of abilities) {
      const score = abilityScores[ability];
      if (typeof score !== 'number' || score < 3 || score > 20) {
        throw new AppError(
          `${ability} must be a number between 3 and 20 (got ${score})`,
          400,
          'VALIDATION_ERROR'
        );
      }
    }

    // Calculate derived stats
    const constitutionModifier = Math.floor((abilityScores.constitution - 10) / 2);
    const dexterityModifier = Math.floor((abilityScores.dexterity - 10) / 2);

    // Hit die by class
    const hitDice: Record<string, number> = {
      Barbarian: 12,
      Fighter: 10,
      Paladin: 10,
      Ranger: 10,
      Bard: 8,
      Cleric: 8,
      Druid: 8,
      Monk: 8,
      Rogue: 8,
      Warlock: 8,
      Sorcerer: 6,
      Wizard: 6,
    };

    const hitDie = hitDice[className];
    if (!hitDie) {
      throw new AppError(
        `Invalid class name: ${className}. Must be one of: ${Object.keys(hitDice).join(', ')}`,
        400,
        'VALIDATION_ERROR'
      );
    }

    const characterLevel = level || 1;

    // Calculate HP: Level 1 gets max hit die, subsequent levels get average
    let maxHP = hitDie + constitutionModifier; // Level 1
    for (let i = 2; i <= characterLevel; i++) {
      const averageRoll = Math.floor((hitDie / 2) + 1);
      maxHP += averageRoll + constitutionModifier;
    }

    const armorClass = 10 + dexterityModifier; // Base AC
    const initiative = dexterityModifier;

    // Calculate proficiency bonus based on level (D&D 5e formula)
    const proficiencyBonus = 2 + Math.floor((characterLevel - 1) / 4);

    // Speed by race
    const speeds: Record<string, number> = {
      Human: 30,
      Elf: 30,
      Dwarf: 25,
      Halfling: 25,
      Dragonborn: 30,
      Gnome: 25,
      'Half-Elf': 30,
      'Half-Orc': 30,
      Tiefling: 30,
    };

    const speed = speeds[race] || 30;

    // Create character in Supabase
    const { data: character, error } = await (supabase
      .from('characters') as any)
      .insert({
        user_id: req.user!.id,
        name,
        race,
        class: className,
        level: level || 1,
        strength: abilityScores.strength,
        dexterity: abilityScores.dexterity,
        constitution: abilityScores.constitution,
        intelligence: abilityScores.intelligence,
        wisdom: abilityScores.wisdom,
        charisma: abilityScores.charisma,
        hp: maxHP,
        max_hp: maxHP,
        ac: armorClass,
        initiative,
        speed,
        proficiency_bonus: proficiencyBonus,
        equipment: equipment || [],
        background: background || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating character:', error);
      throw new AppError('Failed to create character', 500, 'DATABASE_ERROR');
    }

    res.status(201).json(character);
  } catch (error) {
    next(error);
  }
});

// GET /api/characters - Get all characters for authenticated user
router.get('/', async (req, res, next) => {
  try {
    const { data: characters, error } = await (supabase
      .from('characters') as any)
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching characters:', error);
      throw new AppError('Failed to fetch characters', 500, 'DATABASE_ERROR');
    }

    res.json(characters || []);
  } catch (error) {
    next(error);
  }
});

// GET /api/characters/:id - Get a specific character
router.get('/:id', async (req, res, next) => {
  try {
    const { data: character, error } = await (supabase
      .from('characters') as any)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !character) {
      if (error?.code === 'PGRST116') {
        throw new AppError('Character not found', 404, 'NOT_FOUND');
      }
      console.error('Supabase error fetching character:', error);
      throw new AppError('Failed to fetch character', 500, 'DATABASE_ERROR');
    }

    // Verify ownership
    if (character.user_id !== req.user!.id) {
      throw new AppError('Not authorized to view this character', 403, 'FORBIDDEN');
    }

    res.json(character);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/characters/:id - Update a character
router.patch('/:id', async (req, res, next) => {
  try {
    // First verify character exists and ownership
    const { data: character, error: fetchError } = await (supabase
      .from('characters') as any)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !character) {
      if (fetchError?.code === 'PGRST116') {
        throw new AppError('Character not found', 404, 'NOT_FOUND');
      }
      console.error('Supabase error fetching character:', fetchError);
      throw new AppError('Failed to fetch character', 500, 'DATABASE_ERROR');
    }

    // Verify ownership
    if (character.user_id !== req.user!.id) {
      throw new AppError('Not authorized to modify this character', 403, 'FORBIDDEN');
    }

    // Whitelist allowed fields for update (prevent cheating)
    const allowedUpdates = [
      'name',
      'background',
      'equipment',
      'notes',
      'avatar_url',
      // If level changes, we need to recalculate derived stats
      'level',
    ];

    const updates: any = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If level changed, recalculate derived stats
    if (updates.level && updates.level !== character.level) {
      const newLevel = updates.level;

      // Recalculate HP
      const hitDice: Record<string, number> = {
        Barbarian: 12,
        Fighter: 10,
        Paladin: 10,
        Ranger: 10,
        Bard: 8,
        Cleric: 8,
        Druid: 8,
        Monk: 8,
        Rogue: 8,
        Warlock: 8,
        Sorcerer: 6,
        Wizard: 6,
      };

      const hitDie = hitDice[character.class] || 8;
      const conMod = Math.floor((character.constitution - 10) / 2);

      let newMaxHP = hitDie + conMod; // Level 1
      for (let i = 2; i <= newLevel; i++) {
        const averageRoll = Math.floor((hitDie / 2) + 1);
        newMaxHP += averageRoll + conMod;
      }

      updates.max_hp = newMaxHP;
      updates.hp = Math.min(character.hp, newMaxHP); // Don't exceed new max

      // Recalculate proficiency bonus
      updates.proficiency_bonus = 2 + Math.floor((newLevel - 1) / 4);
    }

    // Update character with only allowed fields
    const { data: updatedCharacter, error: updateError } = await (supabase
      .from('characters') as any)
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error updating character:', updateError);
      throw new AppError('Failed to update character', 500, 'DATABASE_ERROR');
    }

    res.json(updatedCharacter);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/characters/:id - Delete a character
router.delete('/:id', async (req, res, next) => {
  try {
    // First verify character exists and ownership
    const { data: character, error: fetchError } = await (supabase
      .from('characters') as any)
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !character) {
      if (fetchError?.code === 'PGRST116') {
        throw new AppError('Character not found', 404, 'NOT_FOUND');
      }
      console.error('Supabase error fetching character:', fetchError);
      throw new AppError('Failed to fetch character', 500, 'DATABASE_ERROR');
    }

    // Verify ownership
    if (character.user_id !== req.user!.id) {
      throw new AppError('Not authorized to delete this character', 403, 'FORBIDDEN');
    }

    // Delete character
    const { error: deleteError } = await (supabase
      .from('characters') as any)
      .delete()
      .eq('id', req.params.id);

    if (deleteError) {
      console.error('Supabase error deleting character:', deleteError);
      throw new AppError('Failed to delete character', 500, 'DATABASE_ERROR');
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
