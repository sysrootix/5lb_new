import { Router } from 'express';
import { getPromotions, getPromotionById } from '../controllers/promotion.controller';

const router = Router();

router.get('/', getPromotions);
router.get('/:id', getPromotionById);

export default router;
