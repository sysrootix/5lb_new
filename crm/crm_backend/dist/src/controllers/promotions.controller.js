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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePromotion = exports.updatePromotion = exports.createPromotion = exports.getAllPromotions = void 0;
const client_1 = require("@prisma/client");
const sharp_1 = __importDefault(require("sharp"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const UPLOAD_DIR = path_1.default.join(process.cwd(), 'uploads/promotion');
const BASE_URL = process.env.BASE_URL || 'https://crm.5lb.pro';
// Ensure directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const getAllPromotions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promotions = yield prisma.promotion.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(promotions);
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка при получении акций' });
    }
});
exports.getAllPromotions = getAllPromotions;
const createPromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, description, startDate, endDate, link, showBeforeStart } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({ error: 'Изображение обязательно' });
        }
        // Generate filename
        const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
        const filepath = path_1.default.join(UPLOAD_DIR, filename);
        // Compress and save image
        yield (0, sharp_1.default)(file.buffer)
            .resize(800) // Reasonable max width
            .png({ quality: 80 }) // Compress
            .toFile(filepath);
        // URL should be /crm-api/uploads/... so nginx proxies it to backend /api/uploads/...
        const imageUrl = `https://crm.5lb.pro/crm-api/uploads/promotion/${filename}`;
        const promotion = yield prisma.promotion.create({
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
    }
    catch (error) {
        console.error('Error creating promotion:', error);
        res.status(500).json({ error: 'Ошибка при создании акции' });
    }
});
exports.createPromotion = createPromotion;
const updatePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, description, startDate, endDate, link, showBeforeStart } = req.body;
        const file = req.file;
        const existingPromotion = yield prisma.promotion.findUnique({ where: { id } });
        if (!existingPromotion) {
            return res.status(404).json({ error: 'Акция не найдена' });
        }
        let imageUrl = existingPromotion.imageUrl;
        if (file) {
            // Upload new image
            const filename = `${Date.now()}-${Math.round(Math.random() * 1E9)}.png`;
            const filepath = path_1.default.join(UPLOAD_DIR, filename);
            yield (0, sharp_1.default)(file.buffer)
                .resize(800)
                .png({ quality: 80 })
                .toFile(filepath);
            imageUrl = `https://crm.5lb.pro/crm-api/uploads/promotion/${filename}`;
            // Try to delete old image
            try {
                const oldFilename = existingPromotion.imageUrl.split('/').pop();
                if (oldFilename) {
                    const oldFilepath = path_1.default.join(UPLOAD_DIR, oldFilename);
                    if (fs_1.default.existsSync(oldFilepath)) {
                        fs_1.default.unlinkSync(oldFilepath);
                    }
                }
            }
            catch (e) {
                console.error('Failed to delete old image:', e);
            }
        }
        const promotion = yield prisma.promotion.update({
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
    }
    catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ error: 'Ошибка при обновлении акции' });
    }
});
exports.updatePromotion = updatePromotion;
const deletePromotion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const promotion = yield prisma.promotion.findUnique({ where: { id } });
        if (!promotion) {
            return res.status(404).json({ error: 'Акция не найдена' });
        }
        // Delete image file
        try {
            const filename = promotion.imageUrl.split('/').pop();
            if (filename) {
                const filepath = path_1.default.join(UPLOAD_DIR, filename);
                if (fs_1.default.existsSync(filepath)) {
                    fs_1.default.unlinkSync(filepath);
                }
            }
        }
        catch (e) {
            console.error('Failed to delete image:', e);
        }
        yield prisma.promotion.delete({ where: { id } });
        res.json({ message: 'Акция удалена' });
    }
    catch (error) {
        res.status(500).json({ error: 'Ошибка при удалении акции' });
    }
});
exports.deletePromotion = deletePromotion;
