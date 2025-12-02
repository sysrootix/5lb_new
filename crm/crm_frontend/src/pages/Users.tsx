import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { Search, Edit2, Clock, CreditCard, Trash2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { User } from '../types';
import UserEditModal from '../components/UserEditModal';
import UserCardsModal from '../components/UserCardsModal';
import { useNotification } from '../context/NotificationContext';

export default function Users() {
    const token = useAuthStore((state) => state.token);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [cardsUser, setCardsUser] = useState<User | null>(null);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            if (!token) return { data: [] };
            const res = await api.get('/crm-api/users', {
            });
            return res.data;
        },
        enabled: !!token, // Only run query if token exists
    });

    const updateUserMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<User> }) => {
            const res = await api.put(`/crm-api/users/${data.id}`, data.updates, {
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setEditingUser(null);
            showNotification('success', 'Пользователь обновлен', 'Данные пользователя успешно сохранены');
        },
        onError: () => {
            showNotification('error', 'Ошибка', 'Не удалось обновить данные пользователя');
        }
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await api.delete(`/crm-api/users/${userId}`, {
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showNotification('success', 'Пользователь удален', 'Пользователь удален, бэкап сохранен');
        },
        onError: () => {
            showNotification('error', 'Ошибка', 'Не удалось удалить пользователя');
        }
    });

    const users = usersData?.data || [];

    // Client-side search
    const filteredUsers = useMemo(() => {
        if (!users) return [];
        let result = users;
        
        if (search) {
        const searchLower = search.toLowerCase();
            result = result.filter((user: User) => {
            const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
            const phone = user.phone.toLowerCase();
            const email = (user.email || '').toLowerCase();
            return fullName.includes(searchLower) || phone.includes(searchLower) || email.includes(searchLower);
        });
        }

        if (sortConfig) {
            result = [...result].sort((a: User, b: User) => {
                const { key, direction } = sortConfig;
                if (a[key] === undefined || b[key] === undefined) return 0;
                if (a[key]! < b[key]!) return direction === 'asc' ? -1 : 1;
                if (a[key]! > b[key]!) return direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [users, search, sortConfig]);

    const handleSort = (key: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSave = (id: string, updates: Partial<User>) => {
        updateUserMutation.mutate({ id, updates });
    };

    const handleDelete = (user: User) => {
        const confirmMessage = `Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName} (${user.phone})?\n\nПеред удалением будет создан бэкап данных.`;
        if (confirm(confirmMessage)) {
            deleteUserMutation.mutate(user.id);
        }
    };

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-white">Пользователи</h1>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Поиск пользователей..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-[#180C06] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 w-full"
                    />
                </div>
            </div>

            {/* Mobile View */}
            <div className="block lg:hidden space-y-3">
                {filteredUsers?.map((user: User) => (
                    <div key={user.id} className="bg-[#180C06] border border-white/5 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                                    {user.firstName?.[0] || user.phone?.[0]}
                                </div>
                                <div>
                                    <div className="font-medium text-white">
                                        {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCardsUser(user)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="Управление картами"
                                >
                                    <CreditCard className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setEditingUser(user)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                    title="Редактировать"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(user)}
                                    className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    title="Удалить"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Телефон:</span>
                                <span className="text-white">{user.phone}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Email:</span>
                                <span className="text-white">{user.email || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Бонусы:</span>
                                <span className="text-primary font-medium">{user.bonusBalance}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Был в сети:</span>
                                <span className="text-white flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    {formatDate(user.lastLoginAt)}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                                <span className="text-gray-400">Создан:</span>
                                <span className="text-gray-400">{new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-[#180C06] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('firstName')}>Пользователь</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('phone')}>Контакты</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('bonusBalance')}>Бонусы</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('lastLoginAt')}>Был в сети</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('createdAt')}>Создан</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers?.map((user: User) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                                                {user.firstName?.[0] || user.phone?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-gray-300 text-sm">{user.phone}</span>
                                            <span className="text-gray-500 text-xs">{user.email || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-primary font-bold">{user.bonusBalance}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 text-sm">
                                        <div className="flex items-center gap-2">
                                            {user.lastLoginAt ? (
                                                <>
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                    {formatDate(user.lastLoginAt)}
                                                </>
                                            ) : (
                                                <span className="text-gray-600">-</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setCardsUser(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors inline-flex"
                                                title="Управление картами"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors inline-flex"
                                                title="Редактировать"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors inline-flex"
                                                title="Удалить"
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
            </div>

            <UserEditModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleSave}
                isSaving={updateUserMutation.isPending}
            />

            <UserCardsModal
                userId={cardsUser?.id || null}
                userName={cardsUser ? `${cardsUser.firstName} ${cardsUser.lastName}` : ''}
                isOpen={!!cardsUser}
                onClose={() => setCardsUser(null)}
            />
        </div>
    );
}
