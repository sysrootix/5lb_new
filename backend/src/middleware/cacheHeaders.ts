import { Request, Response, NextFunction } from 'express';

/**
 * Middleware для установки заголовков кеширования
 */

/**
 * Кеширование для статических файлов (изображения)
 * Cache-Control: public - может кешироваться на клиенте и CDN
 * max-age - время в секундах, в течение которого ресурс считается актуальным
 * immutable - ресурс не изменится (для версионированных файлов)
 */
export const cacheImages = (maxAge: number = 31536000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Проверяем, является ли запрос изображением
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.ico'];
    const isImage = imageExtensions.some(ext => req.path.toLowerCase().endsWith(ext));

    if (isImage) {
      // Для изображений устанавливаем длительное кеширование
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, immutable`);
      // ETag для валидации кеша
      res.setHeader('ETag', `"${Date.now()}"`);
      // Разрешаем кросс-доменную загрузку для PWA
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }

    next();
  };
};

/**
 * Кеширование для API ответов
 */
export const cacheAPI = (maxAge: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Для GET запросов можем кешировать
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
    } else {
      // Для POST/PUT/DELETE не кешируем
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    }
    next();
  };
};

/**
 * Отключение кеширования для динамических данных
 */
export const noCache = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

/**
 * Предварительная загрузка (preload) для критических ресурсов
 */
export const preloadImages = (images: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const preloadLinks = images
      .map(img => `<${img}>; rel=preload; as=image`)
      .join(', ');

    if (preloadLinks) {
      res.setHeader('Link', preloadLinks);
    }
    next();
  };
};
