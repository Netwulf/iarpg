import { Request, Response, NextFunction } from 'express';
import { supabase } from '@iarpg/db';
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
      const { data: table, error: tableError } = await (supabase
        .from('tables') as any)
        .select('*')
        .eq('id', tableId)
        .single();

      if (tableError || !table || table.owner_id !== userId) {
        return res.status(403).json({ error: 'Only DM can start turns' });
      }

      if (table.play_style !== 'async') {
        return res.status(400).json({ error: 'Table is not in async mode' });
      }

      // Get turn order
      const turnOrder = table.turn_order as string[];
      if (!turnOrder || turnOrder.length === 0) {
        return res.status(400).json({ error: 'Turn order not set' });
      }

      const currentUserId = turnOrder[table.current_turn_index || 0];
      const deadline = new Date(
        Date.now() + (table.turn_deadline_hours || 24) * 60 * 60 * 1000
      );

      // Create async turn
      const { data: turn, error: turnError } = await (supabase
        .from('async_turns') as any)
        .insert({
          id: nanoid(),
          table_id: tableId,
          user_id: currentUserId,
          deadline: deadline.toISOString(),
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

      if (turnError) {
        console.error('Error creating async turn:', turnError);
        return res.status(500).json({ error: 'Failed to create async turn' });
      }

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
      const { data: table, error: tableError } = await (supabase
        .from('tables') as any)
        .select('*')
        .eq('id', tableId)
        .single();

      if (tableError || !table || table.owner_id !== userId) {
        return res.status(403).json({ error: 'Only DM can end turns' });
      }

      // End current turn
      await (supabase
        .from('async_turns') as any)
        .update({ ended_at: new Date().toISOString() })
        .eq('id', turnId);

      // Advance to next player
      const turnOrder = table.turn_order as string[];
      const nextIndex = ((table.current_turn_index || 0) + 1) % turnOrder.length;

      await (supabase
        .from('tables') as any)
        .update({ current_turn_index: nextIndex })
        .eq('id', tableId);

      // Start next turn
      const nextUserId = turnOrder[nextIndex];
      const deadline = new Date(
        Date.now() + (table.turn_deadline_hours || 24) * 60 * 60 * 1000
      );

      const { data: nextTurn, error: nextTurnError } = await (supabase
        .from('async_turns') as any)
        .insert({
          id: nanoid(),
          table_id: tableId,
          user_id: nextUserId,
          deadline: deadline.toISOString(),
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

      if (nextTurnError) {
        console.error('Error creating next turn:', nextTurnError);
        return res.status(500).json({ error: 'Failed to create next turn' });
      }

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

      const { data: turn, error: turnError } = await (supabase
        .from('async_turns') as any)
        .select(`
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('table_id', tableId)
        .is('ended_at', null)
        .maybeSingle();

      if (turnError) {
        console.error('Error fetching current turn:', turnError);
        return res.status(500).json({ error: 'Failed to fetch current turn' });
      }

      if (!turn) {
        return res.status(404).json({ error: 'No active turn' });
      }

      // Fetch messages for this turn
      const { data: messages, error: messagesError } = await (supabase
        .from('messages') as any)
        .select(`
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          ),
          character:characters!character_id (
            id,
            name
          )
        `)
        .eq('async_turn_id', turn.id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching turn messages:', messagesError);
      }

      res.json({ turn: { ...turn, messages: messages || [] } });
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

      const { data: turns, error: turnsError } = await (supabase
        .from('async_turns') as any)
        .select(`
          *,
          user:users!user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('table_id', tableId)
        .order('started_at', { ascending: false })
        .limit(Number(limit));

      if (turnsError) {
        console.error('Error fetching turn history:', turnsError);
        return res.status(500).json({ error: 'Failed to fetch turn history' });
      }

      // Get message counts for each turn
      const turnsWithCounts = await Promise.all(
        (turns || []).map(async (turn: any) => {
          const { count } = await (supabase
            .from('messages') as any)
            .select('*', { count: 'exact', head: true })
            .eq('async_turn_id', turn.id);

          return { ...turn, messages: [{ count: count || 0 }] };
        })
      );

      res.json({ turns: turnsWithCounts });
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
      const { data: table, error: tableError } = await (supabase
        .from('tables') as any)
        .select('*')
        .eq('id', tableId)
        .single();

      if (tableError || !table || table.owner_id !== userId) {
        return res.status(403).json({ error: 'Only DM can set turn order' });
      }

      // Validate all users are table members
      const { data: members, error: membersError } = await (supabase
        .from('table_members') as any)
        .select('user_id')
        .eq('table_id', tableId);

      if (membersError) {
        console.error('Error fetching table members:', membersError);
        return res.status(500).json({ error: 'Failed to validate turn order' });
      }

      const memberIds = (members || []).map((m: any) => m.user_id);
      const invalid = turnOrder.filter((id: string) => !memberIds.includes(id));

      if (invalid.length > 0) {
        return res.status(400).json({ error: 'Invalid user IDs in turn order' });
      }

      // Update table
      await (supabase
        .from('tables') as any)
        .update({
          turn_order: turnOrder,
          current_turn_index: 0,
        })
        .eq('id', tableId);

      res.json({ turnOrder });
    } catch (error) {
      next(error);
    }
  },
};
