import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/tokenService';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Проверяем access token в cookie
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // Детальное логирование для отладки
    console.log('[AUTH] Cookies received:', Object.keys(req.cookies));
    console.log('[AUTH] Access token present:', !!accessToken);
    console.log('[AUTH] Refresh token present:', !!refreshToken);
    console.log('[AUTH] Request path:', req.path);
    console.log('[AUTH] Request method:', req.method);

    if (!accessToken) {
      return res.status(401).json({ 
        message: 'Missing authentication token',
        error: 'Access token не найден',
        code: 'MISSING_ACCESS_TOKEN',
        debug: {
          cookiesReceived: Object.keys(req.cookies),
          hasAccessToken: false,
          hasRefreshToken: !!refreshToken,
          path: req.path
        }
      });
    }

    // Верифицируем токен
    const payload = verifyAccessToken(accessToken);

    // Добавляем userId в request для использования в контроллерах
    (req as any).user = { userId: payload.userId };

    next();
  } catch (error) {
    if (error instanceof Error && error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        error: 'Access token истек',
        code: 'TOKEN_EXPIRED'
      });
    }

    return res.status(401).json({ 
      message: 'Invalid authentication token',
      error: 'Невалидный токен',
      code: 'INVALID_TOKEN'
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = req.cookies.accessToken;

    if (accessToken) {
      const payload = verifyAccessToken(accessToken);
      (req as any).user = { userId: payload.userId };
    }

    next();
  } catch (error) {
    // Игнорируем ошибки для опциональной аутентификации
    next();
  }
};
