import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { GlobalBackground } from '@/components/GlobalBackground';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';

export const NotificationsPage = () => {
    useTelegramBackButton();

    return (
        <div className="min-h-screen relative pb-20">
            <GlobalBackground />

            {/* Header */}
            <div className="sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-white">Уведомления</h1>
                </div>
            </div>

            <motion.div
                className="max-w-7xl mx-auto px-4 py-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Empty State */}
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm mb-6 border border-white/10"
                    >
                        <Bell size={48} className="text-white/40" strokeWidth={1.5} />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl font-bold text-white mb-2"
                    >
                        Пока нет уведомлений
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/60 text-sm max-w-xs"
                    >
                        Здесь будут появляться важные уведомления о ваших заказах, бонусах и акциях
                    </motion.p>
                </div>
            </motion.div>
        </div>
    );
};
