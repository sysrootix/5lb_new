import { prisma } from '../config/database';
import { logger } from '../config/logger';
import { validateReferralCode } from '../utils/referralUtils';

/**
 * Записывает переход по реферальной ссылке
 * Вызывается когда пользователь открывает бота с start_param
 */
export const recordReferralClick = async (telegramId: string, referralCode: string) => {
  try {
    const upperCode = referralCode.toUpperCase().trim();

    // Проверяем валидность реферального кода
    const isValid = await validateReferralCode(upperCode);
    if (!isValid) {
      logger.warn(`Попытка записи с невалидным реферальным кодом: ${referralCode}`);
      return { success: false, error: 'Неверный реферальный код' };
    }

    // Проверяем, не является ли пользователь уже зарегистрированным
    const existingUser = await prisma.user.findUnique({
      where: { telegramId },
      select: { id: true, referredById: true }
    });

    if (existingUser) {
      if (existingUser.referredById) {
        logger.info(`Пользователь ${telegramId} уже привязан к другому рефереру`);
        return { success: false, error: 'Вы уже зарегистрированы по другой реферальной ссылке' };
      }
      // Если пользователь зарегистрирован, но не имеет реферера - не записываем клик
      logger.info(`Пользователь ${telegramId} уже зарегистрирован без реферера`);
      return { success: false, error: 'Вы уже зарегистрированы' };
    }

    // Проверяем, есть ли уже запись о переходе
    const existingClick = await prisma.referralClick.findUnique({
      where: { telegramId }
    });

    if (existingClick) {
      // Обновляем существующую запись (перезаписываем реферальный код)
      await prisma.referralClick.update({
        where: { telegramId },
        data: { referralCode: upperCode }
      });
      logger.info(`Обновлен реферальный клик для ${telegramId} на код ${upperCode}`);
    } else {
      // Создаем новую запись
      await prisma.referralClick.create({
        data: {
          telegramId,
          referralCode: upperCode
        }
      });
      logger.info(`Записан реферальный клик: ${telegramId} → ${upperCode}`);
    }

    // Получаем информацию о реферере
    const referrer = await prisma.user.findUnique({
      where: { referralCode: upperCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true
      }
    });

    if (referrer) {
      return {
        success: true,
        referrerName: referrer.displayName || [referrer.firstName, referrer.lastName].filter(Boolean).join(' ') || 'Пользователь'
      };
    }

    return { success: true };
  } catch (error) {
    logger.error(`Ошибка при записи реферального клика: ${error}`);
    return { success: false, error: 'Внутренняя ошибка сервера' };
  }
};

/**
 * Получает реферальный код и информацию о реферере для пользователя по его Telegram ID
 */
export const getReferralClickByTelegramId = async (telegramId: string) => {
  try {
    const click = await prisma.referralClick.findUnique({
      where: { telegramId }
    });

    if (!click) {
      return null;
    }

    // Получаем информацию о реферере
    const referrer = await prisma.user.findUnique({
      where: { referralCode: click.referralCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true
      }
    });

    if (!referrer) {
      return null;
    }

    return {
      referralCode: click.referralCode,
      referrerName: referrer.displayName || [referrer.firstName, referrer.lastName].filter(Boolean).join(' ') || 'Пользователь'
    };
  } catch (error) {
    logger.error(`Ошибка при получении реферального клика: ${error}`);
    return null;
  }
};

/**
 * Удаляет запись о реферальном клике после успешной регистрации
 */
export const deleteReferralClick = async (telegramId: string) => {
  try {
    await prisma.referralClick.delete({
      where: { telegramId }
    });
    logger.info(`Удалена запись о реферальном клике для ${telegramId}`);
  } catch (error) {
    // Не критично если запись не найдена
    logger.debug(`Не удалось удалить реферальный клик для ${telegramId}: ${error}`);
  }
};
