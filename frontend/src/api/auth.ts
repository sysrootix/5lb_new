import { http } from './http';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  telegram: boolean;
  push: boolean;
  marketing: boolean;
}

export interface User {
  id: string;
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  displayName?: string | null;
  avatar?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  telegramId?: string | null;
  telegramUsername?: string | null;
  referralCode?: string | null;
  bonusBalance?: number;
  notifications: NotificationSettings;
  isRegistrationComplete: boolean;
}

export interface AuthResponse {
  user: User;
  isNewUser: boolean;
  needsRegistration: boolean;
}

export interface RegistrationData {
  firstName: string;
  lastName?: string; // Фамилия необязательна
  middleName?: string;
  dateOfBirth: string; // ISO string
  gender?: Gender;
  referredByCode?: string;
  notifications?: Partial<NotificationSettings>;
}

export const requestSmsCode = async (phone: string) => {
  await http.post('/auth/login', { phone });
};

export const verifySmsCode = async (phone: string, code: string) => {
  const { getOrCreateFingerprint } = await import('../utils/fingerprint');
  const fingerprint = await getOrCreateFingerprint();

  const { data } = await http.post<AuthResponse>('/auth/verify', { phone, code, fingerprint }, {
    withCredentials: true
  });
  return data;
};

export const verifySms = verifySmsCode; // Alias for compatibility

export const loginWithTelegram = async (initData: string) => {
  const { getOrCreateFingerprint } = await import('../utils/fingerprint');
  const fingerprint = await getOrCreateFingerprint();

  const { data } = await http.post<AuthResponse>('/auth/telegram', { initData, fingerprint }, {
    withCredentials: true
  });
  return data;
};

export const completeRegistration = async (registrationData: RegistrationData) => {
  const { data } = await http.post<{ user: User }>('/auth/complete-registration', registrationData, {
    withCredentials: true
  });
  return data;
};

// Регистрация нового пользователя через Telegram с номером телефона
export const registerWithTelegram = async (initData: string, phone: string, registrationData: RegistrationData) => {
  const { data } = await http.post<AuthResponse>('/auth/telegram/register', {
    initData,
    phone,
    ...registrationData
  }, {
    withCredentials: true
  });
  return data;
};

export const refreshToken = async () => {
  const { data } = await http.post<{ user: User }>('/auth/refresh', {}, {
    withCredentials: true
  });
  return data;
};

export const logout = async () => {
  await http.post('/auth/logout', {}, {
    withCredentials: true
  });
};

export const getTelegramConfig = async () => {
  const { data } = await http.get('/auth/telegram/config');
  return data as { botId: string };
};

/**
 * Получить URL для авторизации через Google
 */
export const getGoogleAuthUrl = async (): Promise<string> => {
  const response = await http.get<{ authUrl: string }>('/auth/oauth/google/url');
  return response.data.authUrl;
};

/**
 * Получить URL для авторизации через Яндекс
 */
export const getYandexAuthUrl = async (): Promise<string> => {
  const response = await http.get<{ authUrl: string }>('/auth/oauth/yandex/url');
  return response.data.authUrl;
};

/**
 * Получить URL для авторизации через Apple ID
 */
export const getAppleAuthUrl = async (): Promise<string> => {
  const response = await http.get<{ authUrl: string }>('/auth/oauth/apple/url');
  return response.data.authUrl;
};

export interface ProfileResponse {
  id: string;
  phone: string;
  displayName: string;
  bonus: number;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  avatar: string | null;
  email: string | null;
  telegramId: string | null;
  telegramLinked: boolean;
  telegramUsername: string | null;
  notifications: NotificationSettings;
  profile: {
    isCompleted: boolean;
    dateOfBirth: string | null;
    gender: Gender | null;
  };
  pendingPhoneChange: string | null;
  phoneChangeExpiresAt: number | null;
}

export interface UpdateProfilePayload {
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  email?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  notifications?: Partial<NotificationSettings>;
}

export interface PhoneChangeRequestResponse {
  success: boolean;
  pendingPhoneChange: string | null;
  phoneChangeExpiresAt: number | null;
}

export const fetchProfile = async () => {
  const { data } = await http.get<ProfileResponse>('/profile', {
    withCredentials: true
  });
  return data;
};

export const updateProfile = async (payload: UpdateProfilePayload) => {
  const { data } = await http.patch<ProfileResponse>('/profile', payload, {
    withCredentials: true
  });
  return data;
};

export const requestPhoneChange = async (newPhone: string) => {
  const { data } = await http.post<PhoneChangeRequestResponse>('/profile/phone/request', { newPhone }, {
    withCredentials: true
  });
  return data;
};

export const confirmPhoneChange = async (code: string) => {
  const { data } = await http.post<ProfileResponse>('/profile/phone/confirm', { code }, {
    withCredentials: true
  });
  return data;
};

export const linkTelegramAccount = async (initData: string) => {
  const { data } = await http.post<ProfileResponse>('/profile/telegram/link', { initData }, {
    withCredentials: true
  });
  return data;
};

export const unlinkTelegramAccount = async () => {
  const { data } = await http.post<ProfileResponse>('/profile/telegram/unlink', {}, {
    withCredentials: true
  });
  return data;
};

export const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const { data } = await http.post<ProfileResponse>('/profile/avatar', formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const deleteAccount = async () => {
  const { data } = await http.delete<{ success: boolean }>('/profile/account', {
    withCredentials: true
  });
  return data;
};
