import { Router } from 'express';
import { 
    getPrizes, 
    getPrize, 
    createPrize, 
    updatePrize, 
    deletePrize,
    getPrizeStats,
    getPrizeActivity
} from '../controllers/prizes.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Stats routes
router.get('/stats', authenticateToken, getPrizeStats);
router.get('/activity', authenticateToken, getPrizeActivity);

// CRUD routes
router.get('/', authenticateToken, getPrizes);
router.get('/:id', authenticateToken, getPrize);
router.post('/', authenticateToken, createPrize);
router.put('/:id', authenticateToken, updatePrize);
router.delete('/:id', authenticateToken, deletePrize);

export default router;

