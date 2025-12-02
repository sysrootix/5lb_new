import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding bonus system...');

  // 1. Create/Update Base Card
  const baseCard = await prisma.bonusCard.upsert({
    where: { code: 'BASE' },
    update: {
      name: 'Базовая карта',
      settings: {
        expirationMonths: 6,
        maxRedemptionPercent: 30,
      },
    },
    create: {
      code: 'BASE',
      name: 'Базовая карта',
      description: 'Базовая бонусная карта с начислением бонусов через колесо фортуны',
      settings: {
        expirationMonths: 6,
        maxRedemptionPercent: 30,
      },
    },
  });
  console.log('Base card created/updated:', baseCard.id);

  // 2. Create/Update Partner Card
  const partnerCard = await prisma.bonusCard.upsert({
    where: { code: 'PARTNER' },
    update: {
      name: 'Карта партнера',
    },
    create: {
      code: 'PARTNER',
      name: 'Карта партнера',
      description: 'Карта партнера (в разработке)',
      isActive: false, 
    },
  });
  console.log('Partner card created/updated:', partnerCard.id);

  // 3. Create Wheel Options for Base Card
  // Clear existing options for base card to avoid duplicates if run multiple times
  await prisma.bonusWheelOption.deleteMany({
    where: { cardId: baseCard.id },
  });

  await prisma.bonusWheelOption.createMany({
    data: [
      {
        cardId: baseCard.id,
        percentage: 5,
        probability: 60, // 60% chance
      },
      {
        cardId: baseCard.id,
        percentage: 10,
        probability: 30, // 30% chance
      },
      {
        cardId: baseCard.id,
        percentage: 15,
        probability: 10, // 10% chance
      },
    ],
  });
  console.log('Wheel options created for Base Card');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
