import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Скрипт для исправления флага isRegistrationComplete у существующих пользователей.
 * 
 * Устанавливает isRegistrationComplete = true для пользователей, у которых:
 * - заполнены firstName, lastName
 * - заполнена dateOfBirth
 * - но isRegistrationComplete = false
 */
async function fixRegistrationComplete() {
  console.log('Начинаем проверку пользователей...');

  // Находим пользователей с заполненными данными, но неверным флагом
  const usersToFix = await prisma.user.findMany({
    where: {
      isRegistrationComplete: false,
      firstName: { not: null },
      lastName: { not: null },
      dateOfBirth: { not: null }
    }
  });

  console.log(`Найдено пользователей для исправления: ${usersToFix.length}`);

  if (usersToFix.length === 0) {
    console.log('Нет пользователей, требующих исправления.');
    return;
  }

  // Обновляем флаг для найденных пользователей
  const result = await prisma.user.updateMany({
    where: {
      id: { in: usersToFix.map(u => u.id) }
    },
    data: {
      isRegistrationComplete: true
    }
  });

  console.log(`Обновлено пользователей: ${result.count}`);
  
  // Выводим список обновлённых пользователей
  usersToFix.forEach(user => {
    console.log(`  - ${user.phone} (${user.firstName} ${user.lastName})`);
  });

  console.log('Готово!');
}

fixRegistrationComplete()
  .catch(error => {
    console.error('Ошибка при исправлении данных:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

