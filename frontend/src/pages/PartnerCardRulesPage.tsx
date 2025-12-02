import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { getUserCards, BonusCardData } from '@/api/bonusApi';
import { PageLoader } from '@/components/PageLoader';
import { GlobalBackground } from '@/components/GlobalBackground';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';

export const PartnerCardRulesPage = () => {
    const navigate = useNavigate();
    const { cardId } = useParams();
    const location = useLocation();
    const [card, setCard] = useState<BonusCardData | null>(location.state?.card || null);
    const [loading, setLoading] = useState(false);
    useTelegramBackButton();

    useEffect(() => {
        // Загружаем карту только если передан cardId
        if (cardId && !card) {
            setLoading(true);
            const fetchCard = async () => {
                try {
                    const cards = await getUserCards();
                    const found = cards.find(c => c.id === cardId);
                    if (found) {
                        setCard(found);
                    }
                } catch (error) {
                    console.error('Failed to fetch card:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchCard();
        }
    }, [card, cardId]);

    if (loading) return <PageLoader />;

    return (
        <div className="min-h-screen relative pb-20">
            <GlobalBackground />

            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-white">Ваша партнерская программа</h1>
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
                            Зарабатывайте 10% с покупок клиентов и оплачивайте до 90% своих заказов.
                        </p>
                    </motion.div>

                    {/* Как это работает */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">Как это работает</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Вы рекомендуете нас — мы платим вам за каждую покупку вашего клиента. Ваша карта позволяет накапливать специальные партнерские бонусы.
                        </p>
                    </motion.section>

                    {/* Ваш доход (начисление) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">Ваш доход (начисление)</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Мы начисляем вам 10% от суммы, которую фактически оплатили ваши клиенты (за вычетом скидок).
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Сроки: вы получаете процент не только с первой, но и со всех последующих покупок клиента в течение 1 года.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Когда: бонусы начисляются сразу после покупки.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Отчет: уведомление и детализация приходят 1 раз в месяц (до 5-го числа).
                                </span>
                            </li>
                        </ul>
                    </motion.section>

                    {/* Как тратить (супер-списание) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">Как тратить (супер-списание)</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Ваши партнерские бонусы ценнее обычных!
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Скидка до 90%: оплачивайте ими почти полную стоимость своих личных покупок.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Когда: бонусы начисляются сразу после покупки.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Исключения: есть небольшой список товаров, на которые списание не действует (см. раздел «Информация»).
                                </span>
                            </li>
                        </ul>
                    </motion.section>

                    {/* Что получают ваши клиенты */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-2"
                    >
                        <h2 className="text-xl font-bold">Что получают ваши клиенты?</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Дарите выгоду, чтобы привлекать больше людей! Поделитесь ссылкой и клиент сразу получит доступ к колесу фортуны — это шанс выиграть кешбэк до 110% на первую покупку.
                        </p>
                    </motion.section>

                    {/* Дополнительные возможности */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">Дополнительные возможности (реферальная программа)</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Бонусы за простые приглашения (без покупок). Начисляются на вашу базовую карту.
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    За что: друг просто зарегистрировался по вашей ссылке.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Сколько: 50 бонусов за каждого (+250 бонусов за каждые 10 друзей).
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Как тратить: стандартное списание до 30% от чека.
                                </span>
                            </li>
                        </ul>
                    </motion.section>
                </div>
            </motion.div>
        </div>
    );
};
