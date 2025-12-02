/**
 * Утилиты для управления кешированием изображений
 */

/**
 * Прелоадит изображение и добавляет его в кеш браузера
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Прелоадит массив изображений
 */
export const preloadImages = async (urls: string[]): Promise<void> => {
  const promises = urls.map(url => preloadImage(url));
  await Promise.all(promises);
};

/**
 * Прелоадит критические изображения (логотипы, иконки и т.д.)
 */
export const preloadCriticalImages = async (): Promise<void> => {
  const criticalImages = [
    '/logo.svg',
    '/images/global-bg.svg',
    '/images/background-pattern.svg',
  ];

  try {
    await preloadImages(criticalImages);
    console.log('✅ Критические изображения прелоадены');
  } catch (error) {
    console.warn('⚠️ Ошибка прелоада изображений:', error);
  }
};

/**
 * Получает размер кеша изображений (если доступен Cache API)
 */
export const getCacheSize = async (): Promise<number> => {
  if (!('caches' in window)) return 0;

  try {
    const cacheNames = await caches.keys();
    let totalSize = 0;

    for (const name of cacheNames) {
      if (name.includes('images-cache') || name.includes('external-images-cache')) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        totalSize += keys.length;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Ошибка получения размера кеша:', error);
    return 0;
  }
};

/**
 * Очищает кеш изображений
 */
export const clearImageCache = async (): Promise<void> => {
  if (!('caches' in window)) return;

  try {
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      if (name.includes('images-cache') || name.includes('external-images-cache')) {
        await caches.delete(name);
      }
    }

    console.log('✅ Кеш изображений очищен');
  } catch (error) {
    console.error('Ошибка очистки кеша:', error);
  }
};

/**
 * Проверяет, закешировано ли изображение
 */
export const isImageCached = async (url: string): Promise<boolean> => {
  if (!('caches' in window)) return false;

  try {
    const cacheNames = await caches.keys();

    for (const name of cacheNames) {
      if (name.includes('images-cache') || name.includes('external-images-cache')) {
        const cache = await caches.open(name);
        const response = await cache.match(url);
        if (response) return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Ошибка проверки кеша:', error);
    return false;
  }
};
