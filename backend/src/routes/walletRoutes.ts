import { Router } from 'express';
import {
  generateAppleWalletPass,
  generateGoogleWalletPass,
  getCardDataForWallet,
} from '../controllers/walletController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Все маршруты требуют аутентификации
router.use(authMiddleware);

// Apple Wallet
router.get('/apple/:cardId', generateAppleWalletPass);

// Google Wallet
router.get('/google/:cardId', generateGoogleWalletPass);

// Получить данные карты для wallet
router.get('/data/:cardId', getCardDataForWallet);

export default router;
