import { randomBytes } from 'crypto';
import { prisma } from '../config/database';
import { logger } from '../config/logger';

/**
 * Генерирует уникальный реферальный код
 * Формат: 8 символов (буквы и цифры)
 */
export const generateReferralCode = async (): Promise<string> => {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = randomBytes(4)
      .toString('base64')
      .replace(/[+/=]/g, '')
      .substring(0, 8)
      .toUpperCase();

    // Проверяем уникальность
    const existing = await prisma.user.findUnique({
      where: { referralCode: code }
    });

    if (!existing) {
      return code;
    }
  }

  // Если не удалось сгенерировать уникальный код за 10 попыток,
  // используем timestamp для гарантии уникальности
  const timestamp = Date.now().toString(36).toUpperCase();
  return timestamp.substring(0, 8);
};

/**
 * Проверяет существование реферального кода
 */
export const validateReferralCode = async (code: string): Promise<boolean> => {
  if (!code || code.length < 4) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { referralCode: code }
  });

  return !!user;
};

/**
 * Начисляет бонусы реферру за регистрацию нового пользователя
 * 50 бонусов за регистрацию
 */
export const awardReferralRegistrationBonus = async (referrerId: string) => {
  try {
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        bonusBalance: { increment: 50 }
      }
    });

    logger.info(`Начислено 50 бонусов пользователю ${referrerId} за приглашение друга`);
  } catch (error) {
    logger.error(`Ошибка при начислении бонусов за регистрацию: ${error}`);
  }
};

/**
 * Начисляет бонусы реферру за первую покупку приглашенного друга
 * 200 бонусов за первую покупку до 31.12.2025
 */
export const awardReferralFirstPurchaseBonus = async (
  referredUserId: string,
  referrerId: string
) => {
  try {
    // Проверяем дату - бонус действует до 31.12.2025
    const deadline = new Date('2025-12-31T23:59:59');
    const now = new Date();

    if (now > deadline) {
      logger.info(`Акция закончилась. Бонус за первую покупку не начисляется.`);
      return;
    }

    // Проверяем, не был ли уже начислен бонус
    const referredUser = await prisma.user.findUnique({
      where: { id: referredUserId }
    });

    if (referredUser?.referralBonusAwarded) {
      logger.info(`Бонус за первую покупку уже был начислен для пользователя ${referredUserId}`);
      return;
    }

    // Начисляем бонусы реферру
    await prisma.user.update({
      where: { id: referrerId },
      data: {
        bonusBalance: { increment: 200 }
      }
    });

    // Отмечаем, что бонус начислен
    await prisma.user.update({
      where: { id: referredUserId },
      data: {
        referralBonusAwarded: true
      }
    });

    logger.info(`Начислено 200 бонусов пользователю ${referrerId} за первую покупку друга ${referredUserId}`);

    // Проверяем, не пора ли начислить бонус за каждые 10 друзей
    await checkAndAwardTenFriendsBonus(referrerId);
  } catch (error) {
    logger.error(`Ошибка при начислении бонусов за первую покупку: ${error}`);
  }
};

/**
 * Проверяет и начисляет бонусы за каждые 10 приглашенных друзей
 * 250 бонусов за каждые 10 друзей
 */
export const checkAndAwardTenFriendsBonus = async (referrerId: string) => {
  try {
    // Получаем данные реферра
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
      select: { tenFriendsBonusCount: true }
    });

    if (!referrer) {
      logger.error(`Реферр не найден: ${referrerId}`);
      return;
    }

    // Считаем общее количество приглашенных друзей
    const referralsCount = await prisma.user.count({
      where: { referredById: referrerId }
    });

    // Вычисляем, сколько раз пользователь должен получить бонус (каждые 10 друзей)
    const expectedBonusCount = Math.floor(referralsCount / 10);

    // Проверяем, нужно ли начислить новые бонусы
    if (expectedBonusCount > referrer.tenFriendsBonusCount) {
      const newBonuses = expectedBonusCount - referrer.tenFriendsBonusCount;
      const bonusAmount = newBonuses * 250;

      // Начисляем бонусы
      await prisma.user.update({
        where: { id: referrerId },
        data: {
          bonusBalance: { increment: bonusAmount },
          tenFriendsBonusCount: expectedBonusCount
        }
      });

      logger.info(
        `Начислено ${bonusAmount} бонусов пользователю ${referrerId} за приглашение ${referralsCount} друзей (${newBonuses} новых бонусов по 250)`
      );
    }
  } catch (error) {
    logger.error(`Ошибка при проверке бонусов за 10 друзей: ${error}`);
  }
};
