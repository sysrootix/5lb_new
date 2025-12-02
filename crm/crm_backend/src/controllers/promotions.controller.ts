import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads/promotion');
const BASE_URL = process.env.BASE_URL || 'https://crm.5lb.pro';

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const getAllPromotions = async (req: Request, res: Response) => {
    try {
        const promotions = await prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(promotions);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при получении акций' });
    }
};

export const createPromotion = async (req: Request, res: Response) => {
    try {
        const { title, description, startDate, endDate, link, showBeforeStart } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'Изображение обязательно' });
        }

        // Generate filename
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
        const filepath = path.join(UPLOAD_DIR, filename);

        // Compress and save image
        await sharp(file.buffer)
            .resize(800) // Reasonable max width
            .png({ quality: 80 }) // Compress
            .toFile(filepath);

        // URL should be /crm-api/uploads/... so nginx proxies it to backend /api/uploads/...
        const imageUrl = `https://crm.5lb.pro/crm-api/uploads/promotion/${filename}`;

        const promotion = await prisma.promotion.create({
            data: {
                title,
                description,
                imageUrl,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                link,
                showBeforeStart: showBeforeStart === 'true' || showBeforeStart === true,
            }
        });

        res.json(promotion);
    } catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ error: 'Ошибка при создании акции' });
    }
};

export const updatePromotion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, startDate, endDate, link, showBeforeStart } = req.body;
        const file = req.file;

        const existingPromotion = await prisma.promotion.findUnique({ where: { id } });
        if (!existingPromotion) {
            return res.status(404).json({ error: 'Акция не найдена' });
        }

        let imageUrl = existingPromotion.imageUrl;

        if (file) {
            // Upload new image
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
            const filepath = path.join(UPLOAD_DIR, filename);

            await sharp(file.buffer)
                .resize(800)
                .png({ quality: 80 })
                .toFile(filepath);

            imageUrl = `https://crm.5lb.pro/crm-api/uploads/promotion/${filename}`;

            // Try to delete old image
            try {
                const oldFilename = existingPromotion.imageUrl.split('/').pop();
                if (oldFilename) {
                    const oldFilepath = path.join(UPLOAD_DIR, oldFilename);
                    if (fs.existsSync(oldFilepath)) {
                        fs.unlinkSync(oldFilepath);
                    }
                }
            } catch (e) {
                console.error('Failed to delete old image:', e);
            }
        }

        const promotion = await prisma.promotion.update({
            where: { id },
            data: {
                title,
                description,
                imageUrl,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                link,
                showBeforeStart: showBeforeStart === 'true' || showBeforeStart === true,
            }
        });

        res.json(promotion);
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ error: 'Ошибка при обновлении акции' });
    }
};

export const deletePromotion = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const promotion = await prisma.promotion.findUnique({ where: { id } });
        if (!promotion) {
            return res.status(404).json({ error: 'Акция не найдена' });
        }

        // Delete image file
        try {
            const filename = promotion.imageUrl.split('/').pop();
            if (filename) {
                const filepath = path.join(UPLOAD_DIR, filename);
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }
            }
        } catch (e) {
            console.error('Failed to delete image:', e);
        }

        await prisma.promotion.delete({ where: { id } });

        res.json({ message: 'Акция удалена' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении акции' });
    }
};

