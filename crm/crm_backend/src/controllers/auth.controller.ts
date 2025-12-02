import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const admin = await prisma.admin.findUnique({ where: { username } });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) return res.status(401).json({ message: 'Invalid credentials' });

        // Access token - живет 1 час
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        // Refresh token - живет 7 дней
        const refreshToken = jwt.sign(
            { id: admin.id, type: 'refresh' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        await prisma.admin.update({
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
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    try {
        // Проверяем refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret') as any;

        // Проверяем что это именно refresh token
        if (decoded.type !== 'refresh') {
            return res.status(403).json({ message: 'Invalid token type' });
        }

        // Получаем данные админа
        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id }
        });

        if (!admin) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Генерируем новые токены
        const newToken = jwt.sign(
            { id: admin.id, username: admin.username, role: admin.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        const newRefreshToken = jwt.sign(
            { id: admin.id, type: 'refresh' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        res.json({
            token: newToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(403).json({ message: 'Invalid or expired refresh token' });
    }
};

export const changePassword = async (req: Request, res: Response) => {
    const { newPassword } = req.body;
    const adminId = (req as any).user.id; // Из middleware

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.admin.update({
            where: { id: adminId },
            data: {
                password: hashedPassword,
                mustChangePassword: false
            }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Failed to update password' });
    }
};
