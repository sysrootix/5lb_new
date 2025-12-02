import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';

export const StartBonusesBlock = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/roulette')}
            className="relative overflow-hidden rounded-3xl cursor-pointer group mb-6"
        >
            {/* Glassmorphism background */}
            <div className="absolute inset-0 bg-white/5 border border-white/10 backdrop-blur-md" />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-5lb-orange-500/20 via-transparent to-5lb-red-500/20 opacity-60" />

            {/* Animated gradient orbs */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-5lb-orange-500/30 to-5lb-red-500/30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-gradient-to-tr from-5lb-red-500/20 to-5lb-orange-500/20 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />

            <div className="relative p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    {/* Icon and text */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                            {/* Icon container with gradient */}
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-5lb-orange-500 to-5lb-red-500 flex items-center justify-center shadow-lg shadow-5lb-orange-500/30 group-hover:shadow-5lb-orange-500/50 transition-shadow">
                                <Gift className="text-white" size={26} strokeWidth={2} />
                            </div>
                            {/* Sparkle indicator */}
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-5lb-orange-500 rounded-full flex items-center justify-center animate-pulse">
                                <Sparkles className="text-white" size={12} strokeWidth={3} />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg sm:text-xl font-black text-white leading-tight mb-0.5 uppercase tracking-wide">
                                Бонусная рулетка
                            </h3>
                            <p className="text-white/70 text-sm font-medium">
                                Испытай удачу и получи стартовый бонус!
                            </p>
                        </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-5lb-orange-500 to-5lb-red-500 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:translate-x-0.5 transition-all">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
