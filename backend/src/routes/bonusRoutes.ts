import { Router } from 'express';
import { getUserCards, spinWheel } from '../controllers/bonus.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/cards', authenticate, getUserCards);
router.post('/spin', authenticate, spinWheel);

export default router;
