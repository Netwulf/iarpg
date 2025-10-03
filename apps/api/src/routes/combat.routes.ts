import { Router } from 'express';
import { supabase } from '@iarpg/db';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { getIO } from '../socket';

const router = Router();

// All combat routes require authentication
router.use(authMiddleware);

// POST /api/tables/:tableId/combat/start - Start combat encounter
router.post('/:tableId/start', async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const userId = req.user!.id;
    const { combatants } = req.body;

    if (!combatants || !Array.isArray(combatants)) {
      throw new AppError('Combatants array is required', 400, 'VALIDATION_ERROR');
    }

    // Verify user is DM
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select('*')
      .eq('id', tableId)
      .single();

    if (tableError || !table || table.owner_id !== userId) {
      throw new AppError('Only DM can start combat', 403, 'FORBIDDEN');
    }

    // Check if combat already active
    const { data: existingCombat } = await (supabase
      .from('combat_encounters') as any)
      .select('*')
      .eq('table_id', tableId)
      .eq('state', 'active')
      .maybeSingle();

    if (existingCombat) {
      throw new AppError('Combat already in progress', 400, 'VALIDATION_ERROR');
    }

    // Sort combatants by initiative (descending)
    const sortedCombatants = combatants
      .map((c: any, idx: number) => ({
        id: `${Date.now()}_${idx}`,
        characterId: c.characterId || null,
        name: c.name,
        initiative: c.initiative,
        hp: c.hp,
        maxHp: c.maxHp,
        isNPC: c.isNPC || false,
        position: 0, // Will be set after sorting
      }))
      .sort((a: any, b: any) => b.initiative - a.initiative)
      .map((c: any, idx: number) => ({ ...c, position: idx }));

    // Create combat encounter
    const { data: encounter, error: createError } = await (supabase
      .from('combat_encounters') as any)
      .insert({
        table_id: tableId,
        name: 'Combat Encounter',
        combatants: sortedCombatants,
        state: 'active',
        current_turn: 0,
        round: 1,
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase error creating combat encounter:', createError);
      throw new AppError('Failed to create combat encounter', 500, 'DATABASE_ERROR');
    }

    // Broadcast combat started
    const io = getIO();
    io.to(`table:${tableId}`).emit('combat:started', { encounter });

    res.status(201).json({ encounter });
  } catch (error) {
    next(error);
  }
});

// GET /api/tables/:tableId/combat - Get active combat
router.get('/:tableId', async (req, res, next) => {
  try {
    const { tableId } = req.params;

    const { data: encounter, error } = await (supabase
      .from('combat_encounters') as any)
      .select('*')
      .eq('table_id', tableId)
      .eq('state', 'active')
      .maybeSingle();

    if (error) {
      console.error('Supabase error fetching combat encounter:', error);
      throw new AppError('Failed to fetch combat encounter', 500, 'DATABASE_ERROR');
    }

    res.json({ encounter });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tables/:tableId/combat/:encounterId/next-turn - Advance turn
router.patch('/:tableId/:encounterId/next-turn', async (req, res, next) => {
  try {
    const { tableId, encounterId } = req.params;
    const userId = req.user!.id;

    // Verify user is DM
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select('*')
      .eq('id', tableId)
      .single();

    if (tableError || !table || table.owner_id !== userId) {
      throw new AppError('Only DM can advance turn', 403, 'FORBIDDEN');
    }

    // Get encounter
    const { data: encounter, error: encounterError } = await (supabase
      .from('combat_encounters') as any)
      .select('*')
      .eq('id', encounterId)
      .single();

    if (encounterError || !encounter) {
      throw new AppError('Combat encounter not found', 404, 'NOT_FOUND');
    }

    const combatants = encounter.combatants as any[];
    const nextTurn = encounter.current_turn + 1;
    const isNewRound = nextTurn >= combatants.length;

    // Update encounter
    const { data: updated, error: updateError } = await (supabase
      .from('combat_encounters') as any)
      .update({
        current_turn: isNewRound ? 0 : nextTurn,
        round: isNewRound ? encounter.round + 1 : encounter.round,
      })
      .eq('id', encounterId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error updating combat encounter:', updateError);
      throw new AppError('Failed to update combat encounter', 500, 'DATABASE_ERROR');
    }

    // Broadcast turn change
    const io = getIO();
    const currentCombatant = (updated.combatants as any[])[updated.current_turn];
    io.to(`table:${tableId}`).emit('combat:turn-changed', {
      encounter: updated,
      currentCombatant,
    });

    res.json({ encounter: updated });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/tables/:tableId/combat/:encounterId/hp - Update combatant HP
router.patch('/:tableId/:encounterId/hp', async (req, res, next) => {
  try {
    const { tableId, encounterId } = req.params;
    const userId = req.user!.id;
    const { combatantId, hp } = req.body;

    // Verify user is DM
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select('*')
      .eq('id', tableId)
      .single();

    if (tableError || !table || table.owner_id !== userId) {
      throw new AppError('Only DM can update HP', 403, 'FORBIDDEN');
    }

    // Get encounter
    const { data: encounter, error: encounterError } = await (supabase
      .from('combat_encounters') as any)
      .select('*')
      .eq('id', encounterId)
      .single();

    if (encounterError || !encounter) {
      throw new AppError('Combat encounter not found', 404, 'NOT_FOUND');
    }

    // Update combatant HP
    const combatants = encounter.combatants as any[];
    const updatedCombatants = combatants.map((c: any) => {
      if (c.id === combatantId) {
        return { ...c, hp: Math.max(0, Math.min(c.maxHp, hp)) };
      }
      return c;
    });

    const { data: updated, error: updateError } = await (supabase
      .from('combat_encounters') as any)
      .update({ combatants: updatedCombatants })
      .eq('id', encounterId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error updating combatant HP:', updateError);
      throw new AppError('Failed to update combatant HP', 500, 'DATABASE_ERROR');
    }

    // Broadcast HP update
    const io = getIO();
    const updatedCombatant = updatedCombatants.find((c: any) => c.id === combatantId);
    io.to(`table:${tableId}`).emit('combat:hp-updated', {
      combatantId,
      hp: updatedCombatant.hp,
    });

    res.json({ encounter: updated });
  } catch (error) {
    next(error);
  }
});

// POST /api/tables/:tableId/combat/:encounterId/end - End combat
router.post('/:tableId/:encounterId/end', async (req, res, next) => {
  try {
    const { tableId, encounterId } = req.params;
    const userId = req.user!.id;

    // Verify user is DM
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select('*')
      .eq('id', tableId)
      .single();

    if (tableError || !table || table.owner_id !== userId) {
      throw new AppError('Only DM can end combat', 403, 'FORBIDDEN');
    }

    // End combat
    const { data: encounter, error: updateError } = await (supabase
      .from('combat_encounters') as any)
      .update({
        state: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', encounterId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase error ending combat encounter:', updateError);
      throw new AppError('Failed to end combat encounter', 500, 'DATABASE_ERROR');
    }

    // Broadcast combat ended
    const io = getIO();
    io.to(`table:${tableId}`).emit('combat:ended', { encounterId });

    res.json({ encounter });
  } catch (error) {
    next(error);
  }
});

export default router;
