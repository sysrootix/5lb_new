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
exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Basic pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        const [users, total] = yield Promise.all([
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
exports.getUsers = getUsers;
const getUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id },
            include: {
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                },
                addresses: true
            }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user' });
    }
});
exports.getUser = getUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const data = req.body;
    // Remove sensitive fields or fields that shouldn't be updated directly if needed
    // For now, allow editing everything as requested
    try {
        const user = yield prisma.user.update({
            where: { id },
            data,
        });
        res.json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user' });
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Получить пользователя со всеми связанными данными
        const user = yield prisma.user.findUnique({
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
        yield prisma.userBackup.create({
            data: {
                userId: id,
                payload: user, // JSON payload
            },
        });
        // Очистить prize_codes связанные с пользователем (по userId и telegramId)
        yield prisma.prizeCode.updateMany({
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
        yield prisma.rouletteLog.deleteMany({
            where: { userId: id }
        });
        // Удалить пользователя (каскадное удаление настроено в схеме)
        yield prisma.user.delete({
            where: { id },
        });
        res.json({ message: 'User deleted successfully', backup: true });
    }
    catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});
exports.deleteUser = deleteUser;
