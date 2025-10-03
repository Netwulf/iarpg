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

    const hitDie = hitDice[className] || 8;
    const maxHP = hitDie + constitutionModifier;
    const armorClass = 10 + dexterityModifier; // Base AC
    const initiative = dexterityModifier;
    const proficiencyBonus = 2; // Level 1

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

    // Update character
    const { data: updatedCharacter, error: updateError } = await (supabase
      .from('characters') as any)
      .update(req.body)
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
