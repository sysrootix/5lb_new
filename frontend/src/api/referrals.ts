import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export interface ReferralStats {
  referralCode: string | null;
  totalReferrals: number;
  referralsWithPurchase: number;
  tenFriendsBonusCount: number;
  referralsUntilNextBonus: number;
  referrals: Array<{
    id: string;
    name: string;
    phone: string;
    registeredAt: string;
    hasPurchase: boolean;
    purchaseDate: string | null;
    bonusAwarded: boolean;
  }>;
}

export interface ReferrerInfo {
  name: string;
}

export const getReferralStats = async (): Promise<ReferralStats> => {
  const response = await axios.get(`${API_URL}/users/referrals/stats`, {
    withCredentials: true
  });
  return response.data;
};

export const getReferrerByCode = async (code: string): Promise<ReferrerInfo | null> => {
  try {
    const response = await axios.get(`${API_URL}/users/referrals/referrer/${code}`);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const recordReferralClick = async (telegramId: string, referralCode: string): Promise<{success: boolean; referrerName?: string; error?: string}> => {
  try {
    const response = await axios.post(`${API_URL}/users/referrals/click`, {
      telegramId,
      referralCode
    });
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      error: error?.response?.data?.error || 'Ошибка записи реферального клика'
    };
  }
};

export const getReferralClickByTelegramId = async (telegramId: string): Promise<{referralCode: string; referrerName: string} | null> => {
  try {
    const response = await axios.get(`${API_URL}/users/referrals/click/${telegramId}`);
    return response.data;
  } catch (error: any) {
    // 404 - нормальная ситуация, код не найден
    if (error?.response?.status === 404) {
      return null;
    }
    console.error('Ошибка при получении реферального кода:', error);
    return null;
  }
};
