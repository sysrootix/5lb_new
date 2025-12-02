import { PrismaClient } from '@prisma/client';
import { bonusService } from '../src/services/bonus.service';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting verification...');

    // 1. Create Test User
    const testPhone = '+79990000000';
    let user = await prisma.user.findUnique({ where: { phone: testPhone } });
    if (user) {
        await prisma.user.delete({ where: { id: user.id } });
    }

    user = await prisma.user.create({
        data: {
            phone: testPhone,
            firstName: 'Test',
            lastName: 'Founder'
        }
    });
    console.log(`Created test user: ${user.id}`);

    // 2. Activate Founder Card
    console.log('Activating Founder Card...');
    await bonusService.activateFounderCard(user.id);

    // 3. Verify
    const userCard = await prisma.userBonusCard.findFirst({
        where: {
            userId: user.id,
            card: { code: 'FOUNDER' }
        },
        include: { card: true }
    });

    if (!userCard) {
        throw new Error('Founder card not found for user');
    }
    console.log(`User has Founder Card: ${userCard.card.name}`);
    console.log(`Balance: ${userCard.balance}`);

    if (userCard.balance !== 30000) {
        throw new Error(`Expected balance 30000, got ${userCard.balance}`);
    }

    // 4. Verify Transaction
    const tx = await prisma.bonusTransaction.findFirst({
        where: { userCardId: userCard.id }
    });

    if (!tx) {
        throw new Error('Transaction not found');
    }
    console.log(`Transaction found: ${tx.amount} (${tx.type})`);
    console.log(`Expires at: ${tx.expiresAt}`);

    // 5. Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Cleanup done. Verification successful!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
