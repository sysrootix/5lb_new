import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { Plus, Edit2, Trash2, X, Save, Gift, TrendingUp, Users, DollarSign, BarChart3, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useNotification } from '../context/NotificationContext';

interface RouletteItem {
    id: string;
    amount: number;
    probability: number;
    color?: string;
    isActive: boolean;
    timesWon?: number;
}

interface RouletteStats {
    totalSpins: number;
    totalBonuses: number;
    distribution: Array<{ amount: number; _count: { amount: number } }>;
    recentSpins: Array<{
        id: string;
        amount: number;
        createdAt: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            displayName: string | null;
            telegramId: string | null;
        };
    }>;
    itemStats: RouletteItem[];
}

export default function Roulette() {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    const [editingItem, setEditingItem] = useState<RouletteItem | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<RouletteItem>>({});
    const [activeTab, setActiveTab] = useState<'items' | 'stats'>('items');

    const { data: items, isLoading: itemsLoading } = useQuery({
        queryKey: ['roulette-items'],
        queryFn: async () => {
            const res = await api.get('/crm-api/roulette', {
            });
            return res.data as RouletteItem[];
        },
        enabled: !!token && activeTab === 'items',
    });

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['roulette-stats'],
        queryFn: async () => {
            const res = await api.get('/crm-api/roulette/stats', {
            });
            return res.data as RouletteStats;
        },
        enabled: !!token && activeTab === 'stats',
        refetchInterval: 30000, // Refresh every 30 seconds
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<RouletteItem>) => {
            await api.post('/crm-api/roulette', data, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roulette-items'] });
            queryClient.invalidateQueries({ queryKey: ['roulette-stats'] });
            setIsCreating(false);
            setFormData({});
            showNotification('success', 'Элемент создан', 'Новый элемент рулетки успешно добавлен');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось создать элемент'),
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<RouletteItem> }) => {
            await api.put(`/crm-api/roulette/${data.id}`, data.updates, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roulette-items'] });
            queryClient.invalidateQueries({ queryKey: ['roulette-stats'] });
            setEditingItem(null);
            setFormData({});
            showNotification('success', 'Элемент обновлен', 'Данные элемента успешно сохранены');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось обновить элемент'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/crm-api/roulette/${id}`, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roulette-items'] });
            queryClient.invalidateQueries({ queryKey: ['roulette-stats'] });
            showNotification('success', 'Элемент удален', 'Элемент был успешно удален');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось удалить элемент'),
    });

    const handleEdit = (item: RouletteItem) => {
        setEditingItem(item);
        setFormData(item);
    };

    const handleCreate = () => {
        setIsCreating(true);
        setFormData({ isActive: true, probability: 10, color: '#FF7F32' });
    };

    const handleSave = () => {
        if (!formData.amount || !formData.probability) {
            showNotification('error', 'Ошибка валидации', 'Заполните все обязательные поля');
            return;
        }

        if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleCancel = () => {
        setEditingItem(null);
        setIsCreating(false);
        setFormData({});
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        Рулетка после регистрации
                    </h1>
                    <p className="text-gray-400 mt-2">Управление элементами рулетки и статистика выигрышей</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab('items')}
                    className={clsx(
                        'px-6 py-2.5 rounded-lg font-medium transition-all',
                        activeTab === 'items'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    Настройка шансов
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={clsx(
                        'px-6 py-2.5 rounded-lg font-medium transition-all',
                        activeTab === 'stats'
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    )}
                >
                    Статистика
                </button>
            </div>

            {/* Items Tab */}
            {activeTab === 'items' && (
                <>
                    {/* Add Button */}
                    {!isCreating && !editingItem && (
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Добавить элемент
                        </button>
                    )}

                    {/* Create/Edit Form */}
                    {(isCreating || editingItem) && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                {editingItem ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                {editingItem ? 'Редактировать элемент' : 'Новый элемент'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Сумма бонусов <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.amount || ''}
                                        onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Вероятность (вес) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.probability || ''}
                                        onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="10"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Чем выше значение, тем чаще выпадает</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Цвет</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={formData.color || '#FF7F32'}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-16 h-10 bg-white/5 border border-white/10 rounded-xl cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color || ''}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="#FF7F32"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Статус</label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive || false}
                                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-5 h-5 rounded border-white/20 text-primary focus:ring-primary"
                                        />
                                        <span className="text-white">Активен</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Сохранить
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                                >
                                    <X className="w-4 h-4" />
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Items List */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                        {itemsLoading ? (
                            <div className="p-8 text-center text-gray-400">Загрузка...</div>
                        ) : items && items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Цвет
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Сумма
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Вероятность
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Статус
                                            </th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                                Действия
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {items.map((item) => (
                                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div
                                                        className="w-8 h-8 rounded-lg border-2 border-white/20"
                                                        style={{ backgroundColor: item.color || '#FF7F32' }}
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-lg font-bold text-white">{item.amount} ₽</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-white font-medium">{item.probability}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={clsx(
                                                            'px-3 py-1 rounded-full text-xs font-medium',
                                                            item.isActive
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-red-500/20 text-red-400'
                                                        )}
                                                    >
                                                        {item.isActive ? 'Активен' : 'Неактивен'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEdit(item)}
                                                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Вы уверены, что хотите удалить этот элемент?')) {
                                                                    deleteMutation.mutate(item.id);
                                                                }
                                                            }}
                                                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-gray-400">
                                Нет элементов рулетки. Создайте первый элемент.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div className="space-y-6">
                    {statsLoading ? (
                        <div className="p-8 text-center text-gray-400">Загрузка статистики...</div>
                    ) : stats ? (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-400">Всего прокруток</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{stats.totalSpins.toLocaleString()}</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                                            <DollarSign className="w-5 h-5 text-green-400" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-400">Выдано бонусов</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">{stats.totalBonuses.toLocaleString()} ₽</p>
                                </div>

                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-400">Средний выигрыш</span>
                                    </div>
                                    <p className="text-3xl font-black text-white">
                                        {stats.totalSpins > 0 ? Math.round(stats.totalBonuses / stats.totalSpins).toLocaleString() : 0} ₽
                                    </p>
                                </div>
                            </div>

                            {/* Items Stats */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5" />
                                    Статистика по элементам
                                </h3>
                                <div className="space-y-3">
                                    {stats.itemStats.map((item) => {
                                        const percentage = stats.totalSpins > 0 ? ((item.timesWon || 0) / stats.totalSpins) * 100 : 0;
                                        return (
                                            <div key={item.id} className="flex items-center gap-4">
                                                <div
                                                    className="w-6 h-6 rounded-lg border-2 border-white/20 flex-shrink-0"
                                                    style={{ backgroundColor: item.color || '#FF7F32' }}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-white font-medium">{item.amount} ₽</span>
                                                        <span className="text-gray-400 text-sm">
                                                            {item.timesWon || 0} раз ({percentage.toFixed(1)}%)
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Recent Spins */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Gift className="w-5 h-5" />
                                        Последние выигрыши
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-white/5 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                                                    Пользователь
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                                                    Сумма
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                                                    Дата и время
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {stats.recentSpins.slice(0, 20).map((spin) => (
                                                <tr key={spin.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="text-white font-medium">
                                                            {spin.user.displayName ||
                                                                `${spin.user.firstName || ''} ${spin.user.lastName || ''}`.trim() ||
                                                                spin.user.telegramId ||
                                                                'Неизвестный'}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-lg font-bold text-primary">{spin.amount} ₽</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400">{formatDate(spin.createdAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-8 text-center text-gray-400">Нет данных статистики</div>
                    )}
                </div>
            )}
        </div>
    );
}
