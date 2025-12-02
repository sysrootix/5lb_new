import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Users, LogOut, Menu, X, LayoutDashboard, Gift, BarChart3, ShieldCheck, ChevronDown, Settings, Megaphone, Link, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function DashboardLayout() {
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [managementOpen, setManagementOpen] = useState(true); // Default open
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
        { to: '/promotions', icon: Megaphone, label: 'Акции' },
        { to: '/founders-links', icon: Link, label: 'Ссылки фаундеров' },
        { to: '/users', icon: Users, label: 'Пользователи' },
        { to: '/prizes', icon: Gift, label: 'Призы рулетки' },
        { to: '/prize-reports', icon: BarChart3, label: 'Отчет по призам' },
    ];

    const managementItems = [
        { to: '/roulette', icon: Sparkles, label: 'Рулетка после регистрации' },
    ];

    return (
        <div className="min-h-screen bg-[#0F0501] flex">
            <ChangePasswordModal />
            
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#180C06] border-b border-white/5 p-4 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    5LB CRM
                </h1>
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside
                className={clsx(
                    'w-72 bg-[#180C06] border-r border-white/5 flex flex-col',
                    'fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 lg:translate-x-0',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
                    'lg:static lg:h-screen lg:sticky lg:top-0' // Sticky on desktop
                )}
            >
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        5LB CRM
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">v1.0.0</p>
                </div>

                {/* User Profile Block - Fixed at Top now */}
                <div className="px-4 mb-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-lg">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{user?.username}</p>
                                <div className="flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <p className="text-xs text-gray-400 truncate capitalize">{user?.role}</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Выйти из системы
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Меню
                    </p>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                clsx(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                    isActive
                                        ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,107,0,0.1)]'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                )
                            }
                        >
                            <item.icon className={clsx("w-5 h-5 transition-colors", 
                                location.pathname.startsWith(item.to) ? "text-primary" : "group-hover:text-white"
                            )} />
                            <span className="font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    {/* Management Section */}
                        <div className="pt-4 mt-4 border-t border-white/5">
                            <button
                                onClick={() => setManagementOpen(!managementOpen)}
                                className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-white transition-colors"
                            >
                                <span>Управление</span>
                                <ChevronDown className={clsx("w-4 h-4 transition-transform", managementOpen ? "rotate-180" : "")} />
                            </button>

                            {managementOpen && (
                                <div className="mt-1 space-y-1">
                                {managementItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            clsx(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                                isActive
                                                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,107,0,0.1)]'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            )
                                        }
                                    >
                                        <item.icon className={clsx("w-5 h-5 transition-colors",
                                            location.pathname === item.to ? "text-primary" : "group-hover:text-white"
                                        )} />
                                        <span className="font-medium">{item.label}</span>
                                    </NavLink>
                                ))}
                                {user?.role === 'root' && (
                                    <NavLink
                                        to="/admins"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            clsx(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                                isActive
                                                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,107,0,0.1)]'
                                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            )
                                        }
                                    >
                                        <ShieldCheck className={clsx("w-5 h-5 transition-colors",
                                            location.pathname === '/admins' ? "text-primary" : "group-hover:text-white"
                                        )} />
                                        <span className="font-medium">Администраторы</span>
                                    </NavLink>
                                )}
                                <NavLink
                                    to="/settings"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        clsx(
                                            'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                                            isActive
                                                ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,107,0,0.1)]'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        )
                                    }
                                >
                                    <Settings className={clsx("w-5 h-5 transition-colors",
                                        location.pathname === '/settings' ? "text-primary" : "group-hover:text-white"
                                    )} />
                                    <span className="font-medium">Настройки</span>
                                    </NavLink>
                                </div>
                            )}
                        </div>
                </nav>
            </aside>

            {/* Overlay for mobile */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-auto bg-[#0F0501] pt-16 lg:pt-0">
                <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
