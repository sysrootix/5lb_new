import type { Response } from 'express';
import { env } from '../config/env';

const isProd = env.nodeEnv === 'production';

// Извлекаем корневой домен из APP_DOMAIN для cookies (например, .5lb.pro)
const getCookieDomain = () => {
  if (!isProd) return undefined;
  
  try {
    const url = new URL(env.appDomain);
    const hostname = url.hostname;
    
    // Если домен app.5lb.pro, возвращаем .5lb.pro для работы на всех поддоменах
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return '.' + parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return undefined;
  }
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd, // только HTTPS в production
  sameSite: 'lax' as const, // lax вместо strict для лучшей совместимости
  path: '/',
  domain: getCookieDomain() // Устанавливаем корневой домен в production (.5lb.pro)
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
) => {
  console.log('[COOKIE] Setting auth cookies with options:', {
    ...COOKIE_OPTIONS,
    accessTokenLength: accessToken.length,
    refreshTokenLength: refreshToken.length
  });

  res.cookie('accessToken', accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
  });

  res.cookie('refreshToken', refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 дней
  });
  
  console.log('[COOKIE] Cookies set successfully');
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
};
