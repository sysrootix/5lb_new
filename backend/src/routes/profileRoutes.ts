import { Router } from 'express';
import * as profileController from '../controllers/profileController';
import { authMiddleware } from '../middleware/authMiddleware';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload';

const router = Router();

router.get('/', authMiddleware, profileController.getProfile);
router.patch('/', authMiddleware, profileController.updateProfile);
router.post('/avatar', authMiddleware, uploadAvatarMiddleware.single('avatar'), profileController.uploadAvatar);
router.post('/phone/request', authMiddleware, profileController.requestPhoneChange);
router.post('/phone/confirm', authMiddleware, profileController.confirmPhoneChange);
router.post('/telegram/link', authMiddleware, profileController.linkTelegram);
router.post('/telegram/unlink', authMiddleware, profileController.unlinkTelegram);
router.delete('/account', authMiddleware, profileController.deleteAccount);

export default router;
