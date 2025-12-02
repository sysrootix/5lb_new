import { motion } from 'framer-motion';
import { QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePromoTimer } from '../PromoTimer';

export const FounderCard = () => {
  const navigate = useNavigate();
  const timeLeft = usePromoTimer();

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-0 shadow-lg h-48 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/founder-card')}
    >
      {/* Background Glow */}
      <div className="absolute right-0 top-0 h-full w-2/3 bg-gradient-to-l from-[#FF6B00]/40 to-transparent blur-2xl" />
      
      {/* Watermark Logo Background */}
      <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-10 pointer-events-none mix-blend-overlay scale-125 z-0">
        <svg width="100" height="100" viewBox="0 0 116 125" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path opacity="1" d="M76.9807 -3C97.4009 -3 116.986 5.11145 131.426 19.5498C145.866 33.9881 153.979 53.5711 153.982 73.9912L153.989 75.418C153.718 90.1485 149.226 104.504 141.031 116.771C132.573 129.435 120.548 139.306 106.48 145.136C92.4111 150.966 76.9292 152.494 61.9924 149.525C47.0557 146.557 33.3342 139.226 22.5637 128.46C11.7932 117.694 4.45679 103.975 1.48267 89.0391C-1.49144 74.1034 0.030034 58.6208 5.85474 44.5498C11.6795 30.479 21.546 18.451 34.2063 9.9873C46.8665 1.52373 61.7521 -2.99601 76.9807 -3ZM32.9124 70.4951H90.4875C97.7178 70.4951 102.948 71.7761 106.022 74.2979C108.534 76.3862 110.031 79.9026 110.031 86.9062C110.031 93.9096 108.701 98.9625 106.091 101.149C103.481 103.336 98.1215 104.617 90.5071 104.617H62.6995C55.6565 104.617 50.6625 103.573 47.9241 101.593C45.1858 99.6129 43.9837 96.8846 43.9836 92.915V91.0625H32.9124V92.915C32.9124 100.51 35.4439 106.282 40.4084 110.055C45.373 113.827 52.6621 115.659 62.6995 115.659H89.7092C100.456 115.659 108.426 113.64 113.351 109.66C118.276 105.681 121.034 98.9531 121.034 89.96C121.074 89.891 121.074 84.6338 121.064 84.2861C121.034 82.3308 120.85 80.3803 120.512 78.4541C119.527 72.8789 117.113 68.5056 113.4 65.4717C108.376 61.3641 100.653 59.4131 89.6604 59.4131H32.9124V70.4951ZM32.9124 49.5342H118.306V38.4912H32.9124V49.5342Z" fill="white"/>
        </svg>
      </div>

      <div className="flex h-full relative z-10">
        {/* Left Side - Card Image */}
        <div className="w-5/12 relative h-full flex items-center justify-center pl-2">
            <img 
              src="/images/src/card_owner.png" 
              alt="Founder Card" 
              className="w-full object-contain transform scale-110"
            />
        </div>

        {/* Right Side - Content */}
        <div className="w-7/12 py-5 pr-5 flex flex-col justify-center">
          <h3 className="text-lg sm:text-xl font-black text-white leading-none mb-2">
            Карта основателя
          </h3>
          <p className="text-xs font-medium text-white/90 leading-tight mb-4">
            Дарим 30 000 бонусов<br/>на весь 2026 год
          </p>
          
          <div className="mt-auto flex flex-col gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/founder-card');
              }}
              className="w-full max-w-[140px] rounded-xl bg-[#FF6B00] py-2 text-xs font-bold text-black shadow-lg shadow-orange-900/20 transition hover:bg-orange-500 active:scale-95"
            >
              как получить?
            </button>
            <div className="text-xs font-mono font-bold text-white/90 pl-1">
              {timeLeft.isExpired ? (
                <span className="uppercase text-[#FF6B00]">Мы открылись!</span>
              ) : (
                `${timeLeft.days}д ${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
