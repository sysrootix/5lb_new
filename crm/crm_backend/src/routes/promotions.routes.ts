import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth.middleware';
import * as PromotionController from '../controllers/promotions.controller';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ 
    storage, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB upload limit
});

router.get('/', authenticateToken, PromotionController.getAllPromotions);
router.post('/', authenticateToken, upload.single('image'), PromotionController.createPromotion);
router.put('/:id', authenticateToken, upload.single('image'), PromotionController.updatePromotion);
router.delete('/:id', authenticateToken, PromotionController.deletePromotion);

export default router;

