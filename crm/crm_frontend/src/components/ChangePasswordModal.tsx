import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import api from '../utils/axios';
import { Lock, Save, AlertTriangle } from 'lucide-react';

export default function ChangePasswordModal() {
    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    // Обновляем данные пользователя в сторе после смены пароля
    const setAuth = useAuthStore((state) => state.setAuth);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!user?.mustChangePassword) return null;

    // Prevent background scroll when modal is open
    document.body.style.overflow = 'hidden';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            await api.post(
                '/crm-api/auth/change-password',
                { newPassword },
                
            );
            
            // Обновляем локальное состояние пользователя, убирая флаг
            setAuth(token!, { ...user, mustChangePassword: false });
            
        } catch (err) {
            console.error(err);
            setError('Ошибка при смене пароля. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-[#180C06] border border-red-500/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Смена пароля обязательна</h2>
                    <p className="text-gray-400 text-sm">
                        В целях безопасности вам необходимо сменить временный пароль на новый.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* 
                        Поля для менеджеров паролей. 
                        Используем style вместо class hidden, чтобы браузер точно видел поля, но пользователь нет.
                    */}
                    <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', zIndex: -1 }}>
                        <input 
                            type="text" 
                            name="username" 
                            value={user?.username || ''} 
                            readOnly 
                            autoComplete="username" 
                        />
                        {/* Иногда добавление поля current-password помогает браузеру понять контекст смены пароля */}
                        <input 
                            type="password" 
                            name="current-password" 
                            autoComplete="current-password"
                            value="123123" // Временный пароль, можно оставить пустым
                            readOnly
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Новый пароль</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="new-password"
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                placeholder="Введите новый пароль"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Подтверждение</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                name="confirm-password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                placeholder="Повторите пароль"
                                required
                                autoComplete="new-password"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            'Сохранение...'
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Сохранить новый пароль
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
