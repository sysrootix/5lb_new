import { useEffect, useState } from 'react';
import api from '../utils/axios';
import { Users, ShoppingBag, Activity, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/auth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface DashboardStats {
    totalUsers: number;
    activeUsers: number;
    newOrdersToday: number;
    totalOrders: number;
    chartData: { date: string; count: number }[];
}

type Period = 'day' | 'week' | 'month';

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('day');
    const token = useAuthStore((state) => state.token);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            setLoading(true);

            try {
                const res = await api.get(`/crm-api/stats?period=${period}`);
                setStats(res.data);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token, period]);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Если статов нет совсем
    if (!stats && !loading) return null;

    // Безопасное получение данных (даже если stats null при загрузке)
    const chartData = stats?.chartData || [];

    const formatXAxis = (date: string) => {
        if (period === 'day') return date.slice(8); // Day number (26)
        if (period === 'month') return date.slice(5); // Month (11)
        return date.slice(5); // W42 or date part
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Обзор</h1>
                    <p className="text-gray-400 mt-2">Статистика и показатели</p>
                </div>
            </div>

            {/* KPI Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <KpiCard
                        title="Всего пользователей"
                        value={stats.totalUsers}
                        icon={Users}
                        trend="+12%" 
                        color="blue"
                    />
                    <KpiCard
                        title="Активные за 7 дней"
                        value={stats.activeUsers}
                        icon={Activity}
                        color="green"
                    />
                    <KpiCard
                        title="Заказы сегодня"
                        value={stats.newOrdersToday}
                        icon={ShoppingBag}
                        color="orange"
                    />
                    <KpiCard
                        title="Всего заказов"
                        value={stats.totalOrders}
                        icon={TrendingUp}
                        color="purple"
                    />
                </div>
            )}

            {/* Chart Section */}
            <div className="bg-[#180C06] border border-white/5 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">Регистрации пользователей</h2>
                        <p className="text-sm text-gray-400">Динамика за выбранный период</p>
                    </div>
                    
                    {/* Period Selector */}
                    <div className="flex bg-white/5 rounded-lg p-1">
                        {(['day', 'week', 'month'] as Period[]).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={clsx(
                                    "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                                    period === p 
                                        ? "bg-primary text-white shadow-lg" 
                                        : "text-gray-400 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {p === 'day' ? 'Дни' : p === 'week' ? 'Недели' : 'Месяцы'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Wrapper */}
                <div className="h-80 w-full">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#666" 
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    tickFormatter={formatXAxis}
                                    axisLine={false}
                                    tickLine={false}
                                    minTickGap={20}
                                />
                                <YAxis 
                                    stroke="#666" 
                                    tick={{ fill: '#9CA3AF', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255, 107, 0, 0.1)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-[#180C06] border border-white/10 p-3 rounded-lg shadow-xl">
                                                    <p className="text-gray-400 text-xs mb-1">{label}</p>
                                                    <p className="text-white font-bold text-lg">
                                                        {payload[0].value}
                                                        <span className="text-xs font-normal text-gray-500 ml-1">рег.</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill="#FF6B00" 
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Нет данных за выбранный период
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function KpiCard({ title, value, icon: Icon, trend, color = 'primary' }: any) {
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
                {trend && (
                    <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white">{value}</h3>
            </div>
        </div>
    );
}
