import { useState, useEffect } from 'react';
import { X, CreditCard, Plus, DollarSign, Ban, Check } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { useNotification } from '../context/NotificationContext';

interface UserCardsModalProps {
    userId: string | null;
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}

interface BonusCard {
    id: string;
    code: string;
    name: string;
    description?: string;
    imageUrl?: string;
    isActive: boolean;
}

interface UserBonusCard {
    id: string;
    userId: string;
    cardId: string;
    balance: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    card: BonusCard;
}

export default function UserCardsModal({ userId, userName, isOpen, onClose }: UserCardsModalProps) {
    const token = useAuthStore((state) => state.token);
    const { showNotification } = useNotification();
    const [showAddCard, setShowAddCard] = useState(false);
    const [selectedCardCode, setSelectedCardCode] = useState('');
    const [initialBalance, setInitialBalance] = useState(0);
    const [balanceAmount, setBalanceAmount] = useState(0);
    const [balanceDescription, setBalanceDescription] = useState('');
    const [editingCardId, setEditingCardId] = useState<string | null>(null);

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

    // Получить типы карт
    const { data: cardTypes } = useQuery({
        queryKey: ['card-types'],
        queryFn: async () => {
            const res = await api.get('/crm-api/cards/types', {
            });
            return res.data as BonusCard[];
        },
        enabled: !!token,
    });

    // Получить карты пользователя
    const { data: userCards, refetch } = useQuery({
        queryKey: ['user-cards', userId],
        queryFn: async () => {
            if (!userId) return [];
            const res = await api.get(`/crm-api/cards/user/${userId}`, {
            });
            return res.data as UserBonusCard[];
        },
        enabled: !!token && !!userId && isOpen,
    });

    // Выдать карту
    const assignCardMutation = useMutation({
        mutationFn: async (data: { cardCode: string; initialBalance: number }) => {
            const res = await api.post(`/crm-api/cards/user/${userId}/assign`, data, {
            });
            return res.data;
        },
        onSuccess: () => {
            refetch();
            setShowAddCard(false);
            setSelectedCardCode('');
            setInitialBalance(0);
            showNotification('success', 'Карта выдана', 'Карта успешно выдана пользователю');
        },
        onError: (error: any) => {
            showNotification('error', 'Ошибка', error.response?.data?.message || 'Не удалось выдать карту');
        },
    });

    // Изменить баланс
    const updateBalanceMutation = useMutation({
        mutationFn: async (data: { userCardId: string; amount: number; description: string }) => {
            const res = await api.patch(`/crm-api/cards/${data.userCardId}/balance`, {
                amount: data.amount,
                description: data.description,
            }, {
            });
            return res.data;
        },
        onSuccess: () => {
            refetch();
            setEditingCardId(null);
            setBalanceAmount(0);
            setBalanceDescription('');
            showNotification('success', 'Баланс обновлен', 'Баланс карты успешно изменен');
        },
        onError: (error: any) => {
            showNotification('error', 'Ошибка', error.response?.data?.message || 'Не удалось изменить баланс');
        },
    });

    // Отозвать карту
    const revokeCardMutation = useMutation({
        mutationFn: async (userCardId: string) => {
            const res = await api.post(`/crm-api/cards/${userCardId}/revoke`, {}, {
            });
            return res.data;
        },
        onSuccess: () => {
            refetch();
            showNotification('success', 'Карта отозвана', 'Карта успешно деактивирована');
        },
        onError: () => {
            showNotification('error', 'Ошибка', 'Не удалось отозвать карту');
        },
    });

    // Активировать карту
    const activateCardMutation = useMutation({
        mutationFn: async (userCardId: string) => {
            const res = await api.post(`/crm-api/cards/${userCardId}/activate`, {}, {
            });
            return res.data;
        },
        onSuccess: () => {
            refetch();
            showNotification('success', 'Карта активирована', 'Карта успешно активирована');
        },
        onError: () => {
            showNotification('error', 'Ошибка', 'Не удалось активировать карту');
        },
    });

    const handleAssignCard = () => {
        if (!selectedCardCode) {
            showNotification('error', 'Ошибка', 'Выберите тип карты');
            return;
        }
        assignCardMutation.mutate({ cardCode: selectedCardCode, initialBalance });
    };

    const handleUpdateBalance = (userCardId: string) => {
        if (balanceAmount === 0) {
            showNotification('error', 'Ошибка', 'Введите сумму');
            return;
        }
        updateBalanceMutation.mutate({ userCardId, amount: balanceAmount, description: balanceDescription });
    };

    if (!isOpen || !userId) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">Управление картами</h2>
                        <p className="text-sm text-gray-400 mt-1">{userName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Список карт пользователя */}
                <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Карты пользователя</h3>
                        <button
                            onClick={() => setShowAddCard(!showAddCard)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl transition-colors text-sm font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Выдать карту
                        </button>
                    </div>

                    {/* Форма выдачи карты */}
                    {showAddCard && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Тип карты
                                </label>
                                <select
                                    value={selectedCardCode}
                                    onChange={(e) => setSelectedCardCode(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                >
                                    <option value="">Выберите карту</option>
                                    {cardTypes?.map((card) => (
                                        <option key={card.id} value={card.code}>
                                            {card.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Начальный баланс
                                </label>
                                <input
                                    type="number"
                                    value={initialBalance}
                                    onChange={(e) => setInitialBalance(parseInt(e.target.value) || 0)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="0"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAssignCard}
                                    disabled={assignCardMutation.isPending}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {assignCardMutation.isPending ? 'Выдача...' : 'Выдать'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddCard(false);
                                        setSelectedCardCode('');
                                        setInitialBalance(0);
                                    }}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 px-4 rounded-xl transition-colors"
                                >
                                    Отмена
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Карточки */}
                    <div className="space-y-3">
                        {userCards?.map((userCard) => (
                            <div key={userCard.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                                            <CreditCard className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-white">{userCard.card.name}</h4>
                                            <p className="text-xs text-gray-400">{userCard.card.code}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            userCard.isActive
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                        }`}>
                                            {userCard.isActive ? 'Активна' : 'Неактивна'}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-400">Баланс:</span>
                                    <span className="text-2xl font-bold text-primary">{userCard.balance} ₽</span>
                                </div>

                                {/* Форма изменения баланса */}
                                {editingCardId === userCard.id ? (
                                    <div className="space-y-3 pt-3 border-t border-white/10">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                Сумма (+ пополнить / - списать)
                                            </label>
                                            <input
                                                type="number"
                                                value={balanceAmount}
                                                onChange={(e) => setBalanceAmount(parseInt(e.target.value) || 0)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                placeholder="Например: 100 или -50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                                Комментарий
                                            </label>
                                            <input
                                                type="text"
                                                value={balanceDescription}
                                                onChange={(e) => setBalanceDescription(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                                                placeholder="Опционально"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleUpdateBalance(userCard.id)}
                                                disabled={updateBalanceMutation.isPending}
                                                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2 px-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
                                            >
                                                {updateBalanceMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingCardId(null);
                                                    setBalanceAmount(0);
                                                    setBalanceDescription('');
                                                }}
                                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 px-3 rounded-xl transition-colors text-sm"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingCardId(userCard.id)}
                                            className="flex-1 flex items-center justify-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary py-2 px-3 rounded-xl transition-colors text-sm"
                                        >
                                            <DollarSign className="w-4 h-4" />
                                            Изменить баланс
                                        </button>
                                        {userCard.isActive ? (
                                            <button
                                                onClick={() => revokeCardMutation.mutate(userCard.id)}
                                                disabled={revokeCardMutation.isPending}
                                                className="flex-1 flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 px-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                                            >
                                                <Ban className="w-4 h-4" />
                                                Отозвать
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => activateCardMutation.mutate(userCard.id)}
                                                disabled={activateCardMutation.isPending}
                                                className="flex-1 flex items-center justify-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-3 rounded-xl transition-colors text-sm disabled:opacity-50"
                                            >
                                                <Check className="w-4 h-4" />
                                                Активировать
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {userCards?.length === 0 && (
                            <div className="text-center py-12 text-gray-400">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>У пользователя нет карт</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
