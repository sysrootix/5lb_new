import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const password = 'rootpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.upsert({
        where: { username: 'root' },
        update: {},
        create: {
            username: 'root',
            password: hashedPassword,
            role: 'root',
            permissions: ['*'],
        },
    });

    console.log('Root admin created/updated');
    console.log('Username: root');
    console.log('Password: rootpassword123');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
