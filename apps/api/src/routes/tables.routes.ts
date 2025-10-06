import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { getIO } from '../socket';
import { supabase } from '@iarpg/db';

const router = Router();

// All table routes require authentication
router.use(authMiddleware);

// Generate unique invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate unique invite code with collision check
async function generateUniqueInviteCode(): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateInviteCode();

    // Check if code already exists
    const { data } = await (supabase
      .from('tables') as any)
      .select('id')
      .eq('invite_code', code)
      .single();

    if (!data) {
      return code; // Unique code found!
    }

    // Code exists, try again
    console.log(`Invite code collision detected: ${code}, retrying...`);
  }

  throw new AppError('Failed to generate unique invite code after 10 attempts', 500, 'CODE_GENERATION_FAILED');
}

// POST /api/tables - Create a new table
router.post('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      name,
      description,
      playStyle,
      privacy,
      maxPlayers,
      schedule,
      tags,
    } = req.body;

    // Validation
    if (!name || !playStyle || !privacy) {
      throw new AppError('Name, play style, and privacy are required', 400, 'VALIDATION_ERROR');
    }

    if (name.length < 3 || name.length > 50) {
      throw new AppError('Name must be between 3 and 50 characters', 400, 'VALIDATION_ERROR');
    }

    if (!['sync', 'async', 'solo'].includes(playStyle)) {
      throw new AppError('Play style must be sync, async, or solo', 400, 'VALIDATION_ERROR');
    }

    if (!['private', 'public', 'spectator'].includes(privacy)) {
      throw new AppError('Privacy must be private, public, or spectator', 400, 'VALIDATION_ERROR');
    }

    const maxPlayersNum = maxPlayers || 6;
    if (maxPlayersNum < 2 || maxPlayersNum > 8) {
      throw new AppError('Max players must be between 2 and 8', 400, 'VALIDATION_ERROR');
    }

    // Generate unique invite code (with collision detection)
    const inviteCode = await generateUniqueInviteCode();

    // Create table in Supabase
    const { data: table, error } = await (supabase
      .from('tables') as any)
      .insert({
        owner_id: userId,
        name,
        description: description || '',
        play_style: playStyle,
        privacy,
        invite_code: inviteCode,
        state: 'setup',
        schedule: schedule || null,
        max_players: maxPlayersNum,
        tags: tags || [],
        rules_variant: 'standard',
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating table:', error);
      throw new AppError('Failed to create table', 500, 'DATABASE_ERROR');
    }

    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
});

// GET /api/tables - Get user's tables (owned or member of)
router.get('/', async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const {
      search,
      playStyles,
      tags,
      page = '1',
      limit = '12',
    } = req.query;

    // Parse filters
    const playStylesArray = playStyles ? (Array.isArray(playStyles) ? playStyles : [playStyles]) : [];
    const tagsArray = tags ? (Array.isArray(tags) ? tags : [tags]) : [];
    const pageNum = parseInt(page as string) || 1;
    const limitNum = Math.min(parseInt(limit as string) || 12, 50);
    const offset = (pageNum - 1) * limitNum;

    // Build query for tables user owns or is a member of
    let query = (supabase
      .from('tables') as any)
      .select(`
        *,
        owner:users!owner_id (
          id,
          username,
          avatar_url
        ),
        members:table_members(count)
      `, { count: 'exact' });

    // Filter by tables user owns or is member of
    // This needs to be done via OR condition or separate queries
    // For now, let's get tables user owns
    const { data: ownedTables, error: ownedError } = await query
      .eq('owner_id', userId)
      .order('last_activity_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Get tables user is member of
    const { data: memberTables, error: memberError } = await (supabase
      .from('table_members') as any)
      .select(`
        table:tables!table_id (
          *,
          owner:users!owner_id (
            id,
            username,
            avatar_url
          ),
          members:table_members(count)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    if (ownedError || memberError) {
      console.error('Supabase error fetching tables:', ownedError || memberError);
      throw new AppError('Failed to fetch tables', 500, 'DATABASE_ERROR');
    }

    // Combine and deduplicate tables
    const allTables = [...(ownedTables || [])];
    const ownedIds = new Set(ownedTables?.map((t: any) => t.id) || []);

    memberTables?.forEach((mt: any) => {
      if (mt.table && !ownedIds.has(mt.table.id)) {
        allTables.push(mt.table);
      }
    });

    // Sort by last activity
    allTables.sort((a, b) =>
      new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
    );

    // Apply search filter if provided
    let filteredTables = allTables;
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredTables = allTables.filter((t: any) =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply filters
    if (playStylesArray.length > 0) {
      filteredTables = filteredTables.filter((t: any) =>
        playStylesArray.includes(t.play_style)
      );
    }

    if (tagsArray.length > 0) {
      filteredTables = filteredTables.filter((t: any) =>
        t.tags?.some((tag: string) => tagsArray.includes(tag))
      );
    }

    const total = filteredTables.length;
    const paginatedTables = filteredTables.slice(offset, offset + limitNum);

    res.json({
      tables: paginatedTables,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/tables/by-code/:code - Get table by invite code
router.get('/by-code/:code', async (req, res, next) => {
  try {
    const { code } = req.params;

    if (!code || code.length !== 6) {
      throw new AppError('Invalid invite code', 400, 'VALIDATION_ERROR');
    }

    // Fetch table by invite code from Supabase
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select(`
        *,
        owner:users!owner_id (
          id,
          username,
          avatar_url
        ),
        members:table_members (
          id,
          role,
          status,
          joined_at,
          user:users!user_id (
            id,
            username,
            avatar_url
          ),
          character:characters!character_id (
            id,
            name,
            class,
            level
          )
        )
      `)
      .eq('invite_code', code.toUpperCase())
      .single();

    if (tableError) {
      if (tableError.code === 'PGRST116') {
        throw new AppError('Table not found', 404, 'NOT_FOUND');
      }
      console.error('Supabase error fetching table by code:', tableError);
      throw new AppError('Failed to fetch table', 500, 'DATABASE_ERROR');
    }

    res.json({ table });
  } catch (error) {
    next(error);
  }
});

// GET /api/tables/:id - Get specific table with members
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch table with members from Supabase
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select(`
        *,
        owner:users!owner_id (
          id,
          username,
          avatar_url
        ),
        members:table_members (
          id,
          role,
          status,
          joined_at,
          user:users!user_id (
            id,
            username,
            avatar_url,
            online_status,
            last_seen_at
          ),
          character:characters!character_id (
            id,
            name,
            class,
            level,
            avatar_url
          )
        )
      `)
      .eq('id', id)
      .single();

    if (tableError) {
      if (tableError.code === 'PGRST116') {
        throw new AppError('Table not found', 404, 'NOT_FOUND');
      }
      console.error('Supabase error fetching table:', tableError);
      throw new AppError('Failed to fetch table', 500, 'DATABASE_ERROR');
    }

    res.json({ table });
  } catch (error) {
    next(error);
  }
});

// POST /api/tables/:id/join - Join a table
router.post('/:id/join', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const userId = req.user!.id;
    const { characterId } = req.body;

    if (!characterId) {
      throw new AppError('Character ID is required', 400, 'VALIDATION_ERROR');
    }

    // 1. Verify table exists and has space
    const { data: table, error: tableError } = await (supabase
      .from('tables') as any)
      .select('id, max_players, members:table_members(count)')
      .eq('id', tableId)
      .single();

    if (tableError || !table) {
      throw new AppError('Table not found', 404, 'NOT_FOUND');
    }

    const currentMemberCount = table.members?.[0]?.count || 0;
    if (currentMemberCount >= table.max_players) {
      throw new AppError('Table is full', 400, 'TABLE_FULL');
    }

    // 2. Check if user is already a member
    const { data: existingMember } = await (supabase
      .from('table_members') as any)
      .select('id')
      .eq('table_id', tableId)
      .eq('user_id', userId)
      .single();

    if (existingMember) {
      throw new AppError('Already a member of this table', 400, 'ALREADY_MEMBER');
    }

    // 3. Verify user owns the character
    const { data: character, error: charError } = await (supabase
      .from('characters') as any)
      .select('id, user_id')
      .eq('id', characterId)
      .single();

    if (charError || !character) {
      throw new AppError('Character not found', 404, 'NOT_FOUND');
    }

    if (character.user_id !== userId) {
      throw new AppError('You do not own this character', 403, 'FORBIDDEN');
    }

    // 4. Create TableMember record
    const { data: member, error: memberError } = await (supabase
      .from('table_members') as any)
      .insert({
        table_id: tableId,
        user_id: userId,
        character_id: characterId,
        role: 'player',
        status: 'active',
      })
      .select(`
        id,
        role,
        status,
        joined_at,
        user:users!user_id (
          id,
          username,
          avatar_url
        ),
        character:characters!character_id (
          id,
          name,
          class,
          level
        )
      `)
      .single();

    if (memberError) {
      console.error('Supabase error creating table member:', memberError);
      throw new AppError('Failed to join table', 500, 'DATABASE_ERROR');
    }

    // 5. Update table last_activity_at
    await (supabase
      .from('tables') as any)
      .update({ last_activity_at: new Date().toISOString() })
      .eq('id', tableId);

    res.status(200).json({
      message: 'Successfully joined table',
      member
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/tables/:id/messages - Send a message
router.post('/:id/messages', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const userId = req.user!.id;
    const { content, type = 'ic', character_id = null } = req.body;

    if (!content || !content.trim()) {
      throw new AppError('Message content is required', 400, 'VALIDATION_ERROR');
    }

    if (content.length > 1000) {
      throw new AppError('Message too long (max 1000 characters)', 400, 'VALIDATION_ERROR');
    }

    // Validate message type
    const validTypes = ['ic', 'ooc', 'dm-note', 'system'] as const;
    if (!validTypes.includes(type as any)) {
      throw new AppError('Invalid message type', 400, 'VALIDATION_ERROR');
    }

    // Insert message into Supabase
    const { data: message, error } = await (supabase
      .from('messages') as any)
      .insert({
        table_id: tableId,
        user_id: userId,
        character_id,
        content: content.trim(),
        type: type as 'ic' | 'ooc' | 'dm-note' | 'system',
        dice_rolls: [],
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

    if (error) {
      console.error('Supabase error creating message:', error);
      throw new AppError('Failed to save message', 500, 'DATABASE_ERROR');
    }

    // Broadcast message via Socket.io
    const io = getIO();
    io.to(`table:${tableId}`).emit('message:new', message);

    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

// GET /api/tables/:id/messages - Get message history
router.get('/:id/messages', async (req, res, next) => {
  try {
    const { id: tableId } = req.params;
    const { limit = '50', before } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 50, 100); // Max 100 messages per request

    // Query messages with pagination
    let query = (supabase
      .from('messages') as any)
      .select(`
        *,
        user:users!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('table_id', tableId)
      .order('created_at', { ascending: false })
      .limit(limitNum);

    // If 'before' timestamp is provided, get messages before that time
    if (before) {
      query = query.lt('created_at', before as string);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('Supabase error fetching messages:', error);
      throw new AppError('Failed to fetch messages', 500, 'DATABASE_ERROR');
    }

    // Reverse to get chronological order (oldest first)
    const chronologicalMessages = (messages || []).reverse();

    res.json({
      messages: chronologicalMessages,
      hasMore: messages?.length === limitNum, // Indicate if there might be more messages
    });
  } catch (error) {
    next(error);
  }
});

export default router;
