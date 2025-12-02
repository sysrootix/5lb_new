import { PrismaClient } from '@prisma/client';
import { hashFingerprint, isValidFingerprint } from '../utils/fingerprintUtils';

const prisma = new PrismaClient();

/**
 * Создает или получает анонимного пользователя по fingerprint
 */
export const getOrCreateAnonymousUser = async (fingerprint: string) => {
  if (!isValidFingerprint(fingerprint)) {
    throw new Error('Invalid fingerprint');
  }

  const fingerprintHash = hashFingerprint(fingerprint);

  // Ищем существующего анонимного пользователя
  let anonymousUser = await prisma.anonymousUser.findUnique({
    where: { fingerprintId: fingerprintHash }
  });

  // Если не найден - создаем нового
  if (!anonymousUser) {
    anonymousUser = await prisma.anonymousUser.create({
      data: {
        fingerprintId: fingerprintHash,
        catalogFavorites: [],
        cart: []
      }
    });
  } else {
    // Обновляем время последней активности
    anonymousUser = await prisma.anonymousUser.update({
      where: { id: anonymousUser.id },
      data: {
        lastActivityAt: new Date()
      }
    });
  }

  // Получаем избранное каталога
  const catalogFavorites = (anonymousUser as any).catalogFavorites as string[] || [];
  const favorites = catalogFavorites.length > 0 ? await getFavorites(anonymousUser.id) : [];

  return {
    ...anonymousUser,
    favorites
  };
};

/**
 * Добавляет товар в избранное анонимного пользователя
 * Работает с товарами из каталога (CatalogProduct)
 */
export const addToFavorites = async (anonymousUserId: string, productId: string) => {
  // Проверяем существование товара в каталоге
  const catalogProduct = await prisma.catalogProduct.findFirst({
    where: { 
      externalId: productId,
      isActive: true
    }
  });

  if (!catalogProduct) {
    throw new Error('Product not found');
  }

  // Проверяем существование анонимного пользователя
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  // Получаем текущий список избранного каталога
  const catalogFavorites = (anonymousUser as any).catalogFavorites as string[] || [];
  
  // Проверяем, нет ли уже этого товара в избранном
  if (catalogFavorites.includes(productId)) {
    return { success: true, alreadyExists: true };
  }

  // Добавляем товар в избранное каталога
  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      catalogFavorites: [...catalogFavorites, productId]
    }
  });

  return { success: true };
};

/**
 * Удаляет товар из избранного анонимного пользователя
 * Работает с товарами из каталога (CatalogProduct)
 */
export const removeFromFavorites = async (anonymousUserId: string, productId: string) => {
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  // Получаем текущий список избранного каталога
  const catalogFavorites = (anonymousUser as any).catalogFavorites as string[] || [];
  
  // Удаляем товар из списка
  const updatedFavorites = catalogFavorites.filter((id: string) => id !== productId);

  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      catalogFavorites: updatedFavorites
    }
  });

  return { success: true };
};

/**
 * Получает избранное анонимного пользователя
 * Возвращает товары из каталога (CatalogProduct)
 */
export const getFavorites = async (anonymousUserId: string) => {
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    return [];
  }

  // Получаем ID товаров из избранного каталога
  const catalogFavorites = (anonymousUser as any).catalogFavorites as string[] || [];
  
  if (catalogFavorites.length === 0) {
    return [];
  }

  // Получаем товары из каталога
  const products = await prisma.catalogProduct.findMany({
    where: {
      externalId: { in: catalogFavorites },
      isActive: true
    },
    select: {
      externalId: true,
      name: true,
      categoryName: true,
      categoryId: true,
      retailPrice: true,
      purchasePrice: true,
      quantity: true,
      shopCode: true,
      shopName: true,
      modifications: true,
      characteristics: true
    }
  });

  return products.map((product) => ({
    id: product.externalId,
    name: product.name,
    categoryName: product.categoryName,
    categoryId: product.categoryId,
    retailPrice: product.retailPrice,
    purchasePrice: product.purchasePrice,
    quantity: product.quantity,
    shopCode: product.shopCode,
    shopName: product.shopName,
    modifications: product.modifications,
    characteristics: product.characteristics
  }));
};

/**
 * Мигрирует данные анонимного пользователя в реальный аккаунт
 */
export const migrateAnonymousToUser = async (anonymousUserId: string, userId: string) => {
  // Получаем данные анонимного пользователя
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId },
    include: {
      favorites: true
    }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  // Получаем пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      favorites: true
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Находим товары, которые есть у анонимного, но нет у пользователя
  const anonymousFavoriteIds = anonymousUser.favorites.map((f: { id: string }) => f.id);
  const userFavoriteIds = user.favorites.map((f: { id: string }) => f.id);
  const newFavoriteIds = anonymousFavoriteIds.filter((id: string) => !userFavoriteIds.includes(id));

  // Добавляем избранное из анонимного аккаунта
  if (newFavoriteIds.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        favorites: {
          connect: newFavoriteIds.map((id: string) => ({ id }))
        }
      }
    });
  }

  // Связываем анонимного пользователя с реальным (для истории)
  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      userId: userId
    }
  });

  return {
    migratedFavorites: newFavoriteIds.length,
    totalFavorites: userFavoriteIds.length + newFavoriteIds.length
  };
};

