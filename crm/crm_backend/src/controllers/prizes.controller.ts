import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPrizes = async (req: Request, res: Response) => {
    try {
        const prizes = await prisma.prize.findMany({
            orderBy: { weight: 'desc' }
        });
        res.json(prizes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prizes' });
    }
};

export const getPrize = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const prize = await prisma.prize.findUnique({
            where: { id }
        });
        if (!prize) {
            return res.status(404).json({ error: 'Prize not found' });
        }
        res.json(prize);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prize' });
    }
};

export const createPrize = async (req: Request, res: Response) => {
    try {
        const { name, code, weight, isActive } = req.body;
        const prize = await prisma.prize.create({
            data: {
                name,
                code,
                weight: parseInt(weight),
                isActive
            }
        });
        res.json(prize);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create prize' });
    }
};

export const updatePrize = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, code, weight, isActive } = req.body;
        const prize = await prisma.prize.update({
            where: { id },
            data: {
                name,
                code,
                weight: parseInt(weight),
                isActive
            }
        });
        res.json(prize);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update prize' });
    }
};

export const deletePrize = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.prize.delete({
            where: { id }
        });
        res.json({ message: 'Prize deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete prize' });
    }
};

export const getPrizeStats = async (req: Request, res: Response) => {
    try {
        const totalCodes = await prisma.prizeCode.count();
        const usedCodes = await prisma.prizeCode.count({ where: { used: true } });
        
        // Conversion rate
        const conversionRate = totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0;

        // Daily usage stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyUsage = await prisma.prizeCode.groupBy({
            by: ['usedAt'],
            where: {
                used: true,
                usedAt: {
                    gte: thirtyDaysAgo
                }
            },
            _count: {
                _all: true
            }
        });

        // Process daily usage to group by date (ignoring time)
        const dailyStats = new Map<string, number>();
        dailyUsage.forEach(item => {
            if (item.usedAt) {
                const date = item.usedAt.toISOString().split('T')[0];
                dailyStats.set(date, (dailyStats.get(date) || 0) + item._count._all);
            }
        });

        const chartData = Array.from(dailyStats.entries()).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => a.date.localeCompare(b.date));

        // Prize distribution (which prizes are won most)
        const prizeDistribution = await prisma.prizeCode.groupBy({
            by: ['prizeName'],
            _count: {
                _all: true
            }
        });

        res.json({
            summary: {
                totalCodes,
                usedCodes,
                conversionRate
            },
            chartData,
            prizeDistribution: prizeDistribution.map(p => ({
                name: p.prizeName,
                count: p._count._all
            }))
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch prize stats' });
    }
};

export const getPrizeActivity = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            prisma.prizeCode.findMany({
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    prizeName: true,
                    used: true,
                    usedAt: true,
                    createdAt: true,
                    telegramId: true
                }
            }),
            prisma.prizeCode.count()
        ]);

        res.json({
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch prize activity' });
    }
};
