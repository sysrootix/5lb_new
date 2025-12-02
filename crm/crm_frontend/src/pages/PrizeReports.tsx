import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Trophy, Ticket, MousePointer2, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { User } from '../types';
import UserEditModal from '../components/UserEditModal';
import { useNotification } from '../context/NotificationContext';

const COLORS = ['#FF6B00', '#E94B3C', '#22C55E', '#3B82F6', '#A855F7', '#F59E0B'];

export default function PrizeReports() {
    const token = useAuthStore((state) => state.token);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['prize-stats'],
        queryFn: async () => {
            const res = await api.get('/crm-api/prizes/stats', {
            });
            return res.data;
        },
        enabled: !!token,
    });

    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ['prize-activity', page],
        queryFn: async () => {
            const res = await api.get(`/crm-api/prizes/activity?page=${page}&limit=${limit}`, {
            });
            return res.data;
        },
        enabled: !!token,
        placeholderData: (previousData) => previousData,
    });

    const sortedActivityItems = useMemo(() => {
        if (!activityData?.items) return [];
        const items = [...activityData.items];
        if (sortConfig) {
            items.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return items;
    }, [activityData, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const updateUserMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<User> }) => {
            const res = await api.put(`/crm-api/users/${data.id}`, data.updates, {
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['prize-activity'] }); // Maybe redundant but okay
            setSelectedUser(null);
            showNotification('success', 'Пользователь обновлен', 'Данные пользователя успешно сохранены');
        },
        onError: () => {
            showNotification('error', 'Ошибка', 'Не удалось обновить данные пользователя');
        }
    });

    const handleUserClick = async (telegramId: string) => {
        setIsLoadingUser(true);
        try {
            const res = await api.get(`/crm-api/users?telegramId=${telegramId}`, {
            });
            if (res.data.data && res.data.data.length > 0) {
                setSelectedUser(res.data.data[0]);
            } else {
                showNotification('info', 'Пользователь не найден', 'Пользователь с таким Telegram ID не найден в базе');
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            showNotification('error', 'Ошибка', 'Ошибка при загрузке данных пользователя');
        } finally {
            setIsLoadingUser(false);
        }
    };

    const handleSaveUser = (id: string, updates: Partial<User>) => {
        updateUserMutation.mutate({ id, updates });
    };

    if (statsLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (!stats) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Отчет по призам</h1>
                    <p className="text-gray-400 mt-2">Статистика использования и эффективность</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                    title="Всего выдано кодов"
                    value={stats.summary.totalCodes}
                    icon={Ticket}
                    color="blue"
                />
                <KpiCard
                    title="Использовано кодов"
                    value={stats.summary.usedCodes}
                    icon={Trophy}
                    color="green"
                />
                <KpiCard
                    title="Конверсия в использование"
                    value={`${stats.summary.conversionRate.toFixed(1)}%`}
                    icon={MousePointer2}
                    color="orange"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Usage Trend Chart */}
                <div className="bg-[#180C06] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Динамика использования (30 дней)</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.chartData}>
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#666" 
                                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                    tickFormatter={(val) => val.slice(5)}
                                />
                                <YAxis 
                                    stroke="#666" 
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#180C06', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    itemStyle={{ color: '#FF6B00' }}
                                />
                                <Bar dataKey="count" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Prize Distribution Chart */}
                <div className="bg-[#180C06] border border-white/5 rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6">Распределение призов</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.prizeDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                >
                                    {stats.prizeDistribution.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#180C06', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                />
                                <Legend 
                                    layout="vertical" 
                                    verticalAlign="middle" 
                                    align="right"
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity Table */}
            <div className="bg-[#180C06] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white">Последние действия</h2>
                    <div className="text-sm text-gray-500">
                        Страница {page} из {activityData?.totalPages || 1}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('prizeName')}>Приз</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('used')}>Статус</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('telegramId')}>Пользователь (TG)</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('createdAt')}>Дата выдачи</th>
                                <th className="px-6 py-4 cursor-pointer hover:text-white transition-colors" onClick={() => handleSort('usedAt')}>Дата использования</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {sortedActivityItems.map((item: any) => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white font-medium">{item.prizeName}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-3 py-1 rounded-lg text-xs font-bold",
                                            item.used ? "bg-green-500/10 text-green-500" : "bg-yellow-500/10 text-yellow-500"
                                        )}>
                                            {item.used ? 'Использован' : 'Выдан'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {item.telegramId ? (
                                            <button 
                                                onClick={() => handleUserClick(item.telegramId)}
                                                disabled={isLoadingUser}
                                                className="flex items-center gap-2 group/user disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                <Users className="w-4 h-4 text-blue-400" />
                                                <span className="text-blue-400 group-hover/user:underline group-hover/user:text-blue-300 transition-colors">
                                                    {item.telegramId}
                                                </span>
                                            </button>
                                        ) : (
                                            <span className="text-gray-500">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(item.createdAt).toLocaleString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {item.usedAt ? new Date(item.usedAt).toLocaleString('ru-RU') : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination Controls */}
                <div className="p-4 border-t border-white/5 flex items-center justify-between">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || activityLoading}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Назад
                    </button>
                    <span className="text-gray-400 text-sm">
                        {activityLoading ? 'Загрузка...' : `Страница ${page}`}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!activityData || page >= activityData.totalPages || activityLoading}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        Вперед
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            
            <UserEditModal
                user={selectedUser}
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                onSave={handleSaveUser}
                isSaving={updateUserMutation.isPending}
            />
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, color = 'primary' }: any) {
    const colors = {
        blue: 'text-blue-400 bg-blue-400/10',
        green: 'text-green-400 bg-green-400/10',
        orange: 'text-orange-400 bg-orange-400/10',
        purple: 'text-purple-400 bg-purple-400/10',
        primary: 'text-primary bg-primary/10',
    };

    const colorClass = colors[color as keyof typeof colors] || colors.primary;

    return (
        <div className="bg-[#180C06] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className={clsx("p-3 rounded-xl", colorClass)}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div>
                <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
}
