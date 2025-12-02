import { http as api } from './index';

export interface RouletteItem {
    id: string;
    name: string;
    amount: number;
    color: string;
}

export interface SpinResult {
    item: RouletteItem;
    log: {
        id: string;
        amount: number;
        createdAt: string;
    };
}

export const checkRouletteEligibility = async (): Promise<{ isEligible: boolean }> => {
    const response = await api.get('/roulette/status');
    return response.data;
};

export const getRouletteItems = async (): Promise<RouletteItem[]> => {
    const response = await api.get('/roulette/items');
    return response.data;
};

export const spinRoulette = async (): Promise<SpinResult> => {
    const response = await api.post('/roulette/spin');
    return response.data;
};
