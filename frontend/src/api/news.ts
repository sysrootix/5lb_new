import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface News {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export const getNews = async (): Promise<News[]> => {
  try {
    const response = await axios.get(`${API_URL}/news`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};
