import { Router } from 'express';
import { login, changePassword, refreshToken } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/change-password', authenticateToken, changePassword);

export default router;
