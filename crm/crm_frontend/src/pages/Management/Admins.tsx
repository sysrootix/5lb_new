import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/axios';
import { useAuthStore } from '../../store/auth';
import { Plus, Edit2, Trash2, X, Save, Shield, Lock, UserCog } from 'lucide-react';
import clsx from 'clsx';
import { useNotification } from '../../context/NotificationContext';

interface Admin {
    id: string;
    username: string;
    role: string;
    lastLoginAt?: string;
    createdAt: string;
    permissions?: string[];
}

export default function Admins() {
    const token = useAuthStore((state) => state.token);
    const currentUser = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Admin> & { password?: string }>({});
    const [sortConfig, setSortConfig] = useState<{ key: keyof Admin; direction: 'asc' | 'desc' } | null>(null);

    const { data: admins, isLoading } = useQuery({
        queryKey: ['admins'],
        queryFn: async () => {
            const res = await api.get('/crm-api/admins', {
            });
            return res.data;
        },
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: async (data: Partial<Admin> & { password?: string }) => {
            await api.post('/crm-api/admins', data, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            setIsCreating(false);
            setFormData({});
            showNotification('success', 'Администратор создан', 'Новый администратор успешно добавлен');
        },
        onError: (err: any) => showNotification('error', 'Ошибка', err.response?.data?.error || 'Не удалось создать администратора'),
    });

    const updateMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<Admin> & { password?: string } }) => {
            await api.put(`/crm-api/admins/${data.id}`, data.updates, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            setEditingAdmin(null);
            setFormData({});
            showNotification('success', 'Администратор обновлен', 'Данные администратора успешно сохранены');
        },
        onError: (err: any) => showNotification('error', 'Ошибка', err.response?.data?.error || 'Не удалось обновить администратора'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/crm-api/admins/${id}`, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admins'] });
            showNotification('success', 'Администратор удален', 'Администратор был успешно удален');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось удалить администратора'),
    });

    const handleEdit = (admin: Admin) => {
        setEditingAdmin(admin);
        setFormData({
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions,
        });
    };

    const handleCreate = () => {
        setIsCreating(true);
        setFormData({ role: 'admin' });
    };

    const handleSave = () => {
        if (!formData.username || (!editingAdmin && !formData.password)) {
            showNotification('error', 'Ошибка валидации', 'Заполните обязательные поля');
            return;
        }

        if (editingAdmin) {
            updateMutation.mutate({ id: editingAdmin.id, updates: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить этого администратора?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSort = (key: keyof Admin) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedAdmins = [...(admins || [])].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] === undefined || b[key] === undefined) return 0;
        if (a[key]! < b[key]!) return direction === 'asc' ? -1 : 1;
        if (a[key]! > b[key]!) return direction === 'asc' ? 1 : -1;
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
                    <h1 className="text-2xl font-bold text-white">Администраторы</h1>
                    <p className="text-gray-400 mt-1">Управление доступом и правами сотрудников</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Добавить админа
                </button>
            </div>

            <div className="bg-[#180C06] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('username')}>Пользователь</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('role')}>Роль</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('lastLoginAt')}>Последний вход</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('createdAt')}>Создан</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedAdmins?.map((admin: Admin) => (
                                <tr key={admin.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-primary font-bold">
                                                {admin.username[0].toUpperCase()}
                                            </div>
                                            <span className="text-white font-medium">{admin.username}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-lg text-xs font-bold uppercase",
                                            admin.role === 'root' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {admin.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString('ru-RU') : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 text-sm">
                                        {new Date(admin.createdAt).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(admin)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {admin.username !== 'root' && admin.id !== currentUser?.id && (
                                            <button
                                                onClick={() => handleDelete(admin.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(isCreating || editingAdmin) && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setEditingAdmin(null);
                        setIsCreating(false);
                    }}
                >
                    <div 
                        className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isCreating ? 'Новый администратор' : 'Редактирование'}
                            </h2>
                            <button
                                onClick={() => {
                                    setEditingAdmin(null);
                                    setIsCreating(false);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>


                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Логин</label>
                                <div className="relative">
                                    <UserCog className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="text"
                                        value={formData.username || ''}
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="username"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    {isCreating ? 'Пароль' : 'Новый пароль (необязательно)'}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <input
                                        type="password"
                                        value={formData.password || ''}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Роль</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <select
                                        value={formData.role || 'admin'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                                    >
                                        <option value="admin" className="bg-[#180C06]">Admin</option>
                                        <option value="manager" className="bg-[#180C06]">Manager</option>
                                        <option value="root" className="bg-[#180C06]">Root</option>
                                    </select>
                                </div>
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
                                    setEditingAdmin(null);
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

