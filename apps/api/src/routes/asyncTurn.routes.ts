import { Router } from 'express';
import { asyncTurnController } from '../controllers/asyncTurn.controller';

const router = Router();

// TODO: Add authentication middleware (Story 1.3)
// router.use(authenticate);

// Start a new async turn (DM only)
router.post('/:tableId/async/turns/start', asyncTurnController.startTurn);

// End current turn and advance (DM only)
router.post('/:tableId/async/turns/:turnId/end', asyncTurnController.endTurn);

// Get current active turn
router.get('/:tableId/async/turn', asyncTurnController.getCurrentTurn);

// Get turn history
router.get('/:tableId/async/turns/history', asyncTurnController.getTurnHistory);

// Set turn order (DM only)
router.post('/:tableId/async/turn-order', asyncTurnController.setTurnOrder);

export default router;
