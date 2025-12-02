import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получить активные истории для главной страницы
 */
export const getStories = async (req: Request, res: Response) => {
    try {
        const stories = await prisma.story.findMany({
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
            include: {
                pages: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            },
            orderBy: {
                priority: 'desc'
            }
        });
        res.json(stories);
    } catch (error) {
        console.error('Error fetching stories:', error);
        res.status(500).json({ error: 'Failed to fetch stories' });
    }
};

/**
 * Получить конкретную историю по ID с медиа
 */
export const getStoryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const story = await prisma.story.findUnique({
            where: { id },
            include: {
                pages: {
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!story) {
            return res.status(404).json({ error: 'Story not found' });
        }

        res.json(story);
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).json({ error: 'Failed to fetch story' });
    }
};

/**
 * Создать новую историю
 */
export const createStory = async (req: Request, res: Response) => {
    try {
        const { title, previewImage, link, priority, startDate, endDate, pages } = req.body;

        const story = await prisma.story.create({
            data: {
                title,
                previewImage,
                link,
                priority: priority || 0,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                pages: pages ? {
                    create: pages.map((p: any, index: number) => ({
                        type: p.type,
                        url: p.url,
                        order: p.order ?? index,
                        duration: p.duration,
                        content: p.content,
                        link: p.link
                    }))
                } : undefined
            },
            include: {
                pages: true
            }
        });

        res.json(story);
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ error: 'Failed to create story' });
    }
};

/**
 * Удалить историю
 */
export const deleteStory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.story.delete({
            where: { id }
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({ error: 'Failed to delete story' });
    }
};
