import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';
import { setAuthCookies, clearAuthCookies } from '../utils/cookieUtils';
import { migrateAnonymousToUser } from '../services/anonymousUserService';
import { getGoogleAuthUrl, getYandexAuthUrl, getAppleAuthUrl } from '../services/oauthService';
import { env } from '../config/env';

export const loginWithPhone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone } = req.body;
    await authService.requestLoginCode(phone);
    res.status(200).json({ message: 'Код отправлен' });
  } catch (error) {
    next(error);
  }
};

export const verifyPhoneCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { phone, code } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const anonymousUserId = (req as any).anonymousUserId;

    const result = await authService.verifyLoginCode(phone, code, userAgent, ipAddress);

    // Мигрируем данные анонимного пользователя, если он был идентифицирован
    let migrationResult = null;
    if (anonymousUserId && result.user?.id) {
      try {
        migrationResult = await migrateAnonymousToUser(anonymousUserId, result.user.id);
        console.log('[AUTH] Migrated anonymous user data:', migrationResult);
      } catch (migrationError) {
        // Не блокируем авторизацию, если миграция не удалась
        console.warn('[AUTH] Failed to migrate anonymous user data:', migrationError);
      }
    }

    // Устанавливаем cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    console.log('[AUTH] Cookies set after phone verification');

    res.status(200).json({
      user: result.user,
      isNewUser: result.isNewUser,
      needsRegistration: result.needsRegistration,
      migration: migrationResult
    });
  } catch (error) {
    next(error);
  }
};

export const loginWithTelegram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { initData } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const anonymousUserId = (req as any).anonymousUserId;

    const result = await authService.authenticateWithTelegram(initData, userAgent, ipAddress);

    // Мигрируем данные анонимного пользователя, если он был идентифицирован
    let migrationResult = null;
    if (anonymousUserId && result.user?.id) {
      try {
        migrationResult = await migrateAnonymousToUser(anonymousUserId, result.user.id);
        console.log('[AUTH] Migrated anonymous user data:', migrationResult);
      } catch (migrationError) {
        // Не блокируем авторизацию, если миграция не удалась
        console.warn('[AUTH] Failed to migrate anonymous user data:', migrationError);
      }
    }

    // Устанавливаем cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    console.log('[AUTH] Cookies set after Telegram login');

    res.status(200).json({
      user: result.user,
      isNewUser: result.isNewUser,
      needsRegistration: result.needsRegistration,
      migration: migrationResult
    });
  } catch (error) {
    // Обрабатываем специальную ошибку для случая, когда пользователь не найден и нет телефона
    if (error instanceof Error && error.message === 'TELEGRAM_USER_NOT_FOUND') {
      return res.status(404).json({
        message: 'TELEGRAM_USER_NOT_FOUND',
        error: 'Пользователь не найден. Пожалуйста, завершите регистрацию.',
        code: 'TELEGRAM_USER_NOT_FOUND'
      });
    }
    next(error);
  }
};

export const completeRegistration = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, middleName, dateOfBirth, referredByCode, gender } = req.body;

    if (!firstName || !dateOfBirth) {
      return res.status(400).json({ error: 'Имя и дата рождения обязательны' });
    }

    const result = await authService.completeRegistration(userId, {
      firstName,
      lastName,
      middleName,
      dateOfBirth: new Date(dateOfBirth),
      referredByCode,
      gender
    });

    res.status(200).json(result);
  } catch (error) {
    // Если пользователь не найден - очищаем cookies и возвращаем 401
    if (error instanceof Error && error.message === 'User not found') {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'User not found. Please login again.' });
    }
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token not found' });
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await authService.refreshTokens(refreshToken, userAgent, ipAddress);

    // Обновляем cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    res.status(200).json({ user: result.user });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logoutUser(refreshToken);
    }
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out' });
  } catch (error) {
    clearAuthCookies(res);
    next(error);
  }
};

export const logoutAllDevices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await authService.logoutAllDevices(userId);
    clearAuthCookies(res);
    res.status(200).json({ message: 'Logged out from all devices' });
  } catch (error) {
    next(error);
  }
};

export const getTelegramConfig = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = authService.getTelegramLoginConfig();
    res.status(200).json(config);
  } catch (error) {
    next(error);
  }
};

export const registerWithTelegram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { initData, phone, firstName, lastName, middleName, dateOfBirth, referredByCode, gender } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const anonymousUserId = (req as any).anonymousUserId;

    if (!initData || !phone || !firstName || !dateOfBirth) {
      return res.status(400).json({ error: 'InitData, телефон, имя и дата рождения обязательны' });
    }

    const result = await authService.registerWithTelegram(
      initData,
      phone,
      {
        firstName,
        lastName,
        middleName,
        dateOfBirth: new Date(dateOfBirth),
        referredByCode,
        gender
      },
      userAgent,
      ipAddress
    );

    // Мигрируем данные анонимного пользователя, если он был идентифицирован
    let migrationResult = null;
    if (anonymousUserId && result.user?.id) {
      try {
        migrationResult = await migrateAnonymousToUser(anonymousUserId, result.user.id);
        console.log('[AUTH] Migrated anonymous user data:', migrationResult);
      } catch (migrationError) {
        // Не блокируем авторизацию, если миграция не удалась
        console.warn('[AUTH] Failed to migrate anonymous user data:', migrationError);
      }
    }

    // Устанавливаем cookies
    setAuthCookies(res, result.accessToken, result.refreshToken);

    console.log('[AUTH] Cookies set after Telegram registration');

    res.status(200).json({
      user: result.user,
      isNewUser: result.isNewUser,
      needsRegistration: result.needsRegistration,
      migration: migrationResult
    });
  } catch (error) {
    // Обрабатываем случай, когда телефон уже зарегистрирован
    if (error instanceof Error && error.message === 'PHONE_ALREADY_REGISTERED') {
      return res.status(409).json({
        error: 'Этот номер телефона уже зарегистрирован. Пожалуйста, войдите в существующий аккаунт.',
        code: 'PHONE_ALREADY_REGISTERED'
      });
    }
    next(error);
  }
};

// OAuth endpoints
export const getGoogleAuthUrlHandler = async (req: Request, res: Response) => {
  try {
    const redirectUri = `${env.appDomain}/api/auth/oauth/google/callback`;
    const authUrl = getGoogleAuthUrl(redirectUri);
    res.json({ authUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getYandexAuthUrlHandler = async (req: Request, res: Response) => {
  try {
    const redirectUri = `${env.appDomain}/api/auth/yandex/callback`;
    const authUrl = getYandexAuthUrl(redirectUri);
    res.json({ authUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAppleAuthUrlHandler = async (req: Request, res: Response) => {
  try {
    const redirectUri = `${env.appDomain}/api/auth/oauth/apple/callback`;
    const authUrl = getAppleAuthUrl(redirectUri);
    res.json({ authUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const googleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const anonymousUserId = (req as any).anonymousUserId;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const redirectUri = `${env.appDomain}/api/auth/oauth/google/callback`;
    const result = await authService.authenticateWithGoogleOAuth(code, redirectUri, userAgent, ipAddress);

    // Мигрируем данные анонимного пользователя
    if (anonymousUserId && result.user?.id) {
      try {
        await migrateAnonymousToUser(anonymousUserId, result.user.id);
      } catch (migrationError) {
        console.warn('[AUTH] Failed to migrate anonymous user data:', migrationError);
      }
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Редиректим на фронтенд
    const returnUrl = req.query.state as string || '/';
    res.redirect(`${env.appDomain}${returnUrl}?oauth=success`);
  } catch (error) {
    next(error);
  }
};

export const yandexOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.query;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const anonymousUserId = (req as any).anonymousUserId;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const redirectUri = `${env.appDomain}/api/auth/yandex/callback`;
    const result = await authService.authenticateWithYandexOAuth(code, redirectUri, userAgent, ipAddress);

    // Мигрируем данные анонимного пользователя
    if (anonymousUserId && result.user?.id) {
      try {
        await migrateAnonymousToUser(anonymousUserId, result.user.id);
      } catch (migrationError) {
        console.warn('[AUTH] Failed to migrate anonymous user data:', migrationError);
      }
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Редиректим на фронтенд
    const returnUrl = req.query.state as string || '/';
    res.redirect(`${env.appDomain}${returnUrl}?oauth=success`);
  } catch (error) {
    next(error);
  }
};

export const appleOAuthCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Apple использует POST с form data
    const { code } = req.body;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const anonymousUserId = (req as any).anonymousUserId;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    const redirectUri = `${env.appDomain}/api/auth/oauth/apple/callback`;
    const result = await authService.authenticateWithAppleOAuth(code, redirectUri, userAgent, ipAddress);

    // Мигрируем данные анонимного пользователя
    if (anonymousUserId && result.user?.id) {
      try {
        await migrateAnonymousToUser(anonymousUserId, result.user.id);
      } catch (migrationError) {
        console.warn('[AUTH] Failed to migrate anonymous user data:', migrationError);
      }
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);

    // Редиректим на фронтенд
    const returnUrl = req.query.state as string || '/';
    res.redirect(`${env.appDomain}${returnUrl}?oauth=success`);
  } catch (error) {
    next(error);
  }
};
