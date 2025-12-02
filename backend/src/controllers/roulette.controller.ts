import { Request, Response, NextFunction } from 'express';
import { rouletteService } from '../services/roulette.service';

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const isEligible = await rouletteService.checkEligibility(userId);
        res.json({ isEligible });
    } catch (error) {
        next(error);
    }
};

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const items = await rouletteService.getItems();
        res.json(items);
    } catch (error) {
        next(error);
    }
};

export const spin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const result = await rouletteService.spin(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
};
