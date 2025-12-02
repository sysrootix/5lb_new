import { Request, Response, NextFunction } from 'express';
import { getOrCreateAnonymousUser } from '../services/anonymousUserService';

/**
 * Middleware для идентификации анонимного пользователя
 * Извлекает fingerprint из заголовка или тела запроса
 */
export const identifyAnonymous = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Пытаемся получить fingerprint из разных источников
    const fingerprint = 
      req.headers['x-fingerprint'] as string ||
      req.body?.fingerprint ||
      req.query?.fingerprint as string;

    if (fingerprint) {
      const anonymousUser = await getOrCreateAnonymousUser(fingerprint);
      (req as any).anonymousUserId = anonymousUser.id;
    }

    next();
  } catch (error) {
    // Не блокируем запрос, если не удалось идентифицировать анонимного пользователя
    console.warn('[AnonymousAuth] Failed to identify anonymous user:', error);
    next();
  }
};

/**
 * Middleware для обязательной идентификации анонимного пользователя
 * Используется для endpoints, которые требуют анонимного пользователя
 */
export const requireAnonymous = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fingerprint = 
      req.headers['x-fingerprint'] as string ||
      req.body?.fingerprint ||
      req.query?.fingerprint as string;

    if (!fingerprint) {
      return res.status(400).json({
        message: 'Fingerprint is required',
        code: 'FINGERPRINT_REQUIRED'
      });
    }

    const anonymousUser = await getOrCreateAnonymousUser(fingerprint);
    (req as any).anonymousUserId = anonymousUser.id;

    next();
  } catch (error) {
    console.error('[AnonymousAuth] Required anonymous identification failed:', error);
    res.status(500).json({
      message: 'Failed to identify anonymous user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};





















