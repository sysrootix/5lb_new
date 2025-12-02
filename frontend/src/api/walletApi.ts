import { http } from './http';

/**
 * Добавить карту в Apple Wallet
 * @param cardId ID карты
 * @returns URL для скачивания .pkpass файла
 */
export const addToAppleWallet = async (cardId: string): Promise<string> => {
  try {
    const response = await http.get(`/wallet/apple/${cardId}`, {
      responseType: 'blob',
    });

    // Создаем URL для blob
    const blob = new Blob([response.data], { type: 'application/vnd.apple.pkpass' });
    const url = window.URL.createObjectURL(blob);

    return url;
  } catch (error: any) {
    console.error('Error adding to Apple Wallet:', error);
    // Пробрасываем ошибку с response для обработки в компоненте
    throw error;
  }
};

/**
 * Добавить карту в Google Wallet
 * @param cardId ID карты
 * @returns URL для добавления в Google Wallet
 */
export const addToGoogleWallet = async (cardId: string): Promise<string> => {
  try {
    const response = await http.get<{ walletUrl: string }>(`/wallet/google/${cardId}`);
    return response.data.walletUrl;
  } catch (error: any) {
    console.error('Error adding to Google Wallet:', error);
    // Пробрасываем ошибку с response для обработки в компоненте
    throw error;
  }
};
