import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { useAuthStore } from '../store/auth';
import { Plus, Trash2, Copy, Download, Check, X, Link as LinkIcon, FileText, ClipboardCopy } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { FoundersLink, User } from '../types';
import clsx from 'clsx';
import UserEditModal from '../components/UserEditModal';

export default function FoundersLinks() {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const { showNotification } = useNotification();
    
    // State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'single' | 'bulk'>('single');
    const [bulkCount, setBulkCount] = useState(10);
    const [singleCode, setSingleCode] = useState('');
    const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    // Result Modal State
    const [createdLinks, setCreatedLinks] = useState<string[]>([]);
    const [showResultModal, setShowResultModal] = useState(false);

    // User Edit Modal State
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Fetch Links
    const { data, isLoading } = useQuery({
        queryKey: ['founders-links', page, filterUsed, search],
        queryFn: async () => {
            const params: any = { page, limit: 50 };
            if (filterUsed !== 'all') params.isUsed = filterUsed === 'used';
            if (search) params.search = search;
            
            const res = await api.get('/crm-api/founders-links', {
                params
            });
            return res.data;
        },
        enabled: !!token,
    });

    // Mutations
    const createSingleMutation = useMutation({
        mutationFn: async (code: string) => {
            const res = await api.post('/crm-api/founders-links', { code }, {
            });
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['founders-links'] });
            setIsModalOpen(false);
            setSingleCode('');
            setCreatedLinks([data.code]);
            setShowResultModal(true);
            showNotification('success', 'Ссылка создана', 'Новая ссылка успешно добавлена');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось создать ссылку')
    });

    const createBulkMutation = useMutation({
        mutationFn: async (count: number) => {
            const res = await api.post('/crm-api/founders-links/bulk', { count }, {
            });
            return res.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['founders-links'] });
            setIsModalOpen(false);
            if (data.codes && Array.isArray(data.codes)) {
                setCreatedLinks(data.codes);
                setShowResultModal(true);
            }
            showNotification('success', 'Ссылки созданы', 'Генерация завершена успешно');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось сгенерировать ссылки')
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/crm-api/founders-links/${id}`, {
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['founders-links'] });
            showNotification('success', 'Удалено', 'Ссылка успешно удалена');
        },
        onError: () => showNotification('error', 'Ошибка', 'Не удалось удалить ссылку')
    });

    // User Update Mutation (copied from Users.tsx logic)
    const updateUserMutation = useMutation({
        mutationFn: async (data: { id: string; updates: Partial<User> }) => {
            const res = await api.put(`/crm-api/users/${data.id}`, data.updates, {
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['founders-links'] });
            setEditingUser(null);
            showNotification('success', 'Пользователь обновлен', 'Данные пользователя успешно сохранены');
        },
        onError: () => {
            showNotification('error', 'Ошибка', 'Не удалось обновить данные пользователя');
        }
    });

    const LINK_PREFIX = 'https://t.me/pro_5lb_bot?start=founder_';

    // Handlers
    const handleCopy = (code: string) => {
        const fullLink = `${LINK_PREFIX}${code}`;
        navigator.clipboard.writeText(fullLink);
        showNotification('success', 'Скопировано', 'Ссылка скопирована в буфер обмена');
    };
    
    const handleCopyAll = () => {
        const text = createdLinks.map(code => `${LINK_PREFIX}${code}`).join('\n');
        navigator.clipboard.writeText(text);
        showNotification('success', 'Скопировано', 'Все ссылки скопированы в буфер обмена');
    };

    const handleDelete = (id: string) => {
        if (confirm('Вы уверены? Это действие нельзя отменить.')) {
            deleteMutation.mutate(id);
        }
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/crm-api/founders-links/export', {
            });
            
            const csvContent = [
                ['Code', 'Status', 'Used At', 'User Phone'],
                ...res.data.map((link: any) => [
                    link.code,
                    link.isUsed ? 'Used' : 'Unused',
                    link.usedAt || '',
                    link.user?.phone || ''
                ])
            ].map(e => e.join(',')).join('\n');

            downloadFile(csvContent, `founders_links_export_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        } catch (e) {
            showNotification('error', 'Ошибка', 'Не удалось экспортировать данные');
        }
    };

    const handleDownloadTxt = () => {
        const content = createdLinks.map(code => `${LINK_PREFIX}${code}`).join('\n');
        downloadFile(content, `founders_links_generated_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain');
    };

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type: `${type};charset=utf-8;` });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleCreateSubmit = () => {
        if (modalMode === 'single') {
            createSingleMutation.mutate(singleCode);
        } else {
            createBulkMutation.mutate(bulkCount);
        }
    };
    
    const handleUserClick = (user: any) => {
        // Need to ensure the object matches User type or partial
        setEditingUser(user as User);
    };

    const handleSaveUser = (id: string, updates: Partial<User>) => {
        updateUserMutation.mutate({ id, updates });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <LinkIcon className="w-6 h-6 text-primary" />
                        Ссылки фаундеров
                    </h1>
                    <p className="text-gray-400 mt-1">Управление пригласительными ссылками</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="bg-white/5 hover:bg-white/10 text-white font-medium py-2 px-4 rounded-xl flex items-center gap-2 transition-colors border border-white/10"
                    >
                        <Download className="w-5 h-5" />
                        Экспорт
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Создать ссылки
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <input
                        type="text"
                        placeholder="Поиск по коду..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-[#180C06] border border-white/10 rounded-xl py-2 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>
                <div className="flex bg-[#180C06] p-1 rounded-xl border border-white/10">
                    {(['all', 'used', 'unused'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterUsed(f)}
                            className={clsx(
                                'px-4 py-1.5 rounded-lg text-sm font-medium transition-all',
                                filterUsed === f 
                                    ? 'bg-white/10 text-white shadow-sm' 
                                    : 'text-gray-400 hover:text-white'
                            )}
                        >
                            {f === 'all' ? 'Все' : f === 'used' ? 'Использованные' : 'Свободные'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[#180C06] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Код</th>
                                <th className="px-6 py-4">Статус</th>
                                <th className="px-6 py-4">Кем использован</th>
                                <th className="px-6 py-4">Дата использования</th>
                                <th className="px-6 py-4">Создан</th>
                                <th className="px-6 py-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Загрузка...
                                    </td>
                                </tr>
                            ) : data?.items?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Список пуст
                                    </td>
                                </tr>
                            ) : (
                                data?.items?.map((link: FoundersLink) => (
                                    <tr key={link.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-white font-medium bg-white/5 px-2 py-1 rounded">
                                                    {link.code}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(link.code)}
                                                    className="p-1 text-gray-500 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Копировать"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx(
                                                "px-2.5 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1",
                                                link.isUsed 
                                                    ? "bg-red-500/10 text-red-500" 
                                                    : "bg-green-500/10 text-green-500"
                                            )}>
                                                {link.isUsed ? (
                                                    <>
                                                        <Check className="w-3 h-3" /> Использован
                                                    </>
                                                ) : 'Свободен'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {link.user ? (
                                                <div 
                                                    className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                                                    onClick={() => handleUserClick(link.user)}
                                                >
                                                    <span className="text-white text-sm font-medium underline decoration-white/30 hover:decoration-primary">
                                                        {link.user.phone}
                                                    </span>
                                                    {link.user.firstName && (
                                                        <span className="text-xs text-gray-500">
                                                            {link.user.firstName} {link.user.lastName}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {link.usedAt ? new Date(link.usedAt).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(link.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(link.id)}
                                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                                title="Удалить"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {data?.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 p-4 border-t border-white/5">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Назад
                        </button>
                        <span className="text-gray-400 text-sm">
                            Страница {page} из {data.totalPages}
                        </span>
                        <button
                            disabled={page === data.totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Вперед
                        </button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {isModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div 
                        className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Создание ссылок</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setModalMode('single')}
                                className={clsx(
                                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                                    modalMode === 'single' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Одна ссылка
                            </button>
                            <button
                                onClick={() => setModalMode('bulk')}
                                className={clsx(
                                    "flex-1 py-2 rounded-lg text-sm font-bold transition-all",
                                    modalMode === 'bulk' ? "bg-primary text-white shadow-lg" : "text-gray-400 hover:text-white"
                                )}
                            >
                                Массовая генерация
                            </button>
                        </div>

                        <div className="space-y-4">
                            {modalMode === 'single' ? (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Кастомный код (опционально)
                                    </label>
                                    <input
                                        type="text"
                                        value={singleCode}
                                        onChange={(e) => setSingleCode(e.target.value)}
                                        placeholder="Оставьте пустым для авто-генерации"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                        Количество ссылок
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="1000"
                                        value={bulkCount}
                                        onChange={(e) => setBulkCount(parseInt(e.target.value) || 0)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Будет сгенерировано {bulkCount} уникальных ссылок
                                    </p>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    onClick={handleCreateSubmit}
                                    disabled={createSingleMutation.isPending || createBulkMutation.isPending}
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    {modalMode === 'single' ? 'Создать ссылку' : `Сгенерировать ${bulkCount} шт.`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showResultModal && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setShowResultModal(false)}
                >
                    <div 
                        className="bg-[#180C06] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Check className="w-6 h-6 text-green-500" />
                                Ссылки успешно созданы
                            </h2>
                            <button
                                onClick={() => setShowResultModal(false)}
                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-white/5 rounded-xl p-4 mb-6 max-h-[300px] overflow-y-auto">
                            <div className="flex flex-col gap-2">
                                {createdLinks.map((code, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded-lg">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-mono text-white font-bold text-sm truncate">
                                                ...{code}
                                            </span>
                                            <span className="text-xs text-gray-500 truncate">
                                                {LINK_PREFIX}{code}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(code)}
                                            className="p-1.5 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors shrink-0 ml-2"
                                            title="Копировать ссылку"
                                        >
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCopyAll}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <ClipboardCopy className="w-4 h-4" />
                                Скопировать все
                            </button>
                            <button
                                onClick={handleDownloadTxt}
                                className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                <FileText className="w-4 h-4" />
                                Скачать TXT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Edit Modal */}
            <UserEditModal
                user={editingUser}
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                onSave={handleSaveUser}
                isSaving={updateUserMutation.isPending}
            />
        </div>
    );
}
