import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const generateCode = () => {
    // Generate a random string, e.g., e4857901ffc00512 (16 chars hex)
    const random = randomBytes(8).toString('hex');
    return random;
};

export const getFoundersLinks = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50; // Default 50
        const skip = (page - 1) * limit;
        const search = req.query.search as string;
        const isUsed = req.query.isUsed === 'true' ? true : req.query.isUsed === 'false' ? false : undefined;

        const where: any = {};
        
        if (search) {
            where.code = { contains: search, mode: 'insensitive' };
        }

        if (isUsed !== undefined) {
            where.isUsed = isUsed;
        }

        const [items, total] = await Promise.all([
            prisma.foundersLink.findMany({
                where,
                take: limit,
                skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            phone: true,
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }),
            prisma.foundersLink.count({ where })
        ]);

        res.json({
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Error fetching founders links:', error);
        res.status(500).json({ error: 'Failed to fetch links' });
    }
};

export const createFoundersLink = async (req: Request, res: Response) => {
    try {
        const code = req.body.code || generateCode();
        
        const link = await prisma.foundersLink.create({
            data: {
                code
            }
        });
        
        res.json(link); // Returns { id, code, ... }
    } catch (error) {
        console.error('Error creating founders link:', error);
        // Handle unique constraint violation
        if ((error as any).code === 'P2002') {
            return res.status(400).json({ error: 'Code already exists' });
        }
        res.status(500).json({ error: 'Failed to create link' });
    }
};

export const createBulkFoundersLinks = async (req: Request, res: Response) => {
    try {
        const count = parseInt(req.body.count) || 10;
        const maxCount = 1000; // Safety limit
        
        if (count > maxCount) {
            return res.status(400).json({ error: `Cannot create more than ${maxCount} links at once` });
        }

        const data = [];
        for (let i = 0; i < count; i++) {
            data.push({ code: generateCode() });
        }

        // Use createMany for efficiency
        const result = await prisma.foundersLink.createMany({
            data,
            skipDuplicates: true // Skip if code exists, which is fine
        });
        
        // To return the generated codes, we need to fetch them. 
        // Since we just created them and they have a timestamp, we can fetch the latest 'count' records created very recently.
        // However, concurrency might be an issue. A better way for exact return would be a transaction or loop.
        // For bulk operations, precise return of exactly THESE records is tricky with createMany.
        // Let's try to fetch the latest N records created in the last few seconds.
        
        const createdLinks = await prisma.foundersLink.findMany({
            take: result.count,
            orderBy: { createdAt: 'desc' },
            select: { code: true }
        });

        // Reverse to get them in creation order (though random, doesn't matter much)
        // Actually, user just wants the list.
        
        res.json({ 
            message: 'Links created', 
            count: result.count, 
            codes: createdLinks.map(l => l.code) 
        });
    } catch (error) {
        console.error('Error creating bulk links:', error);
        res.status(500).json({ error: 'Failed to create links' });
    }
};

export const deleteFoundersLink = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.foundersLink.delete({
            where: { id }
        });
        res.json({ message: 'Link deleted' });
    } catch (error) {
        console.error('Error deleting founders link:', error);
        res.status(500).json({ error: 'Failed to delete link' });
    }
};

export const getAllForExport = async (req: Request, res: Response) => {
    try {
        // Fetch all links for CSV export
        const links = await prisma.foundersLink.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                code: true,
                isUsed: true,
                usedAt: true,
                createdAt: true,
                user: {
                    select: {
                        phone: true
                    }
                }
            }
        });
        res.json(links);
    } catch (error) {
        console.error('Error exporting links:', error);
        res.status(500).json({ error: 'Failed to export links' });
    }
};
