import { PrismaClient, Promotion } from '@prisma/client';

const prisma = new PrismaClient();

export class PromotionService {
    async getPromotions(): Promise<Promotion[]> {
        const now = new Date();
        return prisma.promotion.findMany({
            where: {
                OR: [
                    // Активные акции (дата начала <= сейчас <= дата окончания)
                    {
                        startDate: {
                            lte: now,
                        },
                        endDate: {
                            gte: now,
                        },
                    },
                    // Будущие акции с флагом showBeforeStart
                    {
                        showBeforeStart: true,
                        startDate: {
                            gt: now,
                        },
                        endDate: {
                            gte: now,
                        },
                    },
                ],
            },
            orderBy: {
                startDate: 'asc',
            },
        });
    }

    async getPromotionById(id: string): Promise<Promotion | null> {
        return prisma.promotion.findUnique({
            where: { id },
        });
    }
}
