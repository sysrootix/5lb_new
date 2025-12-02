import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

interface Promotion {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    startDate: string;
    endDate: string;
    link: string;
    showBeforeStart?: boolean;
}

export default function Promotions() {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState<Partial<Promotion>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: promotions, isLoading } = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const res = await api.get('/crm-api/promotions', {
            });
            return res.data;
        },
        enabled: !!token,
    });

    const createMutation = useMutation({
        mutationFn: async (data: FormData) => {
            await api.post('/crm-api/promotions', data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            closeModal();
            showNotification('success', 'Акция создана', 'Новая акция успешно добавлена');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось создать акцию'),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
            await api.put(`/crm-api/promotions/${id}`, data, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            closeModal();
            showNotification('success', 'Акция обновлена', 'Данные акции успешно сохранены');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось обновить акцию'),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/crm-api/promotions/${id}`, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['promotions'] });
            showNotification('success', 'Акция удалена', 'Акция была успешно удалена');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось удалить акцию'),
    });

    const handleEdit = (promotion: Promotion) => {
        setEditingId(promotion.id);
        setFormData({
            ...promotion,
            startDate: new Date(promotion.startDate).toISOString().split('T')[0],
            endDate: new Date(promotion.endDate).toISOString().split('T')[0],
        });
        setSelectedFile(null);
    };

    const handleCreate = () => {
        setIsCreating(true);
        setFormData({
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +1 week default
        });
        setSelectedFile(null);
    };

    const closeModal = () => {
        setEditingId(null);
        setIsCreating(false);
        setFormData({});
        setSelectedFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSave = () => {
        if (!formData.title || !formData.description || !formData.startDate || !formData.endDate || !formData.link) {
            showNotification('error', 'Ошибка валидации', 'Заполните все обязательные поля');
            return;
        }

        if (isCreating && !selectedFile) {
            showNotification('error', 'Ошибка валидации', 'Выберите изображение для акции');
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('startDate', formData.startDate!);
        data.append('endDate', formData.endDate!);
        data.append('link', formData.link);
        data.append('showBeforeStart', String(formData.showBeforeStart || false));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены, что хотите удалить эту акцию?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Акции</h1>
                    <p className="text-gray-400 mt-1">Управление рекламными акциями и баннерами</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Добавить акцию
                </button>
            </div>

            <div className="bg-[#180C06] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Изображение</th>
                                <th className="px-6 py-4">Заголовок</th>
                                <th className="px-6 py-4">Даты проведения</th>
                                <th className="px-6 py-4">Ссылка</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {promotions?.map((promotion: Promotion) => (
                                <tr key={promotion.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                            <img 
                                                src={promotion.imageUrl} 
                                                alt={promotion.title} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{promotion.title}</div>
                                        <div className="text-sm text-gray-500 truncate max-w-xs">{promotion.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-sm">
                                            <span className="text-green-500">С: {new Date(promotion.startDate).toLocaleDateString()}</span>
                                            <span className="text-red-500">По: {new Date(promotion.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <a 
                                            href={promotion.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline text-sm flex items-center gap-1"
                                        >
                                            <LinkIcon className="w-3 h-3" />
                                            Ссылка
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => handleEdit(promotion)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promotion.id)}
                                            className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {promotions?.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Нет активных акций
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(editingId || isCreating) && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={closeModal}
                >
                    <div 
                        className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">
                                {isCreating ? 'Новая акция' : 'Редактирование акции'}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Заголовок</label>
                                <input
                                    type="text"
                                    value={formData.title || ''}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Название акции"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Описание</label>
                                <textarea
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Подробное описание акции..."
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Дата начала</label>
                                    <input
                                        type="date"
                                        value={formData.startDate || ''}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Дата окончания</label>
                                    <input
                                        type="date"
                                        value={formData.endDate || ''}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all [color-scheme:dark]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ссылка</label>
                                <input
                                    type="text"
                                    value={formData.link || ''}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Изображение</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/5 transition-all group"
                                >
                                    {selectedFile ? (
                                        <div className="text-center">
                                            <ImageIcon className="w-8 h-8 text-primary mx-auto mb-2" />
                                            <p className="text-sm text-white font-medium">{selectedFile.name}</p>
                                            <p className="text-xs text-gray-500">Нажмите, чтобы выбрать другое</p>
                                        </div>
                                    ) : formData.imageUrl && !isCreating ? (
                                         <div className="text-center">
                                            <img src={formData.imageUrl} alt="Preview" className="h-20 object-contain mx-auto mb-2 rounded" />
                                            <p className="text-xs text-gray-500">Нажмите, чтобы заменить</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="w-8 h-8 text-gray-500 group-hover:text-primary mx-auto mb-2 transition-colors" />
                                            <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Нажмите для загрузки</p>
                                            <p className="text-xs text-gray-600">PNG, JPG до 5MB</p>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.showBeforeStart || false}
                                        onChange={(e) => setFormData({ ...formData, showBeforeStart: e.target.checked })}
                                        className="w-5 h-5 bg-white/5 border border-white/10 rounded cursor-pointer accent-primary"
                                    />
                                    <div>
                                        <span className="text-sm font-medium text-white">Показывать до начала</span>
                                        <p className="text-xs text-gray-500">Акция будет видна пользователям до даты начала</p>
                                    </div>
                                </label>
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
                                onClick={closeModal}
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

