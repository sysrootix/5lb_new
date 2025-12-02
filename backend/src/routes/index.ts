import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import catalogRoutes from './catalogRoutes';
import anonymousRoutes from './anonymousRoutes';
import userRoutes from './userRoutes';
import prizeRoutes from './prizeRoutes';
import bonusRoutes from './bonusRoutes';

import promotionRoutes from './promotion.routes';
import bannerRoutes from './banner.routes';
import storyRoutes from './story.routes';
import newsRoutes from './news.routes';
import miscRoutes from './miscRoutes';

import rouletteRoutes from './roulette.routes';
import walletRoutes from './walletRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/catalog', catalogRoutes);
router.use('/anonymous', anonymousRoutes);
router.use('/users', userRoutes);
router.use('/bonuses', bonusRoutes);
router.use('/promotions', promotionRoutes);
router.use('/banners', bannerRoutes);
router.use('/stories', storyRoutes);
router.use('/news', newsRoutes);
router.use('/misc', miscRoutes);
router.use('/roulette', rouletteRoutes);
router.use('/wallet', walletRoutes);
router.use('/', prizeRoutes); // Роуты призов на корневом уровне (/api/spin, /api/prize/:hash и т.д.)

export default router;
