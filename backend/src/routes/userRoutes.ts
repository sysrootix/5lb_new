import { Router } from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/userFavoritesController';
import {
  getUserCart,
  addItemToUserCart,
  updateUserCartItem,
  removeItemFromUserCart,
  clearUserCart
} from '../controllers/userCartController';
import { getUserReferralStats, getReferrerByCode, recordClick, getReferralClickByTgId } from '../controllers/referralController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Избранное
router.get('/favorites', authenticate, getFavorites);
router.post('/favorites/:productId', authenticate, addFavorite);
router.delete('/favorites/:productId', authenticate, removeFavorite);

// Корзина
router.get('/cart', authenticate, getUserCart);
router.post('/cart', authenticate, addItemToUserCart);
router.put('/cart/:productId', authenticate, updateUserCartItem);
router.delete('/cart/:productId', authenticate, removeItemFromUserCart);
router.delete('/cart', authenticate, clearUserCart);

// Рефералы
router.get('/referrals/stats', authenticate, getUserReferralStats);
router.get('/referrals/referrer/:code', getReferrerByCode); // Публичный endpoint
router.post('/referrals/click', recordClick); // Публичный endpoint для записи клика
router.get('/referrals/click/:telegramId', getReferralClickByTgId); // Публичный endpoint для получения реферального кода

export default router;

