import { Request, Response, NextFunction } from 'express';
import { prisma } from '@iarpg/db';
import { nanoid } from 'nanoid';

export const asyncTurnController = {
  /**
   * Start a new async turn (Story 7.1)
   * POST /api/tables/:tableId/async/turns/start
   */
  async startTurn(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId } = req.params;
      const userId = req.user!.id;

      // Verify user is DM
      const table = await prisma.table.findUnique({
        where: { id: tableId },
      });

      if (!table || table.ownerId !== userId) {
        return res.status(403).json({ error: 'Only DM can start turns' });
      }

      if (table.playStyle !== 'async') {
        return res.status(400).json({ error: 'Table is not in async mode' });
      }

      // Get turn order
      const turnOrder = table.turnOrder as string[];
      if (!turnOrder || turnOrder.length === 0) {
        return res.status(400).json({ error: 'Turn order not set' });
      }

      const currentUserId = turnOrder[table.currentTurnIndex];
      const deadline = new Date(
        Date.now() + (table.turnDeadlineHours || 24) * 60 * 60 * 1000
      );

      // Create async turn
      const turn = await prisma.asyncTurn.create({
        data: {
          id: nanoid(),
          tableId,
          userId: currentUserId,
          deadline,
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      // Broadcast turn start
      req.io.to(`table:${tableId}`).emit('async:turn-started', { turn });

      res.status(201).json({ turn });
    } catch (error) {
      next(error);
    }
  },

  /**
   * End current turn and advance to next player
   * POST /api/tables/:tableId/async/turns/:turnId/end
   */
  async endTurn(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId, turnId } = req.params;
      const userId = req.user!.id;

      // Verify user is DM
      const table = await prisma.table.findUnique({
        where: { id: tableId },
      });

      if (!table || table.ownerId !== userId) {
        return res.status(403).json({ error: 'Only DM can end turns' });
      }

      // End current turn
      await prisma.asyncTurn.update({
        where: { id: turnId },
        data: { endedAt: new Date() },
      });

      // Advance to next player
      const turnOrder = table.turnOrder as string[];
      const nextIndex = (table.currentTurnIndex + 1) % turnOrder.length;

      await prisma.table.update({
        where: { id: tableId },
        data: { currentTurnIndex: nextIndex },
      });

      // Start next turn
      const nextUserId = turnOrder[nextIndex];
      const deadline = new Date(
        Date.now() + (table.turnDeadlineHours || 24) * 60 * 60 * 1000
      );

      const nextTurn = await prisma.asyncTurn.create({
        data: {
          id: nanoid(),
          tableId,
          userId: nextUserId,
          deadline,
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
        },
      });

      // Broadcast turn change
      req.io.to(`table:${tableId}`).emit('async:turn-changed', {
        endedTurn: turnId,
        newTurn: nextTurn,
      });

      res.json({ turn: nextTurn });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current active turn
   * GET /api/tables/:tableId/async/turn
   */
  async getCurrentTurn(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId } = req.params;

      const turn = await prisma.asyncTurn.findFirst({
        where: {
          tableId,
          endedAt: null, // Active turn
        },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              user: {
                select: { id: true, username: true, avatar: true },
              },
              character: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      if (!turn) {
        return res.status(404).json({ error: 'No active turn' });
      }

      res.json({ turn });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get turn history
   * GET /api/tables/:tableId/async/turns/history
   */
  async getTurnHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId } = req.params;
      const { limit = '20' } = req.query;

      const turns = await prisma.asyncTurn.findMany({
        where: { tableId },
        include: {
          user: {
            select: { id: true, username: true, avatar: true },
          },
          messages: {
            select: { id: true },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: Number(limit),
      });

      res.json({ turns });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Set turn order for async table
   * POST /api/tables/:tableId/async/turn-order
   */
  async setTurnOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { tableId } = req.params;
      const userId = req.user!.id;
      const { turnOrder } = req.body; // Array of userIds

      // Verify user is DM
      const table = await prisma.table.findUnique({
        where: { id: tableId },
      });

      if (!table || table.ownerId !== userId) {
        return res.status(403).json({ error: 'Only DM can set turn order' });
      }

      // Validate all users are table members
      const members = await prisma.tableMember.findMany({
        where: { tableId },
        select: { userId: true },
      });

      const memberIds = members.map((m) => m.userId);
      const invalid = turnOrder.filter((id: string) => !memberIds.includes(id));

      if (invalid.length > 0) {
        return res.status(400).json({ error: 'Invalid user IDs in turn order' });
      }

      // Update table
      await prisma.table.update({
        where: { id: tableId },
        data: {
          turnOrder,
          currentTurnIndex: 0,
        },
      });

      res.json({ turnOrder });
    } catch (error) {
      next(error);
    }
  },
};
