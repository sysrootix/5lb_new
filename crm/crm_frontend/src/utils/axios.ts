import axios from 'axios';
import { useAuthStore } from '../store/auth';

// Создаем инстанс axios с базовой конфигурацией
const axiosInstance = axios.create({
    baseURL: '/',
    timeout: 30000,
});

// Request interceptor - добавляем токен к каждому запросу
axiosInstance.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - обрабатываем ошибки авторизации
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Если получили 401 или 403 ошибку
        if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
            // Проверяем, что это не запрос на refresh или login
            if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Если уже обновляем токен, добавляем запрос в очередь
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axiosInstance(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = useAuthStore.getState().refreshToken;

            if (!refreshToken) {
                // Нет refresh токена - выходим
                isRefreshing = false;
                useAuthStore.getState().logout();
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Пытаемся обновить токен
                const response = await axios.post('/crm-api/auth/refresh', {
                    refreshToken,
                });

                const { token: newToken, refreshToken: newRefreshToken } = response.data;

                // Сохраняем новые токены
                useAuthStore.getState().setTokens(newToken, newRefreshToken);

                // Обновляем заголовок для повторного запроса
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Обрабатываем очередь
                processQueue(null, newToken);

                isRefreshing = false;

                // Повторяем оригинальный запрос
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                // Не удалось обновить токен - выходим
                processQueue(refreshError, null);
                isRefreshing = false;
                useAuthStore.getState().logout();

                // Показываем модальное окно с предложением зайти заново
                if (window.confirm('Сеанс истек. Пожалуйста, войдите заново.')) {
                    window.location.href = '/login';
                } else {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
