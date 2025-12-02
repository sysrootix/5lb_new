import { PrismaClient } from '@prisma/client';
import { bonusService } from './bonus.service';

const prisma = new PrismaClient();

export class RouletteService {
    async checkEligibility(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { rouletteLog: true },
        });

        if (!user) return false;

        // Check if user has any used prize codes (welcome bonuses)
        const hasPrizeCodes = await prisma.prizeCode.count({
            where: {
                OR: [
                    { userId: userId },
                    { telegramId: user.telegramId || undefined }
                ],
                used: true
            }
        });

        // User is eligible if:
        // 1. They haven't spun the roulette yet (rouletteLog is null)
        // 2. They haven't received any welcome bonuses via prize codes (hasPrizeCodes === 0)
        return !user.rouletteLog && hasPrizeCodes === 0;
    }

    async getItems() {
        const items = await prisma.rouletteItem.findMany({
            where: {
                isActive: true,
                // Show all items, even with 0 probability (they won't actually win)
            },
            orderBy: { amount: 'asc' },
            select: {
                id: true,
                name: true,
                amount: true,
                color: true,
                // Exclude probability from response
            }
        });
        return items;
    }

    async spin(userId: string) {
        const isEligible = await this.checkEligibility(userId);
        if (!isEligible) {
            throw new Error('Рулетка недоступна. Вы уже получали приветственные бонусы или крутили рулетку ранее.');
        }

        // Fetch items with probability for internal logic
        const items = await prisma.rouletteItem.findMany({
            where: {
                isActive: true,
                probability: { gt: 0 } // Only items with probability > 0 can be won
            },
            orderBy: { amount: 'asc' },
        });

        if (items.length === 0) {
            throw new Error('No active roulette items found');
        }

        // Calculate total weight
        const totalWeight = items.reduce((sum, item) => sum + item.probability, 0);
        let random = Math.random() * totalWeight;

        // Select item based on probability
        let selectedItem = items[items.length - 1];
        for (const item of items) {
            if (random < item.probability) {
                selectedItem = item;
                break;
            }
            random -= item.probability;
        }

        // Transaction: Log the spin and add bonuses
        return prisma.$transaction(async (tx) => {
            // 1. Create log
            const log = await tx.rouletteLog.create({
                data: {
                    userId,
                    amount: selectedItem.amount,
                },
            });

            // 2. Add bonuses to BASE card
            // We use bonusService logic here but need to ensure it uses the transaction if possible.
            // Since bonusService might not accept a transaction object, we might need to replicate logic or update bonusService.
            // For now, we'll call bonusService.addBonuses separately or assume it handles its own consistency.
            // Ideally, we should refactor bonusService to accept a tx, but for now let's do it manually here to be safe within this transaction
            // OR just trust the process.

            // Let's try to find the BASE card and update it directly within this transaction for atomicity.
            const baseCard = await tx.bonusCard.findUnique({ where: { code: 'BASE' } });
            if (!baseCard) throw new Error('Base card not found');

            let userCard = await tx.userBonusCard.findUnique({
                where: {
                    userId_cardId: {
                        userId,
                        cardId: baseCard.id,
                    },
                },
            });

            if (!userCard) {
                userCard = await tx.userBonusCard.create({
                    data: {
                        userId,
                        cardId: baseCard.id,
                        balance: 0,
                    },
                });
            }

            await tx.userBonusCard.update({
                where: { id: userCard.id },
                data: {
                    balance: { increment: selectedItem.amount },
                },
            });

            await tx.bonusTransaction.create({
                data: {
                    userCardId: userCard.id,
                    amount: selectedItem.amount,
                    type: 'ACCRUAL',
                    description: 'Выигрыш в стартовой рулетке',
                },
            });

            return {
                item: selectedItem,
                log,
            };
        });
    }
}

export const rouletteService = new RouletteService();
