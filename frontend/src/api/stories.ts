import { http } from './http';

export enum StoryMediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export interface StoryPage {
  id: string;
  storyId: string;
  type: StoryMediaType;
  url: string;
  content?: any; // JSON structure for overlays
  link?: string | null;
  order: number;
  duration?: number | null;
  hasBlur?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  title: string;
  previewImage: string;
  link?: string | null;
  isActive: boolean;
  priority: number;
  startDate?: string | null;
  endDate?: string | null;
  pages: StoryPage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Получить активные истории для главной страницы
 */
export const getStories = async (): Promise<Story[]> => {
  try {
    const response = await http.get<Story[]>('/stories');
    return response.data;
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
};

/**
 * Получить конкретную историю по ID
 */
export const getStoryById = async (id: string): Promise<Story | null> => {
  try {
    const response = await http.get<Story>(`/stories/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching story:', error);
    return null;
  }
};
