import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { getUserCards, BonusCardData } from '@/api/bonusApi';
import { PageLoader } from '@/components/PageLoader';
import { GlobalBackground } from '@/components/GlobalBackground';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';

export const FounderCardRulesPage = () => {
    const navigate = useNavigate();
    const { cardId } = useParams();
    const location = useLocation();
    const [card, setCard] = useState<BonusCardData | null>(location.state?.card || null);
    const [loading, setLoading] = useState(!card);
    useTelegramBackButton();

    useEffect(() => {
        if (!card && cardId) {
            const fetchCard = async () => {
                try {
                    const cards = await getUserCards();
                    const found = cards.find(c => c.id === cardId);
                    if (found) {
                        setCard(found);
                    } else {
                        navigate('/profile');
                    }
                } catch (error) {
                    console.error('Failed to fetch card:', error);
                    navigate('/profile');
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }
    }, [card, cardId, navigate]);

    if (loading) return <PageLoader />;
    if (!card) return null;

    return (
        <div className="min-h-screen relative pb-20">
            <GlobalBackground />

            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-white">Карта основателя</h1>
                </div>
            </div>

            <motion.div
                className="max-w-7xl mx-auto px-4 py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Content */}
                <div className="space-y-6 text-white">
                    {/* Intro */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                    >
                        <p className="text-white/90 text-sm leading-relaxed">
                            Это эксклюзивная карта для тех, кто с нами с самого начала. Мы уже пополнили её баланс, чтобы путь к достижению ваших целей в 2026 году был максимально выгодным.
                        </p>
                    </motion.div>

                    {/* Main Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                    >
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Баланс карты: 30 000 бонусов. Вам не нужно копить — бонусы уже доступны для использования.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Срок действия: весь 2026 год. Бонусы активны строго в период с 01.01.2026 по 31.12.2026. Обратите внимание: неиспользованный остаток бонусов после 31.12.2026 аннулируется.
                                </span>
                            </li>
                        </ul>
                    </motion.div>

                    {/* Как использовать бонусы (списание) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">Как использовать бонусы (списание)</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Используйте бонусы для скидки на следующие покупки.
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Курс: 1 бонус = 1 рубль.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Скидка: можно оплатить бонусами до 30% от суммы чека.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Минимум: списать можно от 1 бонуса.
                                </span>
                            </li>
                        </ul>
                    </motion.section>

                    {/* Товары-исключения */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-2"
                    >
                        <h2 className="text-xl font-bold">Товары-исключения</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            В нашем каталоге есть товары, на которые нельзя списать бонусы. Список таких товаров можно найти в разделе «Информация».
                        </p>
                    </motion.section>
                </div>
            </motion.div>
        </div>
    );
};
