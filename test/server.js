const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 7711;

// Конфигурация Telegram бота
const TELEGRAM_BOT_USERNAME = 'pro_5lb_bot';
const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

// Призы с весами (вероятностями)
const PRIZES = [
    { name: '1000 бонусов', weight: 40, code: 'bonus_1000' },
    { name: '3000 бонусов', weight: 25, code: 'bonus_3000' },
    { name: '5000 бонусов', weight: 20, code: 'bonus_5000' },
    { name: '7000 бонусов', weight: 10, code: 'bonus_7000' },
    { name: '10000 бонусов', weight: 5, code: 'bonus_10000' }
];

// Хранилище кодов призов (хеш -> информация о призе)
// В продакшене лучше использовать базу данных (Redis, MongoDB и т.д.)
const prizeCodes = new Map();

// Функция для генерации уникального хеша
function generateUniqueHash() {
    // Генерируем случайный хеш из букв и цифр (16 символов)
    // Используем комбинацию случайных байтов для более случайного вида
    const randomBytes = crypto.randomBytes(10);
    
    // Создаем строку из букв и цифр
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let hash = '';
    
    // Преобразуем байты в случайные символы
    for (let i = 0; i < 16; i++) {
        const byte = randomBytes[i % randomBytes.length];
        hash += chars[byte % chars.length];
    }
    
    return hash;
}

// Middleware
app.use(cors());
app.use(express.json());

// Функция для выбора приза на основе весов
function selectPrize() {
    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const prize of PRIZES) {
        random -= prize.weight;
        if (random <= 0) {
            return prize;
        }
    }
    
    // Fallback на первый приз
    return PRIZES[0];
}

// Функция для генерации ссылки на Telegram бота с параметрами
function generateTelegramLink(hash) {
    // Формат: https://t.me/botname?start=hash
    return `${TELEGRAM_BOT_URL}?start=${hash}`;
}

// API endpoint для получения приза
app.post('/api/spin', (req, res) => {
    try {
        // Выбираем случайный приз на основе весов
        const prize = selectPrize();

        // Находим индекс приза в массиве PRIZES
        const prizeIndex = PRIZES.findIndex(p => p.name === prize.name);

        // Генерируем уникальный хеш для этого спина
        let hash = generateUniqueHash();

        // Убеждаемся, что хеш уникален (на практике вероятность коллизии очень мала)
        while (prizeCodes.has(hash)) {
            hash = generateUniqueHash();
        }

        // Сохраняем связь хеш -> приз
        prizeCodes.set(hash, {
            prizeName: prize.name,
            prizeCode: prize.code,
            createdAt: new Date().toISOString(),
            used: false
        });

        // Генерируем ссылку на Telegram бота
        const telegramLink = generateTelegramLink(hash);

        // Логируем для отладки
        console.log(`🎰 Выпал приз: "${prize.name}" (индекс: ${prizeIndex}, код: ${prize.code}, хеш: ${hash})`);
        console.log(`🔗 Ссылка: ${telegramLink}`);

        res.json({
            success: true,
            prize: {
                name: prize.name,
                index: prizeIndex // Добавляем индекс приза для frontend
            },
            telegramLink: telegramLink
        });
    } catch (error) {
        console.error('Ошибка при обработке запроса:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// API endpoint для получения информации о призе по хешу (для Telegram бота)
app.get('/api/prize/:hash', (req, res) => {
    try {
        const hash = req.params.hash;
        
        if (!hash || hash.length < 12) {
            return res.status(400).json({
                success: false,
                error: 'Неверный формат хеша'
            });
        }
        
        const prizeInfo = prizeCodes.get(hash);
        
        if (!prizeInfo) {
            return res.status(404).json({
                success: false,
                error: 'Код не найден или недействителен'
            });
        }
        
        if (prizeInfo.used) {
            return res.status(410).json({
                success: false,
                error: 'Код уже использован',
                prize: {
                    name: prizeInfo.prizeName,
                    code: prizeInfo.prizeCode
                }
            });
        }
        
        // Помечаем код как использованный (опционально, можно убрать если нужно разрешить повторное использование)
        // prizeInfo.used = true;
        
        res.json({
            success: true,
            prize: {
                name: prizeInfo.prizeName,
                code: prizeInfo.prizeCode
            },
            createdAt: prizeInfo.createdAt
        });
    } catch (error) {
        console.error('Ошибка при получении информации о призе:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Сервер работает' });
});

// Получение списка призов (для отладки)
app.get('/api/prizes', (req, res) => {
    const totalWeight = PRIZES.reduce((sum, prize) => sum + prize.weight, 0);

    res.json({
        success: true,
        prizes: PRIZES.map((p, index) => ({
            name: p.name,
            index,
            weight: p.weight,
            probability: Number(((p.weight / totalWeight) * 100).toFixed(2))
        }))
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Telegram бот: ${TELEGRAM_BOT_URL}`);
    console.log(`🎯 API доступен по адресу: http://localhost:${PORT}/api`);
});
