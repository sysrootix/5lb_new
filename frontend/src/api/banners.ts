import { http } from './http';

export interface Banner {
  id: string;
  imageUrl: string;
  title?: string | null;
  link?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Получить активные баннеры для главной страницы
 * Бэкенд автоматически фильтрует по isActive и датам начала/окончания
 */
export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await http.get<Banner[]>('/banners');
    return response.data;
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};
