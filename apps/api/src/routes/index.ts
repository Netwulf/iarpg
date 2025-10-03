import { Router } from 'express';
import healthRoutes from './health.routes';
import charactersRoutes from './characters.routes';
import tablesRoutes from './tables.routes';
import diceRoutes from './dice.routes';
import combatRoutes from './combat.routes';
import aiRoutes from './ai.routes';
import asyncTurnRoutes from './asyncTurn.routes';
// Future stories will import more routes:
// import authRoutes from './auth.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/characters', charactersRoutes);
router.use('/tables', tablesRoutes);
router.use('/tables', diceRoutes);
router.use('/tables', combatRoutes);
router.use('/tables', asyncTurnRoutes); // Story 7.1 - Async Play Mode
router.use('/ai', aiRoutes);
// Future routes:
// router.use('/auth', authRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
    },
  });
});

export { router };
