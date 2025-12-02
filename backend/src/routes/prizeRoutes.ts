import { Router } from 'express';
import cors from 'cors';
import {
  spin,
  getPrizeByHash,
  healthCheck,
  getPrizes
} from '../controllers/prizeController';

const router = Router();

// CORS для роутов призов - разрешаем все источники
const prizeCorsOptions = {
  origin: true, // Разрешаем все источники
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Применяем CORS ко всем роутам призов
router.use(cors(prizeCorsOptions));

// =====================================================
// ПУБЛИЧНЫЕ РОУТЫ (не требуют авторизации)
// =====================================================

/**
 * POST /api/spin
 * Крутить колесо фортуны и получить приз
 */
router.post('/spin', spin);

/**
 * GET /api/prize/:hash
 * Получить информацию о призе по хешу (для Telegram бота)
 */
router.get('/prize/:hash', getPrizeByHash);

/**
 * GET /api/prizes
 * Получить список всех призов с вероятностями (для отладки)
 */
router.get('/prizes', getPrizes);

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', healthCheck);

export default router;

