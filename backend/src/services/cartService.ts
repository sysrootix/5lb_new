import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface CartItem {
  productId: string;
  shopCode: string;
  quantity: number;
  modificationIndex?: number;
}

/**
 * Получает корзину анонимного пользователя
 */
export const getCart = async (anonymousUserId: string): Promise<CartItem[]> => {
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  const cart = (anonymousUser as any).cart as CartItem[] || [];
  return cart;
};

/**
 * Добавляет товар в корзину или обновляет количество
 */
export const addToCart = async (
  anonymousUserId: string,
  productId: string,
  shopCode: string,
  quantity: number = 1,
  modificationIndex?: number
): Promise<CartItem[]> => {
  // Проверяем существование товара в каталоге
  const catalogProduct = await prisma.catalogProduct.findFirst({
    where: {
      externalId: productId,
      shopCode: shopCode,
      isActive: true
    }
  });

  if (!catalogProduct) {
    throw new Error('Product not found in catalog');
  }

  // Проверяем наличие товара
  const productQuantity = catalogProduct.quantity || 0;
  if (productQuantity === 0) {
    throw new Error('Product is out of stock');
  }

  // Получаем анонимного пользователя
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  // Получаем текущую корзину
  const cart = (anonymousUser as any).cart as CartItem[] || [];

  // Проверяем, есть ли уже этот товар в корзине
  const existingItemIndex = cart.findIndex(
    (item: CartItem) =>
      item.productId === productId &&
      item.shopCode === shopCode &&
      item.modificationIndex === (modificationIndex ?? undefined)
  );

  let updatedCart: CartItem[];

  if (existingItemIndex >= 0) {
    // Обновляем количество существующего товара
    const existingItem = cart[existingItemIndex];
    const newQuantity = existingItem.quantity + quantity;

    // Проверяем, не превышает ли количество доступное
    if (newQuantity > productQuantity) {
      throw new Error(`Only ${productQuantity} items available`);
    }

    updatedCart = [...cart];
    updatedCart[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity
    };
  } else {
    // Добавляем новый товар
    if (quantity > productQuantity) {
      throw new Error(`Only ${productQuantity} items available`);
    }

    updatedCart = [
      ...cart,
      {
        productId,
        shopCode,
        quantity,
        modificationIndex: modificationIndex ?? undefined
      }
    ];
  }

  // Сохраняем обновленную корзину
  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      cart: updatedCart as unknown as Prisma.InputJsonValue,
      lastActivityAt: new Date()
    }
  });

  return updatedCart;
};

/**
 * Обновляет количество товара в корзине
 */
export const updateCartItemQuantity = async (
  anonymousUserId: string,
  productId: string,
  shopCode: string,
  quantity: number,
  modificationIndex?: number
): Promise<CartItem[]> => {
  if (quantity <= 0) {
    return removeFromCart(anonymousUserId, productId, shopCode, modificationIndex);
  }

  // Проверяем наличие товара
  const catalogProduct = await prisma.catalogProduct.findFirst({
    where: {
      externalId: productId,
      shopCode: shopCode,
      isActive: true
    }
  });

  if (!catalogProduct) {
    throw new Error('Product not found in catalog');
  }

  const productQuantity = catalogProduct.quantity || 0;
  if (quantity > productQuantity) {
    throw new Error(`Only ${productQuantity} items available`);
  }

  // Получаем анонимного пользователя
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  // Получаем текущую корзину
  const cart = (anonymousUser as any).cart as CartItem[] || [];

  // Находим товар в корзине
  const itemIndex = cart.findIndex(
    (item: CartItem) =>
      item.productId === productId &&
      item.shopCode === shopCode &&
      item.modificationIndex === (modificationIndex ?? undefined)
  );

  if (itemIndex < 0) {
    throw new Error('Item not found in cart');
  }

  // Обновляем количество
  const updatedCart = [...cart];
  updatedCart[itemIndex] = {
    ...updatedCart[itemIndex],
    quantity
  };

  // Сохраняем обновленную корзину
  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      cart: updatedCart as unknown as Prisma.InputJsonValue,
      lastActivityAt: new Date()
    }
  });

  return updatedCart;
};

/**
 * Удаляет товар из корзины
 */
export const removeFromCart = async (
  anonymousUserId: string,
  productId: string,
  shopCode: string,
  modificationIndex?: number
): Promise<CartItem[]> => {
  const anonymousUser = await prisma.anonymousUser.findUnique({
    where: { id: anonymousUserId }
  });

  if (!anonymousUser) {
    throw new Error('Anonymous user not found');
  }

  // Получаем текущую корзину
  const cart = (anonymousUser as any).cart as CartItem[] || [];

  // Удаляем товар из корзины
  const updatedCart = cart.filter(
    (item: CartItem) =>
      !(
        item.productId === productId &&
        item.shopCode === shopCode &&
        item.modificationIndex === (modificationIndex ?? undefined)
      )
  );

  // Сохраняем обновленную корзину
  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      cart: updatedCart as unknown as Prisma.InputJsonValue,
      lastActivityAt: new Date()
    }
  });

  return updatedCart;
};

/**
 * Очищает корзину
 */
export const clearCart = async (anonymousUserId: string): Promise<void> => {
  await prisma.anonymousUser.update({
    where: { id: anonymousUserId },
    data: {
      cart: [] as unknown as Prisma.InputJsonValue,
      lastActivityAt: new Date()
    }
  });
};

/**
 * Получает детали товаров из корзины
 */
export const getCartWithProducts = async (anonymousUserId: string) => {
  const cart = await getCart(anonymousUserId);

  if (cart.length === 0) {
    return [];
  }

  // Группируем товары по shopCode для оптимизации запросов
  const shopCodes = [...new Set(cart.map(item => item.shopCode))];
  const productIds = [...new Set(cart.map(item => item.productId))];

  // Получаем все товары из каталога
  const products = await prisma.catalogProduct.findMany({
    where: {
      externalId: { in: productIds },
      shopCode: { in: shopCodes },
      isActive: true
    }
  });

  // Формируем результат с деталями товаров
  return cart.map((item) => {
    const product = products.find(
      (p) => p.externalId === item.productId && p.shopCode === item.shopCode
    );

    if (!product) {
      return null;
    }

    // Определяем цену с учетом модификации
    let price = product.retailPrice || 0;
    if (item.modificationIndex !== undefined && product.modifications) {
      const modifications = product.modifications as any[];
      if (modifications[item.modificationIndex]) {
        price = modifications[item.modificationIndex].retail_price || price;
      }
    }

    return {
      ...item,
      product: {
        id: product.externalId,
        name: product.name,
        categoryName: product.categoryName,
        retailPrice: price,
        quantity: product.quantity,
        modifications: product.modifications,
        characteristics: product.characteristics,
        shopCode: product.shopCode,
        shopName: product.shopName
      },
      totalPrice: price * item.quantity
    };
  }).filter(item => item !== null);
};

