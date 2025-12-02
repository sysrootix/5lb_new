import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import api from '../utils/axios';
import { Lock, Save, Shield } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
    const user = useAuthStore((state) => state.user);
    const { showNotification } = useNotification();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            showNotification('error', 'Ошибка валидации', 'Пароль должен быть не менее 6 символов');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('error', 'Ошибка валидации', 'Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            await api.post(
                '/crm-api/auth/change-password',
                { newPassword },
                
            );
            
            showNotification('success', 'Пароль изменен', 'Ваш пароль был успешно обновлен');
            setNewPassword('');
            setConfirmPassword('');
            
        } catch (err) {
            console.error(err);
            showNotification('error', 'Ошибка', 'Не удалось изменить пароль. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Настройки</h1>
            
            <div className="bg-[#180C06] border border-white/5 rounded-2xl p-6 max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Безопасность</h2>
                        <p className="text-gray-400 text-sm">Смена пароля для входа в административную панель</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Имя пользователя</label>
                        <input
                            type="text"
                            value={user?.username || ''}
                            disabled
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-400 cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Новый пароль</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                placeholder="Введите новый пароль"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Подтверждение</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                                placeholder="Повторите пароль"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Сохранение...' : (
                            <>
                                <Save className="w-5 h-5" />
                                Сохранить пароль
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}


