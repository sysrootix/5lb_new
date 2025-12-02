import { motion } from 'framer-motion';
import { GlobalBackground } from '../components/GlobalBackground';
import { useTelegramBackButton } from '../hooks/useTelegramBackButton';

const shops = [
  { name: 'ТЦ Пихта (1 этаж)', address: 'Ул. Большая, 88' },
  { name: 'ТЦ Макси Молл (1 этаж)', address: 'Ул. Ленинградская, 28' },
  { name: 'Гастромаркет "Березка"', address: 'Ул. Тургеньева, 46' },
];

const ShopsPage = () => {
  useTelegramBackButton();

  return (
    <div className="min-h-screen relative pb-20">
      <GlobalBackground />

      {/* Заголовок */}
      {/* Заголовок */}
      <div className="sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">Наши магазины</h1>
        </div>
      </div>

      {/* Список магазинов */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shops.map((shop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10"
            >
              <h2 className="text-xl font-bold text-white mb-2">
                {shop.name}
              </h2>
              <div className="flex items-center text-gray-300">
                <svg className="h-5 w-5 mr-2 text-5lb-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{shop.address}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopsPage;
