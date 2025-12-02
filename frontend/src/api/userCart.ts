import { http } from './http';

export interface CartItem {
  productId: string;
  shopCode: string;
  quantity: number;
  modificationIndex?: number;
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string;
    name: string;
    categoryName: string | null;
    retailPrice: number | null;
    quantity: number | null;
    modifications: any;
    characteristics: any;
    shopCode: string;
    shopName: string | null;
  };
  totalPrice: number;
}

export interface CartResponse {
  cart: CartItemWithProduct[];
}

/**
 * Получает корзину пользователя
 */
export const getUserCart = async (): Promise<CartItemWithProduct[]> => {
  const response = await http.get<CartResponse>('/users/cart');
  return response.data.cart;
};

/**
 * Добавляет товар в корзину пользователя
 */
export const addToUserCart = async (
  productId: string,
  shopCode: string,
  quantity: number = 1,
  modificationIndex?: number
): Promise<CartItem[]> => {
  const response = await http.post<{ success: boolean; cart: CartItem[] }>('/users/cart', {
    productId,
    shopCode,
    quantity,
    modificationIndex
  });
  return response.data.cart;
};

/**
 * Обновляет количество товара в корзине пользователя
 */
export const updateUserCartItem = async (
  productId: string,
  shopCode: string,
  quantity: number,
  modificationIndex?: number
): Promise<CartItem[]> => {
  const response = await http.put<{ success: boolean; cart: CartItem[] }>(
    `/users/cart/${productId}`,
    {
      shopCode,
      quantity,
      modificationIndex
    }
  );
  return response.data.cart;
};

/**
 * Удаляет товар из корзины пользователя
 */
export const removeFromUserCart = async (
  productId: string,
  shopCode: string,
  modificationIndex?: number
): Promise<CartItem[]> => {
  const params = new URLSearchParams();
  params.append('shopCode', shopCode);
  if (modificationIndex !== undefined) {
    params.append('modificationIndex', modificationIndex.toString());
  }
  
  const response = await http.delete<{ success: boolean; cart: CartItem[] }>(
    `/users/cart/${productId}?${params.toString()}`
  );
  return response.data.cart;
};

/**
 * Очищает корзину пользователя
 */
export const clearUserCart = async (): Promise<void> => {
  await http.delete('/users/cart');
};

