import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

export const AuthBlock = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border border-white/20 relative overflow-hidden shadow-2xl"
        >
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6B00] opacity-20 blur-[60px] rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#FF6B00] opacity-10 blur-[40px] rounded-full" />

            <div className="relative z-10 flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-2xl flex items-center justify-center shadow-lg">
                    <Gift size={28} className="text-white" strokeWidth={2.5} />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-xl font-black text-white mb-2 leading-tight">
                        КОПИТЕ БОНУСЫ
                    </h3>
                    <p className="text-sm text-gray-300 mb-5 leading-relaxed">
                        Зарегистрируйтесь, чтобы копить и тратить бонусы
                    </p>

                    <Link to="/login" className="block">
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 8px 30px rgba(255, 107, 0, 0.5)' }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#FF6B00]/30 transition-all"
                        >
                            Зарегистрироваться
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
