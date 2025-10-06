import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { getIO } from '../socket';
import { DiceRoller } from '@iarpg/shared';

const router = Router();

// All dice routes require authentication
router.use(authMiddleware);

// POST /api/tables/:id/roll - Roll dice in a table
router.post('/:id/roll', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const userId = req.user!.id;
    const { notation, reason, advantage, disadvantage } = req.body;

    if (!notation || typeof notation !== 'string') {
      throw new AppError('Dice notation is required', 400, 'VALIDATION_ERROR');
    }

    // Verify user is member of table or table owner
    const { supabase } = await import('@iarpg/db');

    // Check if user is owner of the table
    const { data: table } = await (supabase
      .from('tables') as any)
      .select('owner_id')
      .eq('id', tableId)
      .single();

    const isOwner = table?.owner_id === userId;

    // If not owner, check if user is a member
    if (!isOwner) {
      const { data: member } = await (supabase
        .from('table_members') as any)
        .select('id')
        .eq('table_id', tableId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (!member) {
        throw new AppError('You are not a member of this table', 403, 'FORBIDDEN');
      }
    }

    // Roll the dice
    let roll;
    try {
      if (advantage) {
        roll = DiceRoller.rollWithAdvantage(notation);
      } else if (disadvantage) {
        roll = DiceRoller.rollWithDisadvantage(notation);
      } else {
        roll = DiceRoller.roll(notation);
      }
    } catch (error: any) {
      throw new AppError(error.message, 400, 'INVALID_DICE_NOTATION');
    }

    // Check for critical success/failure
    if (DiceRoller.isCriticalSuccess(roll)) {
      roll.type = 'critical';
    }

    // Prepare response
    const rollResult = {
      id: `roll_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      tableId,
      userId,
      username: req.user!.username || 'User',
      notation: roll.notation,
      rolls: roll.rolls,
      total: roll.total,
      modifier: roll.modifier,
      type: roll.type,
      breakdown: roll.breakdown,
      reason: reason || null,
      createdAt: new Date().toISOString(),
    };

    // Save roll to database as a special message
    const { data: savedMessage, error: saveError } = await (supabase
      .from('messages') as any)
      .insert({
        table_id: tableId,
        user_id: userId,
        character_id: null,
        content: rollResult.breakdown,
        type: 'system',
        dice_rolls: [rollResult],
        reactions: [],
      })
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .single();

    if (saveError) {
      console.error('Failed to save dice roll to database:', saveError);
      // Don't block the response, but log the error
    }

    // Broadcast via Socket.io
    const io = getIO();
    io.to(`table:${tableId}`).emit('roll:new', rollResult);

    // Update table last_activity_at
    await (supabase
      .from('tables') as any)
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', tableId);

    res.status(201).json(rollResult);
  } catch (error) {
    next(error);
  }
});

export default router;
