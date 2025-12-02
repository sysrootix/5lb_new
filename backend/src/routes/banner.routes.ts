import { Router } from 'express';
import { getBanners, createBanner, deleteBanner } from '../controllers/banner.controller';

const router = Router();

router.get('/', getBanners);
router.post('/', createBanner);
router.delete('/:id', deleteBanner);

export default router;
