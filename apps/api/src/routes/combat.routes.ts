import { Router } from 'express';
import { prisma } from '@iarpg/db';
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
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.ownerId !== userId) {
      throw new AppError('Only DM can start combat', 403, 'FORBIDDEN');
    }

    // Check if combat already active
    const existingCombat = await prisma.combatEncounter.findFirst({
      where: { tableId, state: 'active' },
    });

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
    const encounter = await prisma.combatEncounter.create({
      data: {
        tableId,
        name: 'Combat Encounter',
        combatants: sortedCombatants,
      },
    });

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

    const encounter = await prisma.combatEncounter.findFirst({
      where: { tableId, state: 'active' },
    });

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
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.ownerId !== userId) {
      throw new AppError('Only DM can advance turn', 403, 'FORBIDDEN');
    }

    // Get encounter
    const encounter = await prisma.combatEncounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new AppError('Combat encounter not found', 404, 'NOT_FOUND');
    }

    const combatants = encounter.combatants as any[];
    const nextTurn = encounter.currentTurn + 1;
    const isNewRound = nextTurn >= combatants.length;

    // Update encounter
    const updated = await prisma.combatEncounter.update({
      where: { id: encounterId },
      data: {
        currentTurn: isNewRound ? 0 : nextTurn,
        round: isNewRound ? encounter.round + 1 : encounter.round,
      },
    });

    // Broadcast turn change
    const io = getIO();
    const currentCombatant = (updated.combatants as any[])[updated.currentTurn];
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
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.ownerId !== userId) {
      throw new AppError('Only DM can update HP', 403, 'FORBIDDEN');
    }

    // Get encounter
    const encounter = await prisma.combatEncounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
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

    const updated = await prisma.combatEncounter.update({
      where: { id: encounterId },
      data: { combatants: updatedCombatants },
    });

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
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });

    if (!table || table.ownerId !== userId) {
      throw new AppError('Only DM can end combat', 403, 'FORBIDDEN');
    }

    // End combat
    const encounter = await prisma.combatEncounter.update({
      where: { id: encounterId },
      data: {
        state: 'ended',
        endedAt: new Date(),
      },
    });

    // Broadcast combat ended
    const io = getIO();
    io.to(`table:${tableId}`).emit('combat:ended', { encounterId });

    res.json({ encounter });
  } catch (error) {
    next(error);
  }
});

export default router;
