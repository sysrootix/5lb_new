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
exports.getPrizeActivity = exports.getPrizeStats = exports.deletePrize = exports.updatePrize = exports.createPrize = exports.getPrize = exports.getPrizes = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getPrizes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prizes = yield prisma.prize.findMany({
            orderBy: { weight: 'desc' }
        });
        res.json(prizes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch prizes' });
    }
});
exports.getPrizes = getPrizes;
const getPrize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const prize = yield prisma.prize.findUnique({
            where: { id }
        });
        if (!prize) {
            return res.status(404).json({ error: 'Prize not found' });
        }
        res.json(prize);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch prize' });
    }
});
exports.getPrize = getPrize;
const createPrize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, code, weight, isActive } = req.body;
        const prize = yield prisma.prize.create({
            data: {
                name,
                code,
                weight: parseInt(weight),
                isActive
            }
        });
        res.json(prize);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create prize' });
    }
});
exports.createPrize = createPrize;
const updatePrize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, code, weight, isActive } = req.body;
        const prize = yield prisma.prize.update({
            where: { id },
            data: {
                name,
                code,
                weight: parseInt(weight),
                isActive
            }
        });
        res.json(prize);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update prize' });
    }
});
exports.updatePrize = updatePrize;
const deletePrize = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.prize.delete({
            where: { id }
        });
        res.json({ message: 'Prize deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete prize' });
    }
});
exports.deletePrize = deletePrize;
const getPrizeStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalCodes = yield prisma.prizeCode.count();
        const usedCodes = yield prisma.prizeCode.count({ where: { used: true } });
        // Conversion rate
        const conversionRate = totalCodes > 0 ? (usedCodes / totalCodes) * 100 : 0;
        // Daily usage stats (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dailyUsage = yield prisma.prizeCode.groupBy({
            by: ['usedAt'],
            where: {
                used: true,
                usedAt: {
                    gte: thirtyDaysAgo
                }
            },
            _count: {
                _all: true
            }
        });
        // Process daily usage to group by date (ignoring time)
        const dailyStats = new Map();
        dailyUsage.forEach(item => {
            if (item.usedAt) {
                const date = item.usedAt.toISOString().split('T')[0];
                dailyStats.set(date, (dailyStats.get(date) || 0) + item._count._all);
            }
        });
        const chartData = Array.from(dailyStats.entries()).map(([date, count]) => ({
            date,
            count
        })).sort((a, b) => a.date.localeCompare(b.date));
        // Prize distribution (which prizes are won most)
        const prizeDistribution = yield prisma.prizeCode.groupBy({
            by: ['prizeName'],
            _count: {
                _all: true
            }
        });
        res.json({
            summary: {
                totalCodes,
                usedCodes,
                conversionRate
            },
            chartData,
            prizeDistribution: prizeDistribution.map(p => ({
                name: p.prizeName,
                count: p._count._all
            }))
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch prize stats' });
    }
});
exports.getPrizeStats = getPrizeStats;
const getPrizeActivity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [items, total] = yield Promise.all([
            prisma.prizeCode.findMany({
                take: limit,
                skip: skip,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    prizeName: true,
                    used: true,
                    usedAt: true,
                    createdAt: true,
                    telegramId: true
                }
            }),
            prisma.prizeCode.count()
        ]);
        res.json({
            items,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch prize activity' });
    }
});
exports.getPrizeActivity = getPrizeActivity;
