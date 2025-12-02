import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { env } from '../config/env';
import crypto from 'crypto';

// Конфигурация Telegram бота
const TELEGRAM_BOT_USERNAME = 'pro_5lb_bot';
const TELEGRAM_BOT_URL = `https://t.me/${TELEGRAM_BOT_USERNAME}`;

// Функция для генерации уникального хеша
function generateUniqueHash(): string {
  const randomBytes = crypto.randomBytes(10);
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let hash = '';
  
  for (let i = 0; i < 16; i++) {
    const byte = randomBytes[i % randomBytes.length];
    hash += chars[byte % chars.length];
  }
  
  return hash;
}

// Функция для генерации ссылки на Telegram бота с параметрами
function generateTelegramLink(hash: string): string {
  return `${TELEGRAM_BOT_URL}?start=${hash}`;
}

// Функция для выбора приза на основе весов
async function selectPrize() {
  const prizes = await prisma.prize.findMany({
    where: { isActive: true }
  });

  if (prizes.length === 0) {
    throw new Error('Нет доступных призов');
  }

  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const prize of prizes) {
    random -= prize.weight;
    if (random <= 0) {
      return prize;
    }
  }
  
  // Fallback на первый приз
  return prizes[0];
}

/**
 * API endpoint для получения приза (спин колеса фортуны)
 * POST /api/spin
 */
export const spin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Выбираем случайный приз на основе весов
    const prize = await selectPrize();

    // Получаем все призы для определения индекса
    const allPrizes = await prisma.prize.findMany({
      where: { isActive: true },
      orderBy: { weight: 'desc' }
    });
    const prizeIndex = allPrizes.findIndex(p => p.id === prize.id);

    // Генерируем уникальный хеш для этого спина
    let hash = generateUniqueHash();

    // Убеждаемся, что хеш уникален
    let existingCode = await prisma.prizeCode.findUnique({
      where: { hash }
    });
    
    while (existingCode) {
      hash = generateUniqueHash();
      existingCode = await prisma.prizeCode.findUnique({
        where: { hash }
      });
    }

    // Сохраняем связь хеш -> приз в БД
    await prisma.prizeCode.create({
      data: {
        hash,
        prizeId: prize.id,
        prizeName: prize.name,
        prizeCode: prize.code,
        used: false
      }
    });

    // Генерируем ссылку на Telegram бота
    const telegramLink = generateTelegramLink(hash);

    // Логируем для отладки
    logger.info(`🎰 Выпал приз: "${prize.name}" (индекс: ${prizeIndex}, код: ${prize.code}, хеш: ${hash})`);
    logger.info(`🔗 Ссылка: ${telegramLink}`);

    res.json({
      success: true,
      prize: {
        name: prize.name,
        index: prizeIndex
      },
      telegramLink: telegramLink
    });
  } catch (error) {
    logger.error('Ошибка при обработке запроса спина:', error);
    next(error);
  }
};

/**
 * API endpoint для получения информации о призе по хешу (для Telegram бота)
 * GET /api/prize/:hash
 */
export const getPrizeByHash = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hash = req.params.hash;
    
    if (!hash || hash.length < 12) {
      return res.status(400).json({
        success: false,
        error: 'Неверный формат хеша'
      });
    }
    
    const prizeInfo = await prisma.prizeCode.findUnique({
      where: { hash }
    });
    
    if (!prizeInfo) {
      return res.status(404).json({
        success: false,
        error: 'Код не найден или недействителен'
      });
    }
    
    // Проверяем, использован ли код (есть userId)
    if (prizeInfo.userId) {
      return res.status(410).json({
        success: false,
        error: 'Код уже использован',
        prize: {
          name: prizeInfo.prizeName,
          code: prizeInfo.prizeCode
        },
        usedAt: prizeInfo.usedAt
      });
    }
    
    res.json({
      success: true,
      prize: {
        name: prizeInfo.prizeName,
        code: prizeInfo.prizeCode
      },
      createdAt: prizeInfo.createdAt
    });
  } catch (error) {
    logger.error('Ошибка при получении информации о призе:', error);
    next(error);
  }
};

/**
 * Health check endpoint
 * GET /api/health
 */
export const healthCheck = async (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Сервер работает' });
};

/**
 * Получение списка призов
 * GET /api/prizes
 */
export const getPrizes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const prizes = await prisma.prize.findMany({
      where: { isActive: true },
      orderBy: { weight: 'desc' }
    });

    res.json({
      success: true,
      prizes: prizes.map((p, index) => ({
        name: p.name,
        index
      }))
    });
  } catch (error) {
    logger.error('Ошибка при получении списка призов:', error);
    next(error);
  }
};

