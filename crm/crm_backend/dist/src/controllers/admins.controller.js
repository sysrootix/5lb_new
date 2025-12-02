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
exports.deleteAdmin = exports.updateAdmin = exports.createAdmin = exports.getAdmins = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const getAdmins = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma.admin.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
});
exports.getAdmins = getAdmins;
const createAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, role, permissions } = req.body;
        const existingAdmin = yield prisma.admin.findUnique({
            where: { username }
        });
        if (existingAdmin) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const admin = yield prisma.admin.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
});
exports.createAdmin = createAdmin;
const updateAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { username, password, role, permissions } = req.body;
        const updateData = {
            username,
            role,
            permissions
        };
        if (password) {
            updateData.password = yield bcrypt_1.default.hash(password, 10);
        }
        const admin = yield prisma.admin.update({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update admin' });
    }
});
exports.updateAdmin = updateAdmin;
const deleteAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        yield prisma.admin.delete({
            where: { id }
        });
        res.json({ message: 'Admin deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete admin' });
    }
});
exports.deleteAdmin = deleteAdmin;
