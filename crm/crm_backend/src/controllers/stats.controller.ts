import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const period = req.query.period as string || 'day'; // 'day', 'week', 'month'
        const today = new Date();
        
        let startDate = new Date(today);
        let groupByFormat: 'day' | 'week' | 'month' = 'day';
        let iterations = 30;

        // Настройка периода
        if (period === 'week') {
            startDate.setDate(startDate.getDate() - (12 * 7)); // 12 недель
            groupByFormat = 'week';
            iterations = 12;
        } else if (period === 'month') {
            startDate.setMonth(startDate.getMonth() - 11); // 12 месяцев (включая текущий)
            startDate.setDate(1); // С начала месяца
            groupByFormat = 'month';
            iterations = 12;
        } else {
            // default 'day'
            startDate.setDate(startDate.getDate() - 29); // 30 дней (включая сегодня)
            groupByFormat = 'day';
            iterations = 30;
        }

        console.log(`[Stats] Fetching stats for period: ${period}, startDate: ${startDate.toISOString()}`);

        // 1. Общая статистика (не зависит от периода, или можно адаптировать)
        const totalUsers = await prisma.user.count();
        
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const activeUsers = await prisma.user.count({
            where: { lastLoginAt: { gte: sevenDaysAgo } }
        });

        // 2. Получение данных для графика
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            select: {
                createdAt: true
            }
        });

        console.log(`[Stats] Found ${users.length} users for chart`);

        // Группировка
        const statsMap = new Map<string, number>();

        // Инициализация карты нулями
        if (period === 'day') {
            for (let i = 0; i < iterations; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
                statsMap.set(key, 0);
            }
        } else if (period === 'week') {
            // Для недель пойдем от текущей назад
            for (let i = 0; i < iterations; i++) {
                const d = new Date();
                d.setDate(d.getDate() - (i * 7));
                // Получаем понедельник этой недели или просто дату для метки
                const key = getWeekLabel(d); 
                statsMap.set(key, 0);
            }
        } else if (period === 'month') {
            for (let i = 0; i < iterations; i++) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const key = d.toISOString().slice(0, 7); // YYYY-MM
                statsMap.set(key, 0);
            }
        }

        // Заполнение данными
        users.forEach(user => {
            let key = '';
            if (period === 'day') {
                key = user.createdAt.toISOString().split('T')[0];
            } else if (period === 'week') {
                key = getWeekLabel(user.createdAt);
            } else if (period === 'month') {
                key = user.createdAt.toISOString().slice(0, 7);
            }

            // Проверяем наличие ключа. 
            // Если ключа нет (например, из-за разницы часовых поясов крайняя дата выпала), 
            // можно попробовать добавить или игнорировать.
            // Для недель и месяцев надежнее проверять вхождение или приводить к тому же формату.
            
            if (statsMap.has(key)) {
                statsMap.set(key, statsMap.get(key)! + 1);
            } else {
                // Если период 'day', иногда бывает расхождение на границе суток из-за UTC.
                // Можно просто добавить в карту, если нам не критичен строгий range визуально.
                // Но лучше оставить как есть для чистоты графика.
                // console.log(`[Stats] Key mismatch: ${key}`);
            }
        });

        // Преобразуем в массив
        const chartData = Array.from(statsMap.entries())
            .map(([date, count]) => ({ date, count }))
            // Сортировка по дате
            .sort((a, b) => a.date.localeCompare(b.date));

        // 3. Доп метрики
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const newOrdersToday = await prisma.order.count({
            where: { createdAt: { gte: todayStart } }
        });
        const totalOrders = await prisma.order.count();

        res.json({
            totalUsers,
            activeUsers,
            newOrdersToday,
            totalOrders,
            chartData
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching dashboard stats' });
    }
};

// Вспомогательная функция для получения метки недели (например, "Week 42" или дата понедельника)
// Для простоты будем использовать "YYYY-Www" или дату начала недели
function getWeekLabel(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    // Get first day of year
    const yearStart = new Date(d.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    // Return YYYY-Www
    return `${d.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}
