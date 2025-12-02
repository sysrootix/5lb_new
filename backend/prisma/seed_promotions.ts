import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const promotions = [
        {
            title: 'Карта основателя',
            description: '30 000 бонусов на весь 2026 год',
            imageUrl: '/images/src/card_owner.png',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2026-12-31'),
            link: '/founder-card',
        },
        {
            title: 'Пригласи друга',
            description: 'Получи 250 бонусов за каждого друга',
            imageUrl: '/images/src/card_partner.png',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2025-12-31'),
            link: '/referral',
        },
    ];

    for (const promo of promotions) {
        await prisma.promotion.create({
            data: promo,
        });
    }

    console.log('Promotions seeded successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
