import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { identifyAnonymous } from '../middleware/anonymousAuth';

const router = Router();

// Публичные роуты (с опциональной идентификацией анонимного пользователя)
router.post('/login', identifyAnonymous, authController.loginWithPhone);
router.post('/verify', identifyAnonymous, authController.verifyPhoneCode);
router.get('/telegram/config', authController.getTelegramConfig);
router.post('/telegram', identifyAnonymous, authController.loginWithTelegram);
router.post('/telegram/register', identifyAnonymous, authController.registerWithTelegram); // Регистрация нового пользователя через Telegram
router.post('/refresh', authController.refreshToken);
router.post('/complete-registration', authenticate, authController.completeRegistration); // Требует токен для обновления существующего пользователя

// OAuth routes
router.get('/oauth/google/url', authController.getGoogleAuthUrlHandler);
router.get('/oauth/yandex/url', authController.getYandexAuthUrlHandler);
router.get('/oauth/apple/url', authController.getAppleAuthUrlHandler);
router.get('/oauth/google/callback', identifyAnonymous, authController.googleOAuthCallback);
router.get('/yandex/callback', identifyAnonymous, authController.yandexOAuthCallback);
router.post('/oauth/apple/callback', identifyAnonymous, authController.appleOAuthCallback);

// Защищенные роуты (требуют аутентификации)
router.post('/logout', authenticate, authController.logout);
router.post('/logout-all', authenticate, authController.logoutAllDevices);

export default router;
