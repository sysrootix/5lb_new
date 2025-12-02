import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding roulette items...');

    const items = [
        {
            name: '100 бонусов',
            amount: 100,
            probability: 50.0,
            color: '#FFD700', // Gold
        },
        {
            name: '500 бонусов',
            amount: 500,
            probability: 30.0,
            color: '#C0C0C0', // Silver
        },
        {
            name: '1000 бонусов',
            amount: 1000,
            probability: 15.0,
            color: '#CD7F32', // Bronze
        },
        {
            name: '5000 бонусов',
            amount: 5000,
            probability: 5.0,
            color: '#FF4500', // Orange Red
        },
    ];

    for (const item of items) {
        await prisma.rouletteItem.create({
            data: item,
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
