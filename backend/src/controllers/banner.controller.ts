import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBanners = async (req: Request, res: Response) => {
    try {
        const banners = await prisma.banner.findMany({
            where: {
                isActive: true,
                OR: [
                    { startDate: null },
                    { startDate: { lte: new Date() } }
                ],
                AND: [
                    {
                        OR: [
                            { endDate: null },
                            { endDate: { gte: new Date() } }
                        ]
                    }
                ]
            },
            orderBy: {
                priority: 'desc'
            }
        });
        res.json(banners);
    } catch (error) {
        console.error('Error fetching banners:', error);
        res.status(500).json({ error: 'Failed to fetch banners' });
    }
};

export const createBanner = async (req: Request, res: Response) => {
    try {
        const { imageUrl, title, link, startDate, endDate, priority } = req.body;
        const banner = await prisma.banner.create({
            data: {
                imageUrl,
                title,
                link,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                priority: priority || 0
            }
        });
        res.json(banner);
    } catch (error) {
        console.error('Error creating banner:', error);
        res.status(500).json({ error: 'Failed to create banner' });
    }
};

export const deleteBanner = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.banner.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting banner:', error);
        res.status(500).json({ error: 'Failed to delete banner' });
    }
};
