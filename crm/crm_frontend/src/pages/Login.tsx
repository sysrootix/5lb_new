import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import axios from 'axios';
import { Lock, User, ArrowRight } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('/crm-api/auth/login', {
                username,
                password,
            });

            // Сохраняем токен, refresh token и данные пользователя в store
            // zustand с middleware persist сохранит это в localStorage
            setAuth(res.data.token, res.data.admin, res.data.refreshToken);

            // Небольшая задержка перед навигацией, чтобы стейт успел обновиться
            setTimeout(() => {
                navigate('/');
            }, 100);
        } catch (err) {
            setError('Неверные учетные данные');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0F0501] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-6 shadow-[0_0_40px_rgba(255,107,0,0.3)]">
                        <span className="text-2xl font-bold text-white">5LB</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Добро пожаловать</h1>
                    <p className="text-gray-400">Войдите в систему управления CRM</p>
                </div>

                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Логин</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <div className="relative flex items-center bg-black/20 border border-white/10 rounded-xl focus-within:border-primary/50 transition-colors">
                                    <div className="pl-4 text-gray-400">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-transparent py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none"
                                        placeholder="username"
                                        required
                                        autoComplete="username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Пароль</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                                <div className="relative flex items-center bg-black/20 border border-white/10 rounded-xl focus-within:border-primary/50 transition-colors">
                                    <div className="pl-4 text-gray-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none"
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(255,107,0,0.3)] hover:shadow-[0_0_30px_rgba(255,107,0,0.5)] transform hover:scale-[1.01] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            <div className="relative flex items-center justify-center gap-2">
                                <span>{loading ? 'Вход...' : 'Войти в систему'}</span>
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                            </div>
                        </button>
                    </form>
                </div>
                
                <p className="text-center text-gray-600 text-xs mt-8">
                    &copy; {new Date().getFullYear()} 5LB CRM System. All rights reserved.
                </p>
            </div>
        </div>
    );
}
