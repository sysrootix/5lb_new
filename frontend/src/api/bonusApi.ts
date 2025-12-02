import { http } from './http';

export interface BonusCardData {
  id: string;
  cardCode: string; // 'BASE', 'PARTNER'
  name: string;
  balance: number;
  imageUrl: string | null;
  settings: any;
}

export const getUserCards = async (): Promise<BonusCardData[]> => {
  const { data } = await http.get<{ success: boolean; data: BonusCardData[] }>('/bonuses/cards');
  return data.data;
};
