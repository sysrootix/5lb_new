import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const FounderBanner = () => {
    const navigate = useNavigate();

    return (
        <motion.div
            className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-[#2A1205] via-[#FF6B00] to-[#FF8F40] p-5 shadow-lg cursor-pointer mb-8"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/founder-card')}
        >
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

            <div className="relative z-10 w-full">
                <div className="relative z-20 flex flex-col items-start max-w-[75%]">
                    <h3 className="text-xl sm:text-2xl font-black text-white uppercase leading-[0.9] mb-1">
                        30 000 БОНУСОВ
                    </h3>
                    <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-bold text-white/90 uppercase leading-none">
                            НА ВЕСЬ 2026
                        </p>
                        <div className="bg-white/20 rounded px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            5lb
                        </div>
                    </div>

                    <button
                        className="mt-3 w-max rounded-xl bg-white py-2 px-4 text-xs font-bold text-black shadow-lg shadow-black/10 transition hover:bg-gray-50 active:scale-95"
                    >
                        Как получить?
                    </button>
                </div>

                {/* Card Image */}
                <div className="absolute right-[-15%] top-1/2 -translate-y-1/2 w-44 sm:w-52 h-28 sm:h-36 z-10">
                    <img
                        src="/images/src/card_owner.png"
                        alt="Founder Card"
                        className="w-[110%] max-w-none h-auto object-contain rotate-[-12deg] drop-shadow-xl"
                    />
                </div>
            </div>
        </motion.div>
    );
};
