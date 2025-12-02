import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get all roulette items with management controls
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const items = await prisma.rouletteItem.findMany({
            orderBy: { amount: 'asc' },
        });
        res.json(items);
    } catch (error) {
        console.error('Failed to fetch roulette items:', error);
        res.status(500).json({ error: 'Failed to fetch roulette items' });
    }
});

// Get roulette statistics
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
    try {
        // Total spins
        const totalSpins = await prisma.rouletteLog.count();

        // Total bonuses distributed
        const totalBonuses = await prisma.rouletteLog.aggregate({
            _sum: { amount: true },
        });

        // Distribution by amount
        const distribution = await prisma.rouletteLog.groupBy({
            by: ['amount'],
            _count: { amount: true },
            orderBy: { amount: 'asc' },
        });

        // Recent spins with user info
        const recentSpins = await prisma.rouletteLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        telegramId: true,
                    },
                },
            },
        });

        // Items stats - count how many times each item was won
        const items = await prisma.rouletteItem.findMany({
            orderBy: { amount: 'asc' },
        });

        const itemStats = await Promise.all(
            items.map(async (item) => {
                const count = await prisma.rouletteLog.count({
                    where: { amount: item.amount },
                });
                return {
                    ...item,
                    timesWon: count,
                };
            })
        );

        res.json({
            totalSpins,
            totalBonuses: totalBonuses._sum.amount || 0,
            distribution,
            recentSpins,
            itemStats,
        });
    } catch (error) {
        console.error('Failed to fetch roulette stats:', error);
        res.status(500).json({ error: 'Failed to fetch roulette stats' });
    }
});

// Create new roulette item
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { amount, probability, color, isActive } = req.body;

        if (!amount || probability === undefined) {
            return res.status(400).json({ error: 'Amount and probability are required' });
        }

        const item = await prisma.rouletteItem.create({
            data: {
                name: `${amount} бонусов`,
                amount,
                probability,
                color,
                isActive: isActive !== undefined ? isActive : true,
            },
        });

        res.status(201).json(item);
    } catch (error) {
        console.error('Failed to create roulette item:', error);
        res.status(500).json({ error: 'Failed to create roulette item' });
    }
});

// Update roulette item
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, probability, color, isActive } = req.body;

        const item = await prisma.rouletteItem.update({
            where: { id },
            data: {
                name: amount ? `${amount} бонусов` : undefined,
                amount,
                probability,
                color,
                isActive,
            },
        });

        res.json(item);
    } catch (error) {
        console.error('Failed to update roulette item:', error);
        res.status(500).json({ error: 'Failed to update roulette item' });
    }
});

// Delete roulette item
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.rouletteItem.delete({
            where: { id },
        });

        res.json({ message: 'Roulette item deleted successfully' });
    } catch (error) {
        console.error('Failed to delete roulette item:', error);
        res.status(500).json({ error: 'Failed to delete roulette item' });
    }
});

export default router;
