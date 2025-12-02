import axios from 'axios';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../config/logger';

export interface OAuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
}

export interface YandexTokenResponse {
  access_token: string;
}

export interface YandexUserInfo {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  default_avatar_id?: string;
}

export interface AppleTokenResponse {
  access_token: string;
  id_token: string;
}

export interface AppleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
}

/**
 * Получить URL для авторизации Google
 */
export const getGoogleAuthUrl = (redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

/**
 * Обменять код на токен Google и получить данные пользователя
 */
export const authenticateWithGoogle = async (
  code: string,
  redirectUri: string
): Promise<OAuthUser> => {
  try {
    // Обмениваем код на токен
    const tokenResponse = await axios.post<GoogleTokenResponse>(
      'https://oauth2.googleapis.com/token',
      {
        client_id: env.googleClientId,
        client_secret: env.googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }
    );

    const { access_token, id_token } = tokenResponse.data;

    // Получаем данные пользователя
    const userResponse = await axios.get<GoogleUserInfo>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const userInfo = userResponse.data;

    return {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      displayName: userInfo.name || `${userInfo.given_name || ''} ${userInfo.family_name || ''}`.trim(),
      avatar: userInfo.picture,
    };
  } catch (error: any) {
    logger.error('Ошибка при аутентификации через Google:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Google');
  }
};

/**
 * Получить URL для авторизации Яндекс
 */
export const getYandexAuthUrl = (redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: env.yandexClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  return `https://oauth.yandex.ru/authorize?${params.toString()}`;
};

/**
 * Обменять код на токен Яндекс и получить данные пользователя
 */
export const authenticateWithYandex = async (
  code: string,
  redirectUri: string
): Promise<OAuthUser> => {
  try {
    // Обмениваем код на токен
    const tokenResponse = await axios.post<YandexTokenResponse>(
      'https://oauth.yandex.ru/token',
      {
        grant_type: 'authorization_code',
        code,
        client_id: env.yandexClientId,
        client_secret: env.yandexClientSecret,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Получаем данные пользователя
    const userResponse = await axios.get<YandexUserInfo>(
      'https://login.yandex.ru/info',
      {
        headers: {
          Authorization: `OAuth ${access_token}`,
        },
        params: {
          format: 'json',
        },
      }
    );

    const userInfo = userResponse.data;

    // Формируем URL аватара если есть default_avatar_id
    let avatar: string | undefined;
    if (userInfo.default_avatar_id) {
      avatar = `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`;
    }

    return {
      id: userInfo.id,
      email: userInfo.email,
      firstName: userInfo.first_name,
      lastName: userInfo.last_name,
      displayName: userInfo.display_name || `${userInfo.first_name || ''} ${userInfo.last_name || ''}`.trim(),
      avatar,
    };
  } catch (error: any) {
    logger.error('Ошибка при аутентификации через Яндекс:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Yandex');
  }
};

/**
 * Получить URL для авторизации Apple ID
 */
export const getAppleAuthUrl = (redirectUri: string): string => {
  const params = new URLSearchParams({
    client_id: env.appleClientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'name email',
    response_mode: 'form_post',
  });

  return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
};

/**
 * Обменять код на токен Apple и получить данные пользователя
 */
export const authenticateWithApple = async (
  code: string,
  redirectUri: string
): Promise<OAuthUser> => {
  try {
    // Для Apple нужно создать JWT для клиента
    // Это упрощенная версия, в продакшене нужно использовать библиотеку для создания JWT
    const clientSecret = createAppleClientSecret();

    // Обмениваем код на токен
    const tokenResponse = await axios.post<AppleTokenResponse>(
      'https://appleid.apple.com/auth/token',
      new URLSearchParams({
        client_id: env.appleClientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { id_token } = tokenResponse.data;

    // Декодируем JWT токен (без проверки подписи в упрощенной версии)
    const parts = id_token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid Apple ID token');
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString()) as AppleUserInfo;

    return {
      id: payload.sub,
      email: payload.email,
      displayName: 'Apple User',
    };
  } catch (error: any) {
    logger.error('Ошибка при аутентификации через Apple:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Apple');
  }
};

/**
 * Создать клиентский секрет для Apple (JWT)
 */
const createAppleClientSecret = (): string => {
  if (!env.applePrivateKey || !env.appleTeamId || !env.appleKeyId || !env.appleClientId) {
    throw new Error('Apple OAuth not configured');
  }

  const now = Math.floor(Date.now() / 1000);
  
  const payload = {
    iss: env.appleTeamId,
    iat: now,
    exp: now + 3600, // 1 hour
    aud: 'https://appleid.apple.com',
    sub: env.appleClientId,
  };

  const header = {
    alg: 'ES256',
    kid: env.appleKeyId,
  };

  // Заменяем экранированные символы новой строки на реальные
  const privateKey = env.applePrivateKey.replace(/\\n/g, '\n');

  return jwt.sign(payload, privateKey, {
    algorithm: 'ES256',
    header,
  });
};

