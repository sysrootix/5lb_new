import { Router } from 'express';
import * as rouletteController from '../controllers/roulette.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/status', authMiddleware, rouletteController.getStatus);
router.get('/items', authMiddleware, rouletteController.getItems);
router.post('/spin', authMiddleware, rouletteController.spin);

export default router;
