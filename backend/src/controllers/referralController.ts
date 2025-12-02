import { Request, Response } from 'express';
import { getReferralStats, getReferrerInfo } from '../services/referralService';
import { recordReferralClick, getReferralClickByTelegramId } from '../services/referralClickService';
import { logger } from '../config/logger';

/**
 * Получает статистику рефералов для текущего пользователя
 */
export const getUserReferralStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Не авторизован' });
    }

    const stats = await getReferralStats(userId);
    return res.json(stats);
  } catch (error) {
    logger.error(`Ошибка при получении статистики рефералов: ${error}`);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Получает информацию о реферере по коду (публичный endpoint)
 */
export const getReferrerByCode = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({ error: 'Код не указан' });
    }

    const referrerInfo = await getReferrerInfo(code);

    if (!referrerInfo) {
      return res.status(404).json({ error: 'Реферер не найден' });
    }

    return res.json(referrerInfo);
  } catch (error) {
    logger.error(`Ошибка при получении информации о реферере: ${error}`);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Записывает переход по реферальной ссылке (публичный endpoint)
 */
export const recordClick = async (req: Request, res: Response) => {
  try {
    const { telegramId, referralCode } = req.body;

    if (!telegramId || !referralCode) {
      return res.status(400).json({ error: 'Необходимо указать telegramId и referralCode' });
    }

    const result = await recordReferralClick(telegramId, referralCode);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    return res.json(result);
  } catch (error) {
    logger.error(`Ошибка при записи реферального клика: ${error}`);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

/**
 * Получает реферальный код по Telegram ID (публичный endpoint)
 */
export const getReferralClickByTgId = async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.params;

    if (!telegramId) {
      return res.status(400).json({ error: 'Необходимо указать telegramId' });
    }

    const result = await getReferralClickByTelegramId(telegramId);

    if (!result) {
      return res.status(404).json({ error: 'Реферальный код не найден' });
    }

    return res.json(result);
  } catch (error) {
    logger.error(`Ошибка при получении реферального клика: ${error}`);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};
