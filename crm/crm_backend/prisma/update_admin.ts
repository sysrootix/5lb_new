import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('123123', 10);
  
  // Обновляем админа root или создаем если нет
  await prisma.admin.upsert({
    where: { username: 'root' },
    update: {
      password: password,
      mustChangePassword: true, // Требуем смены пароля
    },
    create: {
      username: 'root',
      password: password,
      role: 'root',
      mustChangePassword: true,
    }
  });

  console.log('Admin root updated successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



