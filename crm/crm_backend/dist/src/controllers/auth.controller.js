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
exports.changePassword = exports.refreshToken = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const admin = yield prisma.admin.findUnique({ where: { username } });
        if (!admin)
            return res.status(401).json({ message: 'Invalid credentials' });
        const validPassword = yield bcrypt_1.default.compare(password, admin.password);
        if (!validPassword)
            return res.status(401).json({ message: 'Invalid credentials' });
        // Access token - живет 1 час
        const token = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        // Refresh token - живет 7 дней
        const refreshToken = jsonwebtoken_1.default.sign({ id: admin.id, type: 'refresh' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        yield prisma.admin.update({
            where: { id: admin.id },
            data: { lastLoginAt: new Date() },
        });
        res.json({
            token,
            refreshToken,
            admin: {
                id: admin.id,
                username: admin.username,
                role: admin.role,
                mustChangePassword: admin.mustChangePassword
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
const refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
        // Проверяем refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_SECRET || 'secret');
        // Проверяем что это именно refresh token
        if (decoded.type !== 'refresh') {
            return res.status(403).json({ message: 'Invalid token type' });
        }
        // Получаем данные админа
        const admin = yield prisma.admin.findUnique({
            where: { id: decoded.id }
        });
        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Генерируем новые токены
        const newToken = jsonwebtoken_1.default.sign({ id: admin.id, username: admin.username, role: admin.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        const newRefreshToken = jsonwebtoken_1.default.sign({ id: admin.id, type: 'refresh' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.json({
            token: newToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
});
exports.refreshToken = refreshToken;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword } = req.body;
    const adminId = req.user.id; // Из middleware
    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield prisma.admin.update({
            where: { id: adminId },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
});
exports.changePassword = changePassword;
