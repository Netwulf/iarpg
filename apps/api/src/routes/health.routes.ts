import { Router } from 'express';
import { createSupabaseAdmin } from '@iarpg/db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    // Test Supabase connection using admin client (bypasses RLS)
    const supabaseAdmin = createSupabaseAdmin();
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (acceptable for empty table)
      throw error;
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      database: 'connected',
      backend: 'supabase',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      backend: 'supabase',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Database-specific health check
router.get('/db', async (req, res) => {
  try {
    // Simple connection test using admin client (bypasses RLS)
    const supabaseAdmin = createSupabaseAdmin();
    const { error } = await supabaseAdmin.from('users').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        backend: 'supabase',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: {
        connected: false,
        backend: 'supabase',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
