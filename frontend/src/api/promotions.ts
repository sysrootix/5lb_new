import { http as api } from './http';

export interface Promotion {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    link: string;
    showBeforeStart?: boolean; // Показывать ли акцию до даты начала
}

export const getPromotions = async (): Promise<Promotion[]> => {
    const response = await api.get<Promotion[]>('/promotions');
    return response.data;
};
