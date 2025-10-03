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

    // TODO: Verify user is member of table
    // For now, we'll skip this check

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

    // Broadcast via Socket.io
    const io = getIO();
    io.to(`table:${tableId}`).emit('roll:new', rollResult);

    // TODO: Save to database
    // For now, just return the roll

    res.status(201).json(rollResult);
  } catch (error) {
    next(error);
  }
});

export default router;
