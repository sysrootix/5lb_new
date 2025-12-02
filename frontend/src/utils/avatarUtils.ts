import appConfig from '@config/app-config.json';

/**
 * Получает базовый URL для статических ресурсов (аватарки, изображения и т.д.)
 */
export const getBaseUrl = (): string => {
  // Используем переменную окружения, если она есть
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Fallback на конфигурацию из app-config.json
  if (typeof appConfig.domain === 'string') {
    return appConfig.domain;
  }
  
  // Последний fallback
  return 'https://app.5lb.pro';
};

/**
 * Формирует полный URL для аватарки
 * @param avatar - путь к аватарке (может быть полным URL или относительным путем)
 * @returns полный URL аватарки
 */
export const getAvatarUrl = (avatar: string | null | undefined): string | null => {
  if (!avatar) {
    return null;
  }
  
  // Если уже полный URL, возвращаем как есть
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }
  
  // Добавляем базовый URL к относительному пути
  const baseUrl = getBaseUrl();
  
  // Убираем trailing slash у baseUrl если есть, и убеждаемся что путь начинается с /
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
  
  return `${cleanBaseUrl}${cleanPath}`;
};

