import { http } from './http';

export interface FavoriteProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  inStock: boolean;
  quantity: number;
  images: string[];
  categoryId: string | null;
  brand: string | null;
  slug: string;
}

export interface FavoritesResponse {
  favorites: FavoriteProduct[];
}

/**
 * Получает избранное пользователя
 */
export const getUserFavorites = async (): Promise<FavoriteProduct[]> => {
  const response = await http.get<FavoritesResponse>('/users/favorites');
  return response.data.favorites;
};

/**
 * Добавляет товар в избранное пользователя
 */
export const addUserFavorite = async (productId: string): Promise<void> => {
  await http.post(`/users/favorites/${productId}`);
};

/**
 * Удаляет товар из избранного пользователя
 */
export const removeUserFavorite = async (productId: string): Promise<void> => {
  await http.delete(`/users/favorites/${productId}`);
};

