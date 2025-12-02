import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNews = async (req: Request, res: Response) => {
    try {
        const news = await prisma.news.findMany({
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
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
};

export const createNews = async (req: Request, res: Response) => {
    try {
        const { title, description, imageUrl, link, startDate, endDate, priority } = req.body;
        const news = await prisma.news.create({
            data: {
                title,
                description,
                imageUrl,
                link,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                priority: priority || 0
            }
        });
        res.json(news);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news' });
    }
};

export const deleteNews = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.news.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
};
