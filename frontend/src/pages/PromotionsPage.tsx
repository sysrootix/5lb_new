import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar } from 'lucide-react';
import { getPromotions, Promotion } from '@/api/promotions';

export const PromotionsPage = () => {
    const navigate = useNavigate();
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromotions = async () => {
            try {
                const data = await getPromotions();
                setPromotions(data);
            } catch (error) {
                console.error('Failed to fetch promotions', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getPromotionStatus = (promo: Promotion) => {
        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        if (now < start) {
            return { status: 'upcoming', text: `С ${formatDate(promo.startDate)} по ${formatDate(promo.endDate)}` };
        } else if (now >= start && now <= end) {
            return { status: 'active', text: `До ${formatDate(promo.endDate)}` };
        } else {
            return { status: 'ended', text: 'Акция завершена' };
        }
    };

    return (
        <div className="min-h-screen pb-24 pt-6 px-4 sm:px-5 max-w-xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <h1 className="text-2xl font-bold text-white">Акции</h1>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {loading ? (
                    // Skeleton loading
                    [1, 2].map((i) => (
                        <div key={i} className="rounded-3xl bg-white/5 h-64 animate-pulse" />
                    ))
                ) : promotions.length > 0 ? (
                    promotions.map((promo) => {
                        const promoStatus = getPromotionStatus(promo);
                        return (
                            <motion.div
                                key={promo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer group"
                                onClick={() => navigate(promo.link)}
                            >
                                {/* Image */}
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src={promo.imageUrl}
                                        alt={promo.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] to-transparent opacity-60" />
                                </div>

                                {/* Info */}
                                <div className="p-5 relative z-10 -mt-12">
                                    <div className={`inline-flex items-center gap-2 backdrop-blur-md rounded-full px-3 py-1 mb-3 border ${
                                        promoStatus.status === 'upcoming'
                                            ? 'bg-blue-500/20 border-blue-400/30'
                                            : promoStatus.status === 'active'
                                            ? 'bg-black/50 border-white/10'
                                            : 'bg-gray-500/20 border-gray-400/30'
                                    }`}>
                                        <Calendar size={14} className={
                                            promoStatus.status === 'upcoming'
                                                ? 'text-blue-400'
                                                : promoStatus.status === 'active'
                                                ? 'text-[#FF6B00]'
                                                : 'text-gray-400'
                                        } />
                                        <span className="text-xs font-medium text-white/90">
                                            {promoStatus.text}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                                        {promo.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        {promo.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-400">Акций пока нет</p>
                    </div>
                )}
            </div>
        </div>
    );
};
