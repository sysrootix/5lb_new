import { http } from './http';

export interface AnonymousUserResponse {
  anonymousUserId: string;
  favorites: any[];
}

export interface FavoritesResponse {
  favorites: any[];
}

/**
 * Инициализирует или получает анонимного пользователя
 */
export const initAnonymousUser = async (fingerprint: string): Promise<AnonymousUserResponse> => {
  const response = await http.post<AnonymousUserResponse>('/anonymous/init', {
    fingerprint
  });
  return response.data;
};

/**
 * Получает избранное анонимного пользователя
 */
export const getAnonymousFavorites = async (fingerprint: string): Promise<FavoritesResponse> => {
  const response = await http.get<FavoritesResponse>('/anonymous/favorites', {
    headers: {
      'X-Fingerprint': fingerprint
    }
  });
  return response.data;
};

/**
 * Добавляет товар в избранное анонимного пользователя
 */
export const addAnonymousFavorite = async (fingerprint: string, productId: string): Promise<void> => {
  await http.post(`/anonymous/favorites/${productId}`, {}, {
    headers: {
      'X-Fingerprint': fingerprint
    }
  });
};

/**
 * Удаляет товар из избранного анонимного пользователя
 */
export const removeAnonymousFavorite = async (fingerprint: string, productId: string): Promise<void> => {
  await http.delete(`/anonymous/favorites/${productId}`, {
    headers: {
      'X-Fingerprint': fingerprint
    }
  });
};

/**
 * Мигрирует данные анонимного пользователя в реальный аккаунт
 */
export const migrateAnonymousData = async (fingerprint: string): Promise<{ success: boolean; migratedFavorites: number; totalFavorites: number }> => {
  const response = await http.post('/anonymous/migrate', {}, {
    headers: {
      'X-Fingerprint': fingerprint
    }
  });
  return response.data;
};

