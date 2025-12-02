import axios from 'axios';
import appConfig from '@config/app-config.json';

const baseURL =
  process.env.EXPO_PUBLIC_API_URL ??
  (typeof appConfig.apiBaseUrl === 'string' ? appConfig.apiBaseUrl : 'https://app.5lb.pro/api');

const api = axios.create({
  baseURL
});

export const requestSmsCode = async (phone: string) => {
  await api.post('/auth/login', { phone });
};

export const verifySmsCode = async (phone: string, code: string) => {
  const { data } = await api.post('/auth/verify', { phone, code });
  return data as { token: string };
};

export const fetchProfile = async (token: string) => {
  const { data } = await api.get('/profile', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data as {
    id: string;
    phone: string;
    displayName: string;
    bonus: number;
  };
};
