import { Request, Response } from 'express';
import { bonusService } from '../services/bonus.service';
import { logger } from '../config/logger';

export const getUserCards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const cards = await bonusService.getUserCards(userId);
    res.json({ success: true, data: cards });
  } catch (error) {
    logger.error('Get user cards error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const spinWheel = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const { purchaseAmount } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!purchaseAmount || purchaseAmount <= 0) {
        return res.status(400).json({ message: 'Invalid purchase amount' });
    }

    const result = await bonusService.spinWheel(userId, Number(purchaseAmount));
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('Spin wheel error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
