import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    const count = process.argv[2] ? parseInt(process.argv[2]) : 10;
    console.log(`Generating ${count} Founder's Card links...`);

    // 1. Ensure Founder's Card exists
    let founderCard = await prisma.bonusCard.findUnique({
        where: { code: 'FOUNDER' }
    });

    if (!founderCard) {
        console.log('Creating FOUNDER card...');
        founderCard = await prisma.bonusCard.create({
            data: {
                code: 'FOUNDER',
                name: 'Карта основателя',
                description: 'Эксклюзивная карта для тех, кто с нами с самого начала.',
                imageUrl: '/images/cards/founder.png', // Placeholder
                isActive: true,
                settings: {
                    expirationDate: '2026-12-31',
                    initialBalance: 30000,
                    maxRedemptionPercent: 30
                }
            }
        });
    } else {
        console.log('FOUNDER card already exists.');
    }

    // 2. Generate Links
    const links = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(8).toString('hex'); // 16 chars
        links.push({
            code,
            isUsed: false
        });
    }

    // 3. Save to DB
    await prisma.foundersLink.createMany({
        data: links
    });

    console.log('Links generated successfully:');
    const botUsername = 'pro_5lb_bot'; // Or import from env if possible, but scripts context might be different
    links.forEach(link => {
        console.log(`https://t.me/${botUsername}?start=founder_${link.code}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
