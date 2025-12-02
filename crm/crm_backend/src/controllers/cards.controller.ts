import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Получить все типы карт
export const getCardTypes = async (req: Request, res: Response) => {
    try {
        const cards = await prisma.bonusCard.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(cards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching card types' });
    }
};

// Получить карты пользователя
export const getUserCards = async (req: Request, res: Response) => {
    const { userId } = req.params;
    try {
        const userCards = await prisma.userBonusCard.findMany({
            where: { userId },
            include: {
                card: true,
                transactions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        res.json(userCards);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user cards' });
    }
};

// Выдать карту пользователю
export const assignCard = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { cardCode, initialBalance = 0 } = req.body;

    try {
        // Найти карту по коду
        const card = await prisma.bonusCard.findUnique({
            where: { code: cardCode },
        });

        if (!card) {
            return res.status(404).json({ message: 'Card type not found' });
        }

        // Проверить, есть ли уже такая карта у пользователя
        const existingCard = await prisma.userBonusCard.findUnique({
            where: {
                userId_cardId: {
                    userId,
                    cardId: card.id,
                },
            },
        });

        if (existingCard) {
            return res.status(400).json({ message: 'User already has this card' });
        }

        // Выдать карту
        const userCard = await prisma.userBonusCard.create({
            data: {
                userId,
                cardId: card.id,
                balance: initialBalance,
                isActive: true,
            },
            include: {
                card: true,
            },
        });

        // Если есть начальный баланс, создать транзакцию
        if (initialBalance > 0) {
            await prisma.bonusTransaction.create({
                data: {
                    userCardId: userCard.id,
                    amount: initialBalance,
                    type: 'ACCRUAL',
                    description: 'Начальный баланс при выдаче карты',
                },
            });
        }

        res.json(userCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning card' });
    }
};

// Пополнить/изменить баланс карты
export const updateCardBalance = async (req: Request, res: Response) => {
    const { userCardId } = req.params;
    const { amount, description } = req.body;

    if (typeof amount !== 'number' || amount === 0) {
        return res.status(400).json({ message: 'Amount must be a non-zero number' });
    }

    try {
        const userCard = await prisma.userBonusCard.findUnique({
            where: { id: userCardId },
        });

        if (!userCard) {
            return res.status(404).json({ message: 'User card not found' });
        }

        const newBalance = userCard.balance + amount;

        if (newBalance < 0) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Обновить баланс и создать транзакцию в транзакции БД
        const [updatedCard] = await prisma.$transaction([
            prisma.userBonusCard.update({
                where: { id: userCardId },
                data: { balance: newBalance },
                include: { card: true },
            }),
            prisma.bonusTransaction.create({
                data: {
                    userCardId,
                    amount,
                    type: amount > 0 ? 'ACCRUAL' : 'REDEMPTION',
                    description: description || (amount > 0 ? 'Пополнение баланса (CRM)' : 'Списание баланса (CRM)'),
                },
            }),
        ]);

        res.json(updatedCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating card balance' });
    }
};

// Отозвать карту (деактивировать)
export const revokeCard = async (req: Request, res: Response) => {
    const { userCardId } = req.params;

    try {
        const userCard = await prisma.userBonusCard.update({
            where: { id: userCardId },
            data: { isActive: false },
            include: { card: true },
        });

        res.json(userCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error revoking card' });
    }
};

// Активировать карту
export const activateCard = async (req: Request, res: Response) => {
    const { userCardId } = req.params;

    try {
        const userCard = await prisma.userBonusCard.update({
            where: { id: userCardId },
            data: { isActive: true },
            include: { card: true },
        });

        res.json(userCard);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error activating card' });
    }
};

// Получить транзакции по карте
export const getCardTransactions = async (req: Request, res: Response) => {
    const { userCardId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    try {
        const [transactions, total] = await Promise.all([
            prisma.bonusTransaction.findMany({
                where: { userCardId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.bonusTransaction.count({
                where: { userCardId },
            }),
        ]);

        res.json({
            data: transactions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};
