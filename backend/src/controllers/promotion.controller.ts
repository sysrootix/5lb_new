import { Request, Response } from 'express';
import { PromotionService } from '../services/promotion.service';

const promotionService = new PromotionService();

export const getPromotions = async (req: Request, res: Response) => {
    try {
        const promotions = await promotionService.getPromotions();
        res.json(promotions);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
};

export const getPromotionById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const promotion = await promotionService.getPromotionById(id);

        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' });
        }

        res.json(promotion);
    } catch (error) {
        console.error('Error fetching promotion:', error);
        res.status(500).json({ error: 'Failed to fetch promotion' });
    }
};
