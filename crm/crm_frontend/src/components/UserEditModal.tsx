import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { User } from '../types';

interface UserEditModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<User>) => void;
    isSaving?: boolean;
}

export default function UserEditModal({ user, isOpen, onClose, onSave, isSaving = false }: UserEditModalProps) {
    const [formData, setFormData] = useState<Partial<User>>({});

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                email: user.email,
                phone: user.phone,
                bonusBalance: user.bonusBalance,
                gender: user.gender,
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : undefined,
                referralCode: user.referralCode,
                referredById: user.referredById,
                emailNotifications: user.emailNotifications,
                smsNotifications: user.smsNotifications,
                telegramNotifications: user.telegramNotifications,
                pushNotifications: user.pushNotifications,
            });
        }
    }, [user]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleSave = () => {
        if (user) {
            onSave(user.id, formData);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Редактирование пользователя</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Фамилия</label>
                            <input
                                type="text"
                                value={formData.lastName || ''}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Имя</label>
                            <input
                                type="text"
                                value={formData.firstName || ''}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Отчество</label>
                            <input
                                type="text"
                                value={formData.middleName || ''}
                                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Пол</label>
                            <select
                                value={formData.gender || ''}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            >
                                <option value="" className="bg-[#180C06]">Не указан</option>
                                <option value="MALE" className="bg-[#180C06]">Мужской</option>
                                <option value="FEMALE" className="bg-[#180C06]">Женский</option>
                                <option value="OTHER" className="bg-[#180C06]">Другой</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Телефон</label>
                            <input
                                type="text"
                                value={formData.phone || ''}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Дата рождения</label>
                            <input
                                type="date"
                                value={formData.dateOfBirth || ''}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Баланс бонусов</label>
                            <input
                                type="number"
                                value={formData.bonusBalance || 0}
                                onChange={(e) => setFormData({ ...formData, bonusBalance: parseInt(e.target.value) })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Реферальный код</label>
                            <input
                                type="text"
                                value={formData.referralCode || ''}
                                onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">ID пригласившего</label>
                            <input
                                type="text"
                                value={formData.referredById || ''}
                                onChange={(e) => setFormData({ ...formData, referredById: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-white/10">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Уведомления</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.emailNotifications ?? true}
                                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-white">Email</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.smsNotifications ?? true}
                                    onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-white">SMS</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.telegramNotifications ?? true}
                                    onChange={(e) => setFormData({ ...formData, telegramNotifications: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-white">Telegram</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.pushNotifications ?? true}
                                    onChange={(e) => setFormData({ ...formData, pushNotifications: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-white">Push</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-colors border border-white/5"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}

