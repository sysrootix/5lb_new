import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import appConfig from '@config/app-config.json';
import { getOrCreateFingerprint } from '../utils/fingerprint';

const baseURL =
  import.meta.env.VITE_API_URL ??
  (typeof appConfig.apiBaseUrl === 'string' ? appConfig.apiBaseUrl : '/api');

export const http = axios.create({
  baseURL,
  withCredentials: true
});

// Interceptor для автоматического добавления fingerprint в заголовки
http.interceptors.request.use(
  async (config) => {
    try {
      const fingerprint = await getOrCreateFingerprint();
      config.headers['X-Fingerprint'] = fingerprint;
    } catch (error) {
      // Игнорируем ошибки получения fingerprint
      console.warn('[HTTP] Failed to get fingerprint:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

const clearAuthAndRedirect = () => {
  console.log('[HTTP] Clearing auth state and redirecting to login');
  
  // Очищаем куки (для всех доменов)
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'accessToken=; path=/; domain=.5lb.pro; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'refreshToken=; path=/; domain=.5lb.pro; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  
  // Очищаем localStorage (zustand auth state)
  localStorage.removeItem('auth-storage');
  
  // Перенаправляем на логин, только если мы не на странице логина
  if (!window.location.pathname.includes('/login') && 
      !window.location.pathname.includes('/register')) {
    // Сохраняем текущий URL для возврата после логина
    const returnUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', returnUrl);
    console.log('[HTTP] Saving return URL:', returnUrl);
    
    window.location.href = '/login';
  }
};

// Interceptor для автоматического обновления токенов и обработки ошибок
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const message = (data as any)?.message || (data as any)?.error || '';
    const errorCode = (data as any)?.code;

    // Обрабатываем ошибку 409 - телефон уже зарегистрирован
    if (status === 409 && errorCode === 'PHONE_ALREADY_REGISTERED') {
      const customError = new Error(message || 'Этот номер телефона уже зарегистрирован. Пожалуйста, войдите в существующий аккаунт.');
      (customError as any).response = error.response;
      (customError as any).code = errorCode;
      return Promise.reject(customError);
    }

    // Если пользователь не найден - очищаем всё и выходим
    if (
      (status === 500 || status === 401) && 
      (message === 'User not found' || 
       message === 'User not found. Please login again.')
    ) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    // Если получили 401 и это не повторный запрос и не запрос на refresh
    if (status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh') {
      console.log('[HTTP] Got 401, attempting token refresh');

      if (isRefreshing) {
        // Если уже идет обновление токена, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Пытаемся обновить токен
        await http.post('/auth/refresh', {}, { withCredentials: true });
        
        console.log('[HTTP] Token refreshed successfully');
        processQueue();
        isRefreshing = false;

        // Повторяем оригинальный запрос
        return http(originalRequest);
      } catch (refreshError) {
        console.error('[HTTP] Token refresh failed:', refreshError);
        processQueue(new Error('Token refresh failed'));
        isRefreshing = false;
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
