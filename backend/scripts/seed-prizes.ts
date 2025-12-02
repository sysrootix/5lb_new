import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Скрипт для заполнения начальных данных призов в БД.
 * 
 * Создает призы с весами для системы колеса фортуны.
 */
async function seedPrizes() {
  console.log('Начинаем заполнение призов...');

  // Призы с весами (вероятностями)
  const prizes = [
    { name: '1000 бонусов', code: 'bonus_1000', weight: 50 },
    { name: '2000 бонусов', code: 'bonus_2000', weight: 20 },
    { name: '3000 бонусов', code: 'bonus_3000', weight: 15 },
    { name: '5000 бонусов', code: 'bonus_5000', weight: 10 },
    { name: '7000 бонусов', code: 'bonus_7000', weight: 3 },
    { name: '10000 бонусов', code: 'bonus_10000', weight: 2 }
  ];

  for (const prizeData of prizes) {
    // Проверяем, существует ли приз с таким кодом
    const existing = await prisma.prize.findUnique({
      where: { code: prizeData.code }
    });

    if (existing) {
      console.log(`Приз "${prizeData.name}" уже существует, пропускаем...`);
      continue;
    }

    // Создаем приз
    const prize = await prisma.prize.create({
      data: {
        name: prizeData.name,
        code: prizeData.code,
        weight: prizeData.weight,
        isActive: true
      }
    });

    console.log(`✓ Создан приз: "${prize.name}" (код: ${prize.code}, вес: ${prize.weight})`);
  }

  // Выводим статистику
  const allPrizes = await prisma.prize.findMany({
    where: { isActive: true },
    orderBy: { weight: 'desc' }
  });

  const totalWeight = allPrizes.reduce((sum, prize) => sum + prize.weight, 0);

  console.log('\n📊 Статистика призов:');
  allPrizes.forEach((prize, index) => {
    const probability = ((prize.weight / totalWeight) * 100).toFixed(2);
    console.log(`  ${index + 1}. ${prize.name} - вес: ${prize.weight}, вероятность: ${probability}%`);
  });

  console.log('\n✅ Готово! Призы успешно заполнены.');
}

seedPrizes()
  .catch(error => {
    console.error('Ошибка при заполнении призов:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

