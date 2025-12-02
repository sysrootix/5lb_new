import { prisma } from '../config/database';
import { logger } from '../config/logger';
import {
  awardReferralFirstPurchaseBonus,
  checkAndAwardTenFriendsBonus
} from '../utils/referralUtils';

/**
 * Обрабатывает покупку пользователя и начисляет реферальные бонусы
 * Вызывается при завершении заказа
 */
export const processReferralPurchase = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        referredById: true,
        firstPurchaseDate: true,
        referralBonusAwarded: true
      }
    });

    if (!user) {
      logger.error(`Пользователь не найден: ${userId}`);
      return;
    }

    // Обновляем дату первой покупки, если это первая покупка
    if (!user.firstPurchaseDate) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          firstPurchaseDate: new Date()
        }
      });
    }

    // Если пользователь был приглашен кем-то и еще не получил бонус за первую покупку
    if (user.referredById && !user.referralBonusAwarded) {
      await awardReferralFirstPurchaseBonus(userId, user.referredById);
    }
  } catch (error) {
    logger.error(`Ошибка при обработке реферальной покупки: ${error}`);
  }
};

/**
 * Получает информацию о реферере по реферальному коду
 */
export const getReferrerInfo = async (referralCode: string) => {
  try {
    const upperCode = referralCode.toUpperCase().trim();

    if (!upperCode || upperCode.length < 4) {
      return null;
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: upperCode },
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
      name: referrer.displayName || [referrer.firstName, referrer.lastName].filter(Boolean).join(' ') || 'Пользователь'
    };
  } catch (error) {
    logger.error(`Ошибка при получении информации о реферере: ${error}`);
    return null;
  }
};

/**
 * Получает статистику рефералов для пользователя
 */
export const getReferralStats = async (userId: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        tenFriendsBonusCount: true
      }
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Получаем список рефералов
    const referrals = await prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        firstPurchaseDate: true,
        referralBonusAwarded: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const totalReferrals = referrals.length;
    const referralsWithPurchase = referrals.filter(r => r.firstPurchaseDate).length;

    // Вычисляем прогресс до следующего бонуса за 10 друзей
    const nextMilestone = (user.tenFriendsBonusCount + 1) * 10;
    const referralsUntilNextBonus = nextMilestone - totalReferrals;

    return {
      referralCode: user.referralCode,
      totalReferrals,
      referralsWithPurchase,
      tenFriendsBonusCount: user.tenFriendsBonusCount,
      referralsUntilNextBonus: Math.max(0, referralsUntilNextBonus),
      referrals: referrals.map(r => ({
        id: r.id,
        name: [r.firstName, r.lastName].filter(Boolean).join(' ') || 'Пользователь',
        phone: r.phone,
        registeredAt: r.createdAt,
        hasPurchase: !!r.firstPurchaseDate,
        purchaseDate: r.firstPurchaseDate,
        bonusAwarded: r.referralBonusAwarded
      }))
    };
  } catch (error) {
    logger.error(`Ошибка при получении статистики рефералов: ${error}`);
    throw error;
  }
};
