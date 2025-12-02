import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const NewsCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-0 shadow-lg cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate('/founder-card')}
    >
      <div className="p-1 bg-gradient-to-b from-orange-900/20 to-transparent rounded-3xl">
          <div className="bg-transparent rounded-[20px] p-4">
            {/* Image Section */}
            <div className="relative h-32 w-full overflow-hidden rounded-xl bg-gray-800 mb-4">
                <img 
                src="/images/news/open_news.png" 
                alt="Products" 
                className="h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight mb-2">
                Открытие 12 декабря:<br/>дарим 30 000 бонусов
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 font-medium">
                12 декабря в Хабаровске открывается<br/>
                3 магазина «5lb» В честь открытия первым 300<br/>
                клиентам дарим «карту основателя», которая<br/>
                предоставляет 30 000 бонусов на счет.
                </p>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/founder-card');
                  }}
                  className="w-full rounded-xl bg-[#FF6B00] py-3 text-sm font-bold text-black shadow-lg shadow-orange-900/20 transition hover:bg-orange-500 active:scale-95 uppercase"
                >
                подробнее
                </button>
            </div>
          </div>
      </div>
    </motion.div>
  );
};
