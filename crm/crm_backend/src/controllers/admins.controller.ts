import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await prisma.admin.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                permissions: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(admins);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
};

export const createAdmin = async (req: Request, res: Response) => {
    try {
        const { username, password, role, permissions } = req.body;

        const existingAdmin = await prisma.admin.findUnique({
            where: { username }
        });

        if (existingAdmin) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = await prisma.admin.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'admin',
                permissions: permissions || []
            },
            select: {
                id: true,
                username: true,
                role: true,
                createdAt: true
            }
        });

        res.json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
};

export const updateAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { username, password, role, permissions } = req.body;

        const updateData: any = {
            username,
            role,
            permissions
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const admin = await prisma.admin.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                username: true,
                role: true,
                updatedAt: true
            }
        });

        res.json(admin);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update admin' });
    }
};

export const deleteAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.admin.delete({
            where: { id }
        });
        res.json({ message: 'Admin deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete admin' });
    }
};



