import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req: Request, res: Response) => {
    try {
        // Basic pagination
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count(),
        ]);

        res.json({
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                addresses: true
            }
        });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const data = req.body;

    // Remove sensitive fields or fields that shouldn't be updated directly if needed
    // For now, allow editing everything as requested

    try {
        const user = await prisma.user.update({
            where: { id },
            data,
        });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        // Получить пользователя со всеми связанными данными
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                addresses: true,
                orders: {
                    include: {
                        items: true,
                        bonusTransactions: true,
                    },
                },
                userBonusCards: {
                    include: {
                        card: true,
                        transactions: true,
                    },
                },
                refreshTokens: true,
                foundersLinks: true,
                referrals: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Создать бэкап пользователя
        await prisma.userBackup.create({
            data: {
                userId: id,
                payload: user as any, // JSON payload
            },
        });

        // Очистить prize_codes связанные с пользователем (по userId и telegramId)
        await prisma.prizeCode.updateMany({
            where: {
                OR: [
                    { userId: id },
                    { telegramId: user.telegramId || undefined }
                ]
            },
            data: {
                userId: null,
                telegramId: null,
                used: false,
                usedAt: null
            }
        });

        // Удалить roulette_logs связанные с пользователем
        await prisma.rouletteLog.deleteMany({
            where: { userId: id }
        });

        // Удалить пользователя (каскадное удаление настроено в схеме)
        await prisma.user.delete({
            where: { id },
        });

        res.json({ message: 'User deleted successfully', backup: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
};
