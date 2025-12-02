import { randomInt } from 'crypto';
import type { Prisma, User } from '@prisma/client';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { deliverLoginCode } from './smsService';
import {
  signAccessToken,
  createRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
} from './tokenService';
import {
  validateTelegramAuth,
  type TelegramAuthUser
} from './telegramService';
import { generateReferralCode, validateReferralCode } from '../utils/referralUtils';
import { normalizePhoneNumber } from '../utils/phone';
import {
  authenticateWithGoogle,
  authenticateWithYandex,
  authenticateWithApple,
  type OAuthUser
} from './oauthService';
import { telegramBot } from '../config/telegram';

const codeStorage = new Map<string, { code: string; expiresAt: number }>();

const mapUserToAuthPayload = (user: User) => ({
  id: user.id,
  phone: user.phone,
  firstName: user.firstName,
  lastName: user.lastName,
  middleName: user.middleName,
  bonusBalance: user.bonusBalance ?? 0,
  displayName:
    user.displayName && user.displayName.trim().length > 0
      ? user.displayName
      : [user.firstName, user.lastName]
          .map((part) => (part ? part.trim() : ''))
          .filter((part) => part.length > 0)
          .join(' ') || user.phone || 'Пользователь',
  avatar: user.avatar,
  telegramId: user.telegramId,
  telegramUsername: user.telegramUsername,
  referralCode: user.referralCode,
  dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
  gender: user.gender,
  isRegistrationComplete: user.isRegistrationComplete ?? false,
  notifications: {
    email: user.emailNotifications ?? true,
    sms: user.smsNotifications ?? true,
    telegram: user.telegramNotifications ?? true,
    push: user.pushNotifications ?? true,
    marketing: user.marketingConsent ?? false
  }
});

/**
 * Извлекает количество бонусов из кода приза
 * Например: bonus_1000 -> 1000, bonus_3000 -> 3000
 */
const extractBonusAmount = (prizeCode: string): number => {
  const match = prizeCode.match(/bonus_(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
};

/**
 * Начисляет бонусы из неиспользованных призов пользователю на базовую карту
 */
const awardPrizeBonuses = async (userId: string, telegramId: string | null) => {
  if (!telegramId) {
    return; // Если нет telegramId - нечего проверять
  }

  try {
    // Проверяем, крутил ли пользователь рулетку
    const rouletteLog = await prisma.rouletteLog.findUnique({
      where: { userId: userId }
    });

    if (rouletteLog) {
      logger.info(`Пользователь ${userId} уже крутил рулетку, промокоды недоступны`);
      return; // Если пользователь крутил рулетку, промокоды недоступны
    }

    // Ищем неиспользованные призы с этим telegramId
    const unusedPrize = await prisma.prizeCode.findFirst({
      where: {
        telegramId: telegramId,
        userId: null // Еще не привязан к пользователю
      }
    });

    if (!unusedPrize) {
      return; // Нет неиспользованных призов
    }

    // Извлекаем количество бонусов из кода приза
    const bonusAmount = extractBonusAmount(unusedPrize.prizeCode);

    if (bonusAmount > 0) {
      // Начисляем бонусы на базовую карту
      const { bonusService } = await import('./bonus.service');
      await bonusService.awardPrizeBonuses(
        userId,
        bonusAmount,
        `Приз из колеса фортуны: ${unusedPrize.prizeName}`
      );

      // Помечаем приз как использованный этим пользователем
      await prisma.prizeCode.update({
        where: { id: unusedPrize.id },
        data: {
          userId: userId,
          used: true,
          usedAt: new Date()
        }
      });

      logger.info(
        `🎁 Начислено ${bonusAmount} бонусов пользователю ${userId} (Telegram ID: ${telegramId}) из приза ${unusedPrize.prizeName} на базовую карту`
      );
    }
  } catch (error) {
    logger.error('Ошибка при начислении бонусов из приза:', error);
    // Не прерываем регистрацию из-за ошибки начисления бонусов
  }
};

/**
 * Отправляет уведомление рефереру о новой регистрации
 */
const notifyReferrerAboutNewUser = async (referrerId: string, newUser: User) => {
  if (!telegramBot) {
    return; // Бот не инициализирован
  }

  try {
    // Получаем информацию о реферере
    const referrer = await prisma.user.findUnique({
      where: { id: referrerId },
      select: {
        telegramChatId: true,
        firstName: true
      }
    });

    if (!referrer?.telegramChatId) {
      logger.info(`Реферер ${referrerId} не имеет telegramChatId, уведомление не отправлено`);
      return;
    }

    // Формируем сообщение
    const username = newUser.telegramUsername ? `@${newUser.telegramUsername}` : newUser.displayName || 'Новый пользователь';

    const message = [
      '🎉 По вашей реферальной ссылке зарегистрировался новый пользователь!',
      '',
      `👤 ${username}`,
      '',
      '💰 Чтобы получить 50 бонусов, новому пользователю необходимо совершить покупку.',
      '',
      'Следите за обновлениями в разделе "Рефералы"!'
    ].join('\n');

    await telegramBot.sendMessage(referrer.telegramChatId, message);
    logger.info(`✅ Отправлено уведомление рефереру ${referrerId} о регистрации ${newUser.id}`);
  } catch (error) {
    logger.error(`Ошибка при отправке уведомления рефереру ${referrerId}:`, error);
    // Не прерываем регистрацию из-за ошибки отправки уведомления
  }
};

export const requestLoginCode = async (phone: string) => {
  const code = randomInt(1000, 9999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;
  codeStorage.set(phone, { code, expiresAt });
  await deliverLoginCode(phone, code);
  return { success: true };
};

export const verifyLoginCode = async (
  phone: string,
  code: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const stored = codeStorage.get(phone);
  if (!stored || stored.code !== code || stored.expiresAt < Date.now()) {
    throw new Error('Invalid or expired code');
  }

  codeStorage.delete(phone);

  let user = await prisma.user.findUnique({ where: { phone } });
  let isNewUser = false;

  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        registrationSource: 'phone',
        lastLoginAt: new Date()
      }
    });
    isNewUser = true;
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });
  }

  const accessToken = signAccessToken(user.id);
  const refreshToken = await createRefreshToken(user.id, userAgent, ipAddress);

  return {
    accessToken,
    refreshToken,
    isNewUser,
    needsRegistration: !user.isRegistrationComplete,
    user: mapUserToAuthPayload(user)
  };
};

const buildDisplayName = (user: TelegramAuthUser) => {
  const nameParts = [user.firstName, user.lastName]
    .filter((part) => part && part.trim().length > 0)
    .map((part) => part!.trim());

  if (nameParts.length > 0) {
    return nameParts.join(' ');
  }

  if (user.username) {
    return user.username;
  }

  return `Telegram #${user.id}`;
};

export const authenticateWithTelegram = async (
  initData: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const { user, authDate } = await validateTelegramAuth(initData);

  const telegramId = user.id.toString();
  const username = user.username ?? null;
  const normalizedPhone = normalizePhoneNumber(user.phoneNumber);
  const displayName = buildDisplayName(user);
  const avatar = user.photoUrl?.trim() || null;
  const allowsWriteToPm = user.allowsWriteToPm;

  let existingUser = await prisma.user.findUnique({
    where: { telegramId }
  });

  if (!existingUser && normalizedPhone) {
    existingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (existingUser) {
      logger.info(`Merging Telegram user ${telegramId} with existing phone account ${existingUser.id}`);
      existingUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          telegramId,
          telegramUsername: username ?? existingUser.telegramUsername ?? undefined,
          telegramChatId: existingUser.telegramChatId ?? telegramId,
          lastLoginAt: new Date(),
          avatar: avatar ?? existingUser.avatar ?? undefined,
          firstName: user.firstName ?? existingUser.firstName ?? undefined,
          lastName: user.lastName ?? existingUser.lastName ?? undefined,
          displayName: existingUser.displayName ?? displayName,
          registrationSource: existingUser.registrationSource ?? 'telegram'
        }
      });
    }
  }

  // Если пользователя нет - создаем только если есть номер телефона
  if (!existingUser) {
    // Если нет номера телефона - пользователь должен сначала поделиться контактом
    if (!normalizedPhone) {
      logger.warn(`Telegram user ${telegramId} not found and no phone number provided`);
      throw new Error('TELEGRAM_USER_NOT_FOUND');
    }
    
    // Создаем нового пользователя только если есть номер телефона
    logger.info(`Creating new user from Telegram auth with phone: ${telegramId}`);
    
    existingUser = await prisma.user.create({
      data: {
        telegramId,
        telegramUsername: username,
        telegramChatId: telegramId,
        phone: normalizedPhone,
        firstName: user.firstName,
        lastName: user.lastName,
        displayName,
        avatar,
        registrationSource: 'telegram',
        lastLoginAt: new Date(),
        isRegistrationComplete: false // Требуется завершение регистрации
      }
    });
    
    logger.info(`New user created from Telegram: ${existingUser.id}`);
  }

  const updateData: Prisma.UserUpdateInput = {
    telegramId,
    telegramUsername: username ?? undefined,
    telegramChatId: existingUser.telegramChatId ?? telegramId,
    lastLoginAt: new Date()
  };

  if ((!existingUser.firstName || existingUser.firstName.trim().length === 0) && user.firstName) {
    updateData.firstName = user.firstName;
  }

  if ((!existingUser.lastName || existingUser.lastName.trim().length === 0) && user.lastName) {
    updateData.lastName = user.lastName;
  }

  if (!existingUser.displayName || existingUser.displayName.trim().length === 0) {
    updateData.displayName = displayName;
  }

  if (avatar && avatar !== existingUser.avatar) {
    updateData.avatar = avatar;
  }

  if (!existingUser.registrationSource) {
    updateData.registrationSource = 'telegram';
  }

  if (allowsWriteToPm !== undefined) {
    updateData.telegramNotifications = allowsWriteToPm;
  }

  if (
    normalizedPhone &&
    normalizedPhone !== existingUser.phone
  ) {
    const conflictingUser = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!conflictingUser || conflictingUser.id === existingUser.id) {
      updateData.phone = normalizedPhone;
    } else {
      logger.warn(
        `Telegram user ${telegramId} provided phone ${normalizedPhone}, but it belongs to user ${conflictingUser.id}. Keeping original phone ${existingUser.phone}.`
      );
    }
  }

  existingUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: updateData
  });

  const accessToken = signAccessToken(existingUser.id);
  const refreshToken = await createRefreshToken(existingUser.id, userAgent, ipAddress);

  logger.info(`Telegram user ${telegramId} authenticated at ${authDate.toISOString()}`);

  return {
    accessToken,
    refreshToken,
    isNewUser: false,
    needsRegistration: !existingUser.isRegistrationComplete,
    user: mapUserToAuthPayload(existingUser)
  };
};

export const completeRegistration = async (
  userId: string,
  data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    referredByCode?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  }
) => {
  // Сначала проверяем существование пользователя
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    logger.error(`User not found for completing registration: ${userId}`);
    throw new Error('User not found');
  }

  // Проверяем реферальный код если указан
  let referredById: string | undefined;
  if (data.referredByCode) {
    const upperCode = data.referredByCode.toUpperCase();
    const isValid = await validateReferralCode(upperCode);
    if (!isValid) {
      throw new Error('Неверный реферальный код');
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: upperCode }
    });

    if (referrer && referrer.id !== userId) {
      referredById = referrer.id;
    }
  }

  // Генерируем уникальный реферальный код для пользователя
  const referralCode = await generateReferralCode();

  // Обновляем пользователя
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      referredById,
      referralCode,
      isRegistrationComplete: true,
      displayName: `${data.firstName} ${data.lastName}`
    }
  });

  // Начисляем бонусы реферру если есть
  if (referredById) {
    const { awardReferralRegistrationBonus, checkAndAwardTenFriendsBonus } = await import('../utils/referralUtils');
    await awardReferralRegistrationBonus(referredById);
    await checkAndAwardTenFriendsBonus(referredById);

    // Отправляем уведомление рефереру о новой регистрации
    await notifyReferrerAboutNewUser(referredById, user);
  }

  // Проверяем и начисляем бонусы из призов, если есть неиспользованные призы с telegramId
  await awardPrizeBonuses(user.id, user.telegramId);

  return {
    user: mapUserToAuthPayload(user)
  };
};

export const refreshTokens = async (
  refreshToken: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const tokenData = await validateRefreshToken(refreshToken);

  // Удаляем старый refresh token
  await revokeRefreshToken(refreshToken);

  // Создаем новые токены
  const accessToken = signAccessToken(tokenData.userId);
  const newRefreshToken = await createRefreshToken(
    tokenData.userId,
    userAgent,
    ipAddress
  );

  // Обновляем время последнего входа
  await prisma.user.update({
    where: { id: tokenData.userId },
    data: { lastLoginAt: new Date() }
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: mapUserToAuthPayload(tokenData.user)
  };
};

export const logoutUser = async (refreshToken: string) => {
  try {
    await revokeRefreshToken(refreshToken);
  } catch (error) {
    // Игнорируем ошибку если токен не найден
    logger.warn(`Failed to revoke refresh token: ${error}`);
  }
};

export const logoutAllDevices = async (userId: string) => {
  await revokeAllUserTokens(userId);
};

export const registerWithTelegram = async (
  initData: string,
  phone: string,
  data: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: Date;
    referredByCode?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  },
  userAgent?: string,
  ipAddress?: string
) => {
  // Валидируем Telegram данные
  const { user, authDate } = await validateTelegramAuth(initData);

  const telegramId = user.id.toString();
  const username = user.username ?? null;
  const normalizedPhone = normalizePhoneNumber(phone);
  const displayName = buildDisplayName(user);
  const avatar = user.photoUrl?.trim() || null;

  if (!normalizedPhone) {
    throw new Error('Invalid phone number');
  }

  // Проверяем, нет ли уже пользователя с таким телефоном или Telegram ID
  const existingUserByPhone = await prisma.user.findUnique({
    where: { phone: normalizedPhone }
  });

  const existingUserByTelegram = telegramId
    ? await prisma.user.findUnique({
        where: { telegramId }
      })
    : null;

  // Если пользователь с таким телефоном уже существует
  if (existingUserByPhone) {
    // Если это тот же пользователь (совпадает telegramId) - обновляем данные и авторизуем
    if (existingUserByPhone.telegramId === telegramId) {
      // Обновляем данные пользователя
      const updatedUser = await prisma.user.update({
        where: { id: existingUserByPhone.id },
        data: {
          telegramId,
          telegramUsername: username,
          telegramChatId: telegramId,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          displayName: `${data.firstName} ${data.lastName}`,
          avatar: avatar ?? existingUserByPhone.avatar ?? undefined,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          lastLoginAt: new Date(),
          isRegistrationComplete: true
        }
      });

      // Проверяем и начисляем бонусы из призов
      await awardPrizeBonuses(updatedUser.id, telegramId);

      const accessToken = signAccessToken(updatedUser.id);
      const refreshToken = await createRefreshToken(updatedUser.id, userAgent, ipAddress);

      logger.info(`Existing user updated via Telegram registration: ${updatedUser.id}`);

      return {
        accessToken,
        refreshToken,
        isNewUser: false,
        needsRegistration: false,
        user: mapUserToAuthPayload(updatedUser)
      };
    } else {
      // Телефон уже зарегистрирован другим пользователем
      throw new Error('PHONE_ALREADY_REGISTERED');
    }
  }

  // Если пользователь с таким Telegram ID уже существует, но с другим телефоном
  if (existingUserByTelegram && existingUserByTelegram.phone !== normalizedPhone) {
    // Обновляем телефон, если он отличается
    const updatedUser = await prisma.user.update({
      where: { id: existingUserByTelegram.id },
      data: {
        phone: normalizedPhone,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName,
        displayName: `${data.firstName} ${data.lastName}`,
        avatar: avatar ?? existingUserByTelegram.avatar ?? undefined,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        lastLoginAt: new Date(),
        isRegistrationComplete: true
      }
    });

    // Проверяем и начисляем бонусы из призов
    await awardPrizeBonuses(updatedUser.id, telegramId);

    const accessToken = signAccessToken(updatedUser.id);
    const refreshToken = await createRefreshToken(updatedUser.id, userAgent, ipAddress);

    logger.info(`Existing Telegram user updated with new phone: ${updatedUser.id}`);

    return {
      accessToken,
      refreshToken,
      isNewUser: false,
      needsRegistration: false,
      user: mapUserToAuthPayload(updatedUser)
    };
  }

  // Проверяем реферальный код
  // Приоритет: 1) ReferralClick (из таблицы кликов), 2) переданный код вручную
  let referredById: string | undefined;
  let usedReferralCode: string | undefined;

  // Сначала проверяем таблицу ReferralClick
  const referralClick = await prisma.referralClick.findUnique({
    where: { telegramId }
  });

  if (referralClick) {
    // Используем код из таблицы кликов
    usedReferralCode = referralClick.referralCode;
    logger.info(`Найден реферальный клик для ${telegramId}: ${usedReferralCode}`);
  } else if (data.referredByCode) {
    // Используем переданный код
    usedReferralCode = data.referredByCode.toUpperCase();
  }

  // Если есть код (из любого источника), валидируем его
  if (usedReferralCode) {
    const isValid = await validateReferralCode(usedReferralCode);
    if (!isValid) {
      throw new Error('Неверный реферальный код');
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: usedReferralCode }
    });

    if (referrer) {
      referredById = referrer.id;
    }
  }

  // Генерируем уникальный реферальный код
  const referralCode = await generateReferralCode();

  // Создаем нового пользователя
  const newUser = await prisma.user.create({
    data: {
      telegramId,
      telegramUsername: username,
      telegramChatId: telegramId,
      phone: normalizedPhone,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      displayName: `${data.firstName} ${data.lastName}`,
      avatar,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      referredById,
      referralCode,
      registrationSource: 'telegram',
      lastLoginAt: new Date(),
      isRegistrationComplete: true // Регистрация сразу завершена
    }
  });

  // Начисляем бонусы реферру если есть
  if (referredById) {
    const { awardReferralRegistrationBonus, checkAndAwardTenFriendsBonus } = await import('../utils/referralUtils');
    await awardReferralRegistrationBonus(referredById);
    await checkAndAwardTenFriendsBonus(referredById);

    // Отправляем уведомление рефереру о новой регистрации
    await notifyReferrerAboutNewUser(referredById, newUser);
  }

  // Удаляем запись из ReferralClick после успешной регистрации
  if (referralClick) {
    try {
      await prisma.referralClick.delete({
        where: { telegramId }
      });
      logger.info(`Удалена запись о реферальном клике для ${telegramId} после регистрации`);
    } catch (error) {
      logger.warn(`Не удалось удалить реферальный клик: ${error}`);
    }
  }

  // Проверяем и начисляем бонусы из призов, если есть неиспользованные призы с telegramId
  await awardPrizeBonuses(newUser.id, telegramId);

  const accessToken = signAccessToken(newUser.id);
  const refreshToken = await createRefreshToken(newUser.id, userAgent, ipAddress);

  logger.info(`New user registered via Telegram: ${newUser.id} at ${authDate.toISOString()}`);

  return {
    accessToken,
    refreshToken,
    isNewUser: true,
    needsRegistration: false,
    user: mapUserToAuthPayload(newUser)
  };
};

export const getTelegramLoginConfig = () => {
  if (!env.telegramBotToken) {
    throw new Error('Telegram auth disabled');
  }

  const parts = env.telegramBotToken.split(':');
  const botId = parts[0];

  if (!botId || botId.trim().length === 0) {
    throw new Error('Invalid Telegram bot token');
  }

  return {
    botId
  };
};

/**
 * Общая функция для аутентификации через OAuth провайдеров
 */
const authenticateWithOAuth = async (
  provider: 'google' | 'yandex' | 'apple',
  oauthUser: OAuthUser,
  userAgent?: string,
  ipAddress?: string
) => {
  const providerId = oauthUser.id;

  // Ищем пользователя по ID провайдера
  let existingUser: User | null = null;
  
  if (provider === 'google') {
    existingUser = await prisma.user.findUnique({
      where: { googleId: providerId }
    });
  } else if (provider === 'yandex') {
    existingUser = await prisma.user.findUnique({
      where: { yandexId: providerId }
    });
  } else if (provider === 'apple') {
    existingUser = await prisma.user.findUnique({
      where: { appleId: providerId }
    });
  }

  // Если не найден, ищем по email
  if (!existingUser && oauthUser.email) {
    existingUser = await prisma.user.findFirst({
      where: { email: oauthUser.email }
    });

    if (existingUser) {
      // Объединяем аккаунты
      logger.info(`Merging ${provider} user ${providerId} with existing email account ${existingUser.id}`);
      const updateData: Prisma.UserUpdateInput = {
        email: oauthUser.email,
        lastLoginAt: new Date(),
        avatar: oauthUser.avatar ?? existingUser.avatar ?? undefined,
        firstName: oauthUser.firstName ?? existingUser.firstName ?? undefined,
        lastName: oauthUser.lastName ?? existingUser.lastName ?? undefined,
        displayName: existingUser.displayName ?? oauthUser.displayName ?? undefined,
        registrationSource: existingUser.registrationSource ?? provider
      };
      
      if (provider === 'google') {
        updateData.googleId = providerId;
      } else if (provider === 'yandex') {
        updateData.yandexId = providerId;
      } else if (provider === 'apple') {
        updateData.appleId = providerId;
      }
      
      existingUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData
      });
    }
  }

  // Если пользователя нет - создаем нового
  if (!existingUser) {
    // Для OAuth пользователей нужен либо email, либо телефон
    // Но так как у нас phone обязателен (unique), создаем уникальный номер на основе OAuth ID
    const uniquePhone = `oauth_${provider}_${providerId.slice(0, 15)}`;
    
    logger.info(`Creating new user from ${provider} auth: ${providerId}`);
    
    const createData: Prisma.UserCreateInput = {
      email: oauthUser.email ?? undefined,
      phone: uniquePhone, // Уникальный номер на основе OAuth ID
      firstName: oauthUser.firstName,
      lastName: oauthUser.lastName,
      displayName: oauthUser.displayName || oauthUser.email || `User ${providerId.slice(0, 8)}`,
      avatar: oauthUser.avatar,
      registrationSource: provider,
      lastLoginAt: new Date(),
      isRegistrationComplete: !!(oauthUser.firstName && oauthUser.lastName) // Если есть имя и фамилия - регистрация завершена
    };
    
    if (provider === 'google') {
      createData.googleId = providerId;
    } else if (provider === 'yandex') {
      createData.yandexId = providerId;
    } else if (provider === 'apple') {
      createData.appleId = providerId;
    }
    
    existingUser = await prisma.user.create({
      data: createData
    });
    
    logger.info(`New user created from ${provider}: ${existingUser.id}`);
  }

  // Обновляем данные пользователя
  const updateData: Prisma.UserUpdateInput = {
    lastLoginAt: new Date()
  };

  if ((!existingUser.firstName || existingUser.firstName.trim().length === 0) && oauthUser.firstName) {
    updateData.firstName = oauthUser.firstName;
  }

  if ((!existingUser.lastName || existingUser.lastName.trim().length === 0) && oauthUser.lastName) {
    updateData.lastName = oauthUser.lastName;
  }

  if (!existingUser.displayName || existingUser.displayName.trim().length === 0) {
    updateData.displayName = oauthUser.displayName;
  }

  if (oauthUser.avatar && oauthUser.avatar !== existingUser.avatar) {
    updateData.avatar = oauthUser.avatar;
  }

  if (oauthUser.email && oauthUser.email !== existingUser.email) {
    // Проверяем, нет ли конфликта с другим пользователем
    const conflictingUser = await prisma.user.findFirst({
      where: { email: oauthUser.email }
    });

    if (!conflictingUser || conflictingUser.id === existingUser.id) {
      updateData.email = oauthUser.email;
    }
  }

  existingUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: updateData
  });

  const accessToken = signAccessToken(existingUser.id);
  const refreshToken = await createRefreshToken(existingUser.id, userAgent, ipAddress);

  logger.info(`${provider} user ${providerId} authenticated`);

  return {
    accessToken,
    refreshToken,
    isNewUser: false,
    needsRegistration: !existingUser.isRegistrationComplete,
    user: mapUserToAuthPayload(existingUser)
  };
};

export const authenticateWithGoogleOAuth = async (
  code: string,
  redirectUri: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const oauthUser = await authenticateWithGoogle(code, redirectUri);
  return authenticateWithOAuth('google', oauthUser, userAgent, ipAddress);
};

export const authenticateWithYandexOAuth = async (
  code: string,
  redirectUri: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const oauthUser = await authenticateWithYandex(code, redirectUri);
  return authenticateWithOAuth('yandex', oauthUser, userAgent, ipAddress);
};

export const authenticateWithAppleOAuth = async (
  code: string,
  redirectUri: string,
  userAgent?: string,
  ipAddress?: string
) => {
  const oauthUser = await authenticateWithApple(code, redirectUri);
  return authenticateWithOAuth('apple', oauthUser, userAgent, ipAddress);
};
