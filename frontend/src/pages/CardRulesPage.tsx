import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { getUserCards, BonusCardData } from '@/api/bonusApi';
import { PageLoader } from '@/components/PageLoader';
import { GlobalBackground } from '@/components/GlobalBackground';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';

export const CardRulesPage = () => {
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
                    <h1 className="text-2xl font-bold text-white">Правила вашей карты</h1>
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
                            Крутите колесо, получайте до 110% кэшбека и оплачивайте до 30% покупки бонусами.
                        </p>
                    </motion.div>

                    {/* Как накопить (кешбэк) */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">Как накопить (кешбэк)</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            После каждой покупки в приложении появляется Колесо Фортуны. Крутите его и выигрывайте кэшбек!
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Сколько: выпадает от 10% до 110% от суммы чека.
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    База: начисляем на сумму, оплаченную рублями (после всех скидок).
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Когда: бонусы приходят на следующий день после вращения колеса.
                                </span>
                            </li>
                        </ul>
                    </motion.section>

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

                    {/* Срок действия */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-2"
                    >
                        <h2 className="text-xl font-bold">Срок действия</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Ваши бонусы активны 6 месяцев с момента начисления. Не забывайте их тратить, иначе они сгорят.
                        </p>
                    </motion.section>

                    {/* День Рождения */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-3"
                    >
                        <h2 className="text-xl font-bold">День Рождения</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Мы любим праздники! За 7 дней до вашего ДР мы начислим секретный подарок.
                        </p>
                        <ul className="space-y-2.5">
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Он действует 15 дней (сгорает через 7 дней после Дня рождения).
                                </span>
                            </li>
                            <li className="flex gap-2.5 items-start">
                                <AlertCircle className="w-4 h-4 text-5lb-orange-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-white/90">
                                    Важно: укажите дату рождения в профиле.
                                </span>
                            </li>
                        </ul>
                    </motion.section>

                    {/* Товары-исключения */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 space-y-2"
                    >
                        <h2 className="text-xl font-bold">Товары-исключения</h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            В нашем каталоге есть товары, на которые нельзя списать бонусы (но кешбэк за них мы все равно начислим!). Список таких товаров можно найти в разделе «Информация».
                        </p>
                    </motion.section>
                </div>
            </motion.div>
        </div>
    );
};
