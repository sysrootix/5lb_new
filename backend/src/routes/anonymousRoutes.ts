import { Router } from 'express';
import {
  initAnonymousUser,
  getAnonymousFavorites,
  addAnonymousFavorite,
  removeAnonymousFavorite,
  migrateAnonymousData
} from '../controllers/anonymousUserController';
import {
  getAnonymousCart,
  addItemToCart,
  updateCartItem,
  removeItemFromCart,
  clearAnonymousCart
} from '../controllers/cartController';
import { identifyAnonymous, requireAnonymous } from '../middleware/anonymousAuth';
import { authenticate } from '../middleware/auth';

const router = Router();

// Инициализация анонимного пользователя
router.post('/init', initAnonymousUser);

// Получение избранного
router.get('/favorites', requireAnonymous, getAnonymousFavorites);

// Добавление в избранное
router.post('/favorites/:productId', requireAnonymous, addAnonymousFavorite);

// Удаление из избранного
router.delete('/favorites/:productId', requireAnonymous, removeAnonymousFavorite);

// Получение корзины
router.get('/cart', requireAnonymous, getAnonymousCart);

// Добавление товара в корзину
router.post('/cart', requireAnonymous, addItemToCart);

// Обновление товара в корзине
router.put('/cart/:productId', requireAnonymous, updateCartItem);

// Удаление товара из корзины
router.delete('/cart/:productId', requireAnonymous, removeItemFromCart);

// Очистка корзины
router.delete('/cart', requireAnonymous, clearAnonymousCart);

// Миграция данных при авторизации (требует авторизации)
router.post('/migrate', identifyAnonymous, authenticate, migrateAnonymousData);

export default router;


