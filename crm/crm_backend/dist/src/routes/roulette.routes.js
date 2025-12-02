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
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all roulette items with management controls
router.get('/', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const items = yield prisma.rouletteItem.findMany({
            orderBy: { amount: 'asc' },
        });
        res.json(items);
    }
    catch (error) {
        console.error('Failed to fetch roulette items:', error);
        res.status(500).json({ error: 'Failed to fetch roulette items' });
    }
}));
// Get roulette statistics
router.get('/stats', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Total spins
        const totalSpins = yield prisma.rouletteLog.count();
        // Total bonuses distributed
        const totalBonuses = yield prisma.rouletteLog.aggregate({
            _sum: { amount: true },
        });
        // Distribution by amount
        const distribution = yield prisma.rouletteLog.groupBy({
            by: ['amount'],
            _count: { amount: true },
            orderBy: { amount: 'asc' },
        });
        // Recent spins with user info
        const recentSpins = yield prisma.rouletteLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        displayName: true,
                        telegramId: true,
                    },
                },
            },
        });
        // Items stats - count how many times each item was won
        const items = yield prisma.rouletteItem.findMany({
            orderBy: { amount: 'asc' },
        });
        const itemStats = yield Promise.all(items.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            const count = yield prisma.rouletteLog.count({
                where: { amount: item.amount },
            });
            return Object.assign(Object.assign({}, item), { timesWon: count });
        })));
        res.json({
            totalSpins,
            totalBonuses: totalBonuses._sum.amount || 0,
            distribution,
            recentSpins,
            itemStats,
        });
    }
    catch (error) {
        console.error('Failed to fetch roulette stats:', error);
        res.status(500).json({ error: 'Failed to fetch roulette stats' });
    }
}));
// Create new roulette item
router.post('/', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, probability, color, isActive } = req.body;
        if (!amount || probability === undefined) {
            return res.status(400).json({ error: 'Amount and probability are required' });
        }
        const item = yield prisma.rouletteItem.create({
            data: {
                name: `${amount} бонусов`,
                amount,
                probability,
                color,
                isActive: isActive !== undefined ? isActive : true,
            },
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Failed to create roulette item:', error);
        res.status(500).json({ error: 'Failed to create roulette item' });
    }
}));
// Update roulette item
router.put('/:id', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { amount, probability, color, isActive } = req.body;
        const item = yield prisma.rouletteItem.update({
            where: { id },
            data: {
                name: amount ? `${amount} бонусов` : undefined,
                amount,
                probability,
                color,
                isActive,
            },
        });
        res.json(item);
    }
    catch (error) {
        console.error('Failed to update roulette item:', error);
        res.status(500).json({ error: 'Failed to update roulette item' });
    }
}));
// Delete roulette item
router.delete('/:id', auth_middleware_1.authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.rouletteItem.delete({
            where: { id },
        });
        res.json({ message: 'Roulette item deleted successfully' });
    }
    catch (error) {
        console.error('Failed to delete roulette item:', error);
        res.status(500).json({ error: 'Failed to delete roulette item' });
    }
}));
exports.default = router;
