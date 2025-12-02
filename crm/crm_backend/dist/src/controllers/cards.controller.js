"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCardTransactions = exports.activateCard = exports.revokeCard = exports.updateCardBalance = exports.assignCard = exports.getUserCards = exports.getCardTypes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Получить все типы карт
const getCardTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cards = yield prisma.bonusCard.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(cards);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching card types' });
    }
});
exports.getCardTypes = getCardTypes;
// Получить карты пользователя
const getUserCards = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const userCards = yield prisma.userBonusCard.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user cards' });
    }
});
exports.getUserCards = getUserCards;
// Выдать карту пользователю
const assignCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { cardCode, initialBalance = 0 } = req.body;
    try {
        // Найти карту по коду
        const card = yield prisma.bonusCard.findUnique({
            where: { code: cardCode },
        });
        if (!card) {
            return res.status(404).json({ message: 'Card type not found' });
        }
        // Проверить, есть ли уже такая карта у пользователя
        const existingCard = yield prisma.userBonusCard.findUnique({
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
        const userCard = yield prisma.userBonusCard.create({
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
            yield prisma.bonusTransaction.create({
                data: {
                    userCardId: userCard.id,
                    amount: initialBalance,
                    type: 'ACCRUAL',
                    description: 'Начальный баланс при выдаче карты',
                },
            });
        }
        res.json(userCard);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error assigning card' });
    }
});
exports.assignCard = assignCard;
// Пополнить/изменить баланс карты
const updateCardBalance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userCardId } = req.params;
    const { amount, description } = req.body;
    if (typeof amount !== 'number' || amount === 0) {
        return res.status(400).json({ message: 'Amount must be a non-zero number' });
    }
    try {
        const userCard = yield prisma.userBonusCard.findUnique({
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
        const [updatedCard] = yield prisma.$transaction([
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating card balance' });
    }
});
exports.updateCardBalance = updateCardBalance;
// Отозвать карту (деактивировать)
const revokeCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userCardId } = req.params;
    try {
        const userCard = yield prisma.userBonusCard.update({
            where: { id: userCardId },
            data: { isActive: false },
            include: { card: true },
        });
        res.json(userCard);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error revoking card' });
    }
});
exports.revokeCard = revokeCard;
// Активировать карту
const activateCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userCardId } = req.params;
    try {
        const userCard = yield prisma.userBonusCard.update({
            where: { id: userCardId },
            data: { isActive: true },
            include: { card: true },
        });
        res.json(userCard);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error activating card' });
    }
});
exports.activateCard = activateCard;
// Получить транзакции по карте
const getCardTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userCardId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    try {
        const [transactions, total] = yield Promise.all([
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
});
exports.getCardTransactions = getCardTransactions;
