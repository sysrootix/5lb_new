import { randomInt } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database';
import { deliverLoginCode } from './smsService';
import { normalizePhoneNumber } from '../utils/phone';
import { validateTelegramAuth } from './telegramService';
import { logger } from '../config/logger';
import { ValidationError } from '../errors/ValidationError';

const PHONE_CHANGE_TTL_MS = 10 * 60 * 1000; // 10 минут

type PhoneChangeRequest = {
  newPhone: string;
  code: string;
  expiresAt: number;
};

const phoneChangeRequests = new Map<string, PhoneChangeRequest>();

const userSummarySelection = {
  id: true,
  phone: true,
  displayName: true,
  firstName: true,
  lastName: true,
  middleName: true,
  avatar: true,
  bonusBalance: true,
  email: true,
  telegramId: true,
  telegramUsername: true,
  telegramChatId: true,
  marketingConsent: true,
  emailNotifications: true,
  smsNotifications: true,
  telegramNotifications: true,
  pushNotifications: true,
  isRegistrationComplete: true,
  dateOfBirth: true,
  gender: true
} as const;

type UserSummary = Prisma.UserGetPayload<{ select: typeof userSummarySelection }>;

const deriveDisplayName = (user: Pick<UserSummary, 'displayName' | 'firstName' | 'lastName'>) => {
  if (user.displayName && user.displayName.trim().length > 0) {
    return user.displayName.trim();
  }

  const parts = [user.firstName, user.lastName]
    .map((part) => (part ? part.trim() : ''))
    .filter((part) => part.length > 0);

  if (parts.length > 0) {
    return parts.join(' ');
  }

  return 'Новый пользователь';
};

const buildProfileResponse = (user: UserSummary | null) => {
  if (!user) {
    throw new Error('User not found');
  }

  const displayName = deriveDisplayName(user);

  return {
    id: user.id,
    phone: user.phone,
    displayName,
    bonus: user.bonusBalance ?? 0,
    firstName: user.firstName ?? null,
    lastName: user.lastName ?? null,
    middleName: user.middleName ?? null,
    avatar: user.avatar ?? null,
    email: user.email ?? null,
    telegramId: user.telegramId ?? null,
    telegramLinked: Boolean(user.telegramId),
    telegramUsername: user.telegramUsername ?? null,
    notifications: {
      email: user.emailNotifications ?? true,
      sms: user.smsNotifications ?? true,
      telegram: user.telegramNotifications ?? true,
      push: user.pushNotifications ?? true,
      marketing: user.marketingConsent ?? false
    },
    profile: {
      isCompleted: user.isRegistrationComplete ?? false,
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString() : null,
      gender: user.gender ?? null
    }
  };
};

export const getProfile = async (userId: string) => {
  // Обновляем lastLoginAt при получении профиля (считаем за активность/вход)
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
      select: userSummarySelection
    });

    return buildProfileResponse(user);
  } catch (error) {
    // Если пользователь не найден при обновлении - пробуем найти (хотя странно) или выбрасываем ошибку
    if (error instanceof Error && error.message.includes('Record to update not found')) {
       throw new Error('User not found');
    }
    throw error;
  }
};

export const updateProfile = async (
  userId: string,
  payload: {
    firstName?: string | null;
    lastName?: string | null;
    middleName?: string | null;
    email?: string | null;
    dateOfBirth?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      telegram?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
  }
) => {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...userSummarySelection,
      dateOfBirthLastUpdated: true
    }
  });

  if (!current) {
    throw new ValidationError('Пользователь не найден', 404);
  }

  const normalizeName = (input?: string | null, max = 60) => {
    if (input === undefined) {
      return undefined;
    }
    if (input === null) {
      return null;
    }
    const trimmed = input.trim();
    if (trimmed.length === 0) {
      return null;
    }
    return trimmed.slice(0, max);
  };

  const updateData: Prisma.UserUpdateInput = {};

  const firstNameValue = normalizeName(payload.firstName);
  if (payload.firstName !== undefined) {
    updateData.firstName = firstNameValue ?? null;
  }

  const lastNameValue = normalizeName(payload.lastName);
  if (payload.lastName !== undefined) {
    updateData.lastName = lastNameValue ?? null;
  }

  const middleNameValue = normalizeName(payload.middleName);
  if (payload.middleName !== undefined) {
    updateData.middleName = middleNameValue ?? null;
  }

  // Email обработка
  if (payload.email !== undefined) {
    if (payload.email === null) {
      updateData.email = null;
    } else {
      const emailTrimmed = payload.email.trim();
      if (emailTrimmed.length === 0) {
        updateData.email = null;
      } else {
        // Простая проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailTrimmed)) {
          throw new ValidationError('Неверный формат email');
        }
        updateData.email = emailTrimmed;
      }
    }
  }

  // Gender обработка
  if (payload.gender !== undefined) {
    updateData.gender = payload.gender;
  }

  // DateOfBirth обработка с ограничением на 3 месяца
  if (payload.dateOfBirth !== undefined) {
    if (payload.dateOfBirth === null) {
      updateData.dateOfBirth = null;
      updateData.dateOfBirthLastUpdated = new Date();
    } else {
      const dateOfBirth = new Date(payload.dateOfBirth);
      if (isNaN(dateOfBirth.getTime())) {
        throw new ValidationError('Неверный формат даты рождения');
      }

      // Проверяем, изменилась ли дата рождения
      const isDateChanged = !current.dateOfBirth ||
        current.dateOfBirth.getTime() !== dateOfBirth.getTime();

      // Проверка: можно ли менять дату рождения (раз в 3 месяца) - только если дата изменилась
      if (isDateChanged) {
        const threeMonthsInMs = 90 * 24 * 60 * 60 * 1000; // 90 дней
        const now = new Date();

        if (current.dateOfBirthLastUpdated) {
          const timeSinceLastUpdate = now.getTime() - current.dateOfBirthLastUpdated.getTime();
          if (timeSinceLastUpdate < threeMonthsInMs) {
            const daysRemaining = Math.ceil((threeMonthsInMs - timeSinceLastUpdate) / (24 * 60 * 60 * 1000));
            throw new ValidationError(`Дату рождения можно менять раз в 3 месяца. Попробуйте через ${daysRemaining} дн.`);
          }
        }

        // Проверка на адекватность даты (не в будущем, не слишком старая)
        if (dateOfBirth > now) {
          throw new ValidationError('Дата рождения не может быть в будущем');
        }

        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        if (dateOfBirth < minDate) {
          throw new ValidationError('Указана слишком старая дата рождения');
        }

        updateData.dateOfBirth = dateOfBirth;
        updateData.dateOfBirthLastUpdated = now;
      }
    }
  }

  if (payload.notifications) {
    const { email, sms, telegram, push, marketing } = payload.notifications;
    if (email !== undefined) updateData.emailNotifications = email;
    if (sms !== undefined) updateData.smsNotifications = sms;
    if (telegram !== undefined) updateData.telegramNotifications = telegram;
    if (push !== undefined) updateData.pushNotifications = push;
    if (marketing !== undefined) updateData.marketingConsent = marketing;
  }

  if (
    payload.firstName !== undefined ||
    payload.lastName !== undefined ||
    payload.middleName !== undefined
  ) {
    const nextFirst =
      firstNameValue === undefined ? current.firstName : firstNameValue ?? null;
    const nextLast =
      lastNameValue === undefined ? current.lastName : lastNameValue ?? null;

    const parts = [nextFirst, nextLast].filter((part) => part && part.length > 0) as string[];
    updateData.displayName = parts.length > 0 ? parts.join(' ') : null;
  }

  if (Object.keys(updateData).length === 0) {
    return buildProfileResponse(current);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: userSummarySelection
  });

  return buildProfileResponse(updated);
};

export const updateAvatar = async (userId: string, avatarUrl: string) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
    select: userSummarySelection
  });

  return buildProfileResponse(updated);
};

export const requestPhoneChange = async (userId: string, newPhoneRaw: string) => {
  const normalizedPhone = normalizePhoneNumber(newPhoneRaw);
  if (!normalizedPhone) {
    throw new ValidationError('Введите корректный номер телефона');
  }

  const existing = await prisma.user.findUnique({
    where: { phone: normalizedPhone }
  });

  if (existing && existing.id !== userId) {
    throw new ValidationError('Этот номер уже используется другим аккаунтом');
  }

  const code = randomInt(1000, 9999).toString();
  const expiresAt = Date.now() + PHONE_CHANGE_TTL_MS;

  phoneChangeRequests.set(userId, { newPhone: normalizedPhone, code, expiresAt });

  await deliverLoginCode(normalizedPhone, code);

  return { success: true };
};

export const confirmPhoneChange = async (userId: string, code: string) => {
  const request = phoneChangeRequests.get(userId);
  if (!request) {
    throw new ValidationError('Запрос на смену номера не найден или истёк');
  }

  if (request.expiresAt < Date.now()) {
    phoneChangeRequests.delete(userId);
    throw new ValidationError('Код подтверждения истёк, запросите новый');
  }

  if (request.code !== code) {
    throw new ValidationError('Неверный код подтверждения');
  }

  const conflicting = await prisma.user.findUnique({
    where: { phone: request.newPhone }
  });

  if (conflicting && conflicting.id !== userId) {
    phoneChangeRequests.delete(userId);
    throw new ValidationError('Этот номер уже используется другим аккаунтом');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { phone: request.newPhone },
    select: userSummarySelection
  });

  phoneChangeRequests.delete(userId);

  return buildProfileResponse(updated);
};

export const linkTelegramAccount = async (userId: string, initData: string) => {
  const { user, authDate } = await validateTelegramAuth(initData);
  const telegramId = user.id.toString();
  const normalizedPhone = normalizePhoneNumber(user.phoneNumber);

  if (telegramId.length === 0) {
    throw new ValidationError('Не удалось получить Telegram ID');
  }

  const existing = await prisma.user.findUnique({
    where: { telegramId }
  });

  if (existing && existing.id !== userId) {
    throw new ValidationError('Этот Telegram-аккаунт уже привязан к другому пользователю');
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      displayName: true,
      avatar: true,
      phone: true
    }
  });

  if (!currentUser) {
    throw new ValidationError('Пользователь не найден', 404);
  }

  const updateData: Record<string, unknown> = {
    telegramId,
    telegramUsername: user.username ?? null,
    telegramChatId: telegramId,
    lastLoginAt: authDate,
    telegramNotifications:
      user.allowsWriteToPm !== undefined ? user.allowsWriteToPm : true
  };

  const firstName = user.firstName?.trim();
  const lastName = user.lastName?.trim();
  const displayNameFromName = [firstName, lastName].filter(Boolean).join(' ').trim();

  if (!currentUser.firstName && firstName) {
    updateData.firstName = firstName;
  }
  if (!currentUser.lastName && lastName) {
    updateData.lastName = lastName;
  }

  if (!currentUser.displayName) {
    if (displayNameFromName.length > 0) {
      updateData.displayName = displayNameFromName;
    } else if (user.username) {
      updateData.displayName = user.username;
    }
  }

  if (!currentUser.avatar && user.photoUrl) {
    updateData.avatar = user.photoUrl;
  }

  if (normalizedPhone) {
    const conflictingByPhone = await prisma.user.findUnique({
      where: { phone: normalizedPhone }
    });

    if (!conflictingByPhone || conflictingByPhone.id === userId) {
      updateData.phone = normalizedPhone;
    } else {
      logger.warn(
        `User ${userId} attempted to link phone ${normalizedPhone} already owned by ${conflictingByPhone.id}`
      );
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: userSummarySelection
  });

  return buildProfileResponse(updated);
};

export const unlinkTelegramAccount = async (userId: string) => {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      telegramId: null,
      telegramUsername: null,
      telegramChatId: null,
      telegramNotifications: false
    },
    select: userSummarySelection
  });

  return buildProfileResponse(updated);
};

export const getPhoneChangeStatus = (userId: string) => {
  const request = phoneChangeRequests.get(userId);
  if (!request || request.expiresAt < Date.now()) {
    if (request) {
      phoneChangeRequests.delete(userId);
    }
    return null;
  }

  return {
    pendingPhone: request.newPhone,
    expiresAt: request.expiresAt
  };
};

export const deleteAccount = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      addresses: true,
      orders: {
        include: {
          items: true
        }
      },
      favorites: {
        select: {
          id: true,
          name: true,
          slug: true,
          images: true,
          price: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const backupPayload = JSON.parse(
    JSON.stringify({
      ...user,
      orders: user.orders.map((order) => ({
        ...order,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }))
    })
  ) as Prisma.InputJsonValue;

  await prisma.$transaction(async (tx) => {
    await tx.userBackup.create({
      data: {
        userId: user.id,
        payload: backupPayload
      }
    });

    // Delete roulette logs before deleting user
    await tx.rouletteLog.deleteMany({
      where: { userId: user.id }
    });

    await tx.user.delete({
      where: { id: user.id }
    });
  });

  phoneChangeRequests.delete(userId);

  return { success: true };
};
