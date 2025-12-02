import { Router } from 'express';
import { getDashboardStats } from '../controllers/stats.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticateToken, getDashboardStats);

export default router;



