import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking Banner table...');
        const count = await prisma.banner.count();
        console.log(`Banner count: ${count}`);
        console.log('Banner table exists and is accessible.');
    } catch (error) {
        console.error('Error accessing Banner table:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
