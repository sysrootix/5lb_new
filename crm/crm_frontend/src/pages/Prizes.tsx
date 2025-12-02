import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { Plus, Edit2, Trash2, X, Save, Gift } from 'lucide-react';
import clsx from 'clsx';

interface Prize {
    id: string;
    name: string;
    code: string;
    weight: number;
    isActive: boolean;
}

import { useNotification } from '../context/NotificationContext';

export default function Prizes() {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Prize>>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof Prize; direction: 'asc' | 'desc' } | null>(null);

    const { data: prizes, isLoading } = useQuery({
        queryKey: ['prizes'],
        queryFn: async () => {
            const res = await api.get('/crm-api/prizes', {
            });
            return res.data;
        },
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Prize>) => {
            await api.post('/crm-api/prizes', data, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prizes'] });
            setIsCreating(false);
            setFormData({});
            showNotification('success', 'Приз создан', 'Новый приз успешно добавлен');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось создать приз'),
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<Prize> }) => {
            await api.put(`/crm-api/prizes/${data.id}`, data.updates, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prizes'] });
            setEditingPrize(null);
            setFormData({});
            showNotification('success', 'Приз обновлен', 'Данные приза успешно сохранены');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось обновить приз'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/crm-api/prizes/${id}`, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prizes'] });
            showNotification('success', 'Приз удален', 'Приз был успешно удален');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось удалить приз'),
    });

    const handleEdit = (prize: Prize) => {
        setEditingPrize(prize);
        setFormData(prize);
    };

    const handleCreate = () => {
        setIsCreating(true);
        setFormData({ isActive: true, weight: 10 });
    };

    const handleSave = () => {
        if (!formData.name || !formData.code || !formData.weight) {
            showNotification('error', 'Ошибка валидации', 'Заполните все обязательные поля');
            return;
        }

        if (editingPrize) {
            updateMutation.mutate({ id: editingPrize.id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этот приз?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSort = (key: keyof Prize) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedPrizes = [...(prizes || [])].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Призы рулетки</h1>
                    <p className="text-gray-400 mt-1">Управление призами и их вероятностями</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Добавить приз
                </button>
            </div>

            <div className="bg-[#180C06] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('name')}>Название</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('code')}>Код</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('weight')}>Вес (Шанс)</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('isActive')}>Статус</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedPrizes?.map((prize: Prize) => (
                                <tr key={prize.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-primary">
                                                <Gift className="w-5 h-5" />
                                            </div>
                                            <span className="text-white font-medium">{prize.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-mono text-sm">{prize.code}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary" 
                                                    style={{ width: `${Math.min(prize.weight, 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-white font-bold">{prize.weight}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-lg text-xs font-bold",
                                            prize.isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {prize.isActive ? 'Активен' : 'Скрыт'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(prize)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(prize.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(editingPrize || isCreating) && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setEditingPrize(null);
                        setIsCreating(false);
                    }}
                >
                    <div 
                        className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isCreating ? 'Новый приз' : 'Редактирование приза'}
                            </h2>
                            <button
                                onClick={() => {
                                    setEditingPrize(null);
                                    setIsCreating(false);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>


                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Название</label>
                                <input
                                    type="text"
                                    value={formData.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Например: 1000 бонусов"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Код (системный)</label>
                                <input
                                    type="text"
                                    value={formData.code || ''}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="bonus_1000"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Вес (Вероятность)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="100"
                                        value={formData.weight || 10}
                                        onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                                        className="flex-1 accent-primary"
                                    />
                                    <input
                                        type="number"
                                        value={formData.weight || 10}
                                        onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                                        className="w-20 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white text-center focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Чем выше число, тем чаще будет выпадать этот приз</p>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive ?? true}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                    />
                                    <span className="text-white font-medium">Приз активен</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Сохранить
                            </button>
                            <button
                                onClick={() => {
                                    setEditingPrize(null);
                                    setIsCreating(false);
                                }}
                                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/5"
                            >
                                Отмена
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

