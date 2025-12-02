import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Получает избранное пользователя (из каталога CatalogProduct)
 */
export const getUserFavorites = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Получаем ID товаров из избранного каталога
  const catalogFavorites = (user as any).catalogFavorites as string[] || [];
  
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
 * Добавляет товар в избранное пользователя (из каталога)
 */
export const addUserFavorite = async (userId: string, productId: string) => {
  // Проверяем существование товара в каталоге
  const catalogProduct = await prisma.catalogProduct.findFirst({
    where: { 
      externalId: productId,
      isActive: true
    }
  });

  if (!catalogProduct) {
    throw new Error('Product not found in catalog');
  }

  // Проверяем существование пользователя
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Получаем текущий список избранного каталога
  const catalogFavorites = (user as any).catalogFavorites as string[] || [];
  
  // Проверяем, нет ли уже этого товара в избранном
  if (catalogFavorites.includes(productId)) {
    return { success: true, alreadyExists: true };
  }

  // Добавляем товар в избранное каталога
  await prisma.user.update({
    where: { id: userId },
    data: {
      catalogFavorites: [...catalogFavorites, productId] as unknown as Prisma.InputJsonValue
    }
  });

  return { success: true };
};

/**
 * Удаляет товар из избранного пользователя (из каталога)
 */
export const removeUserFavorite = async (userId: string, productId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Получаем текущий список избранного каталога
  const catalogFavorites = (user as any).catalogFavorites as string[] || [];
  
  // Удаляем товар из списка
  const updatedFavorites = catalogFavorites.filter((id: string) => id !== productId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      catalogFavorites: updatedFavorites as unknown as Prisma.InputJsonValue
    }
  });

  return { success: true };
};

/**
 * Проверяет, есть ли товар в избранном пользователя
 */
export const isUserFavorite = async (userId: string, productId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return false;
  }

  const catalogFavorites = (user as any).catalogFavorites as string[] || [];
  return catalogFavorites.includes(productId);
};

