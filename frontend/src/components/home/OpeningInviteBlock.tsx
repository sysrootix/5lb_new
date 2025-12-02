import { motion } from 'framer-motion';

export const OpeningInviteBlock = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Title */}
      <h2 className="text-2xl font-bold text-white mb-6">
        Приглашаем на открытие
      </h2>

      {/* Opening Info with Integrated Map */}
      <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 mb-6">
        <h3 className="text-lg font-bold text-white mb-4">
          с 12 по 16 декабря – дни открытия
        </h3>
        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
          с 12 по 16 декабря в Хабаровске открывается 3 магазина «5lb»
          по следующим адресам:
        </p>

        <div className="space-y-3 mb-6">
          {[
            'ТЦ Пихта (1 этаж);',
            'ТЦ Макси Молл (1 этаж);',
            'Гастромаркет «Березка» (ул. Тургенева, 46).'
          ].map((address, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{address}</p>
            </div>
          ))}
        </div>

        {/* Integrated Map */}
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gray-800">
          {/* Map Image */}
          <img
            src="/images/src/map.png"
            alt="Map"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Map markers */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
              <div className="bg-white rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                </svg>
                ТЦ Пихта
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 transform translate-x-4">
              <div className="bg-white rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                </svg>
                ТЦ МаксиМолл
              </div>
            </div>
            <div className="absolute bottom-1/4 left-1/3">
              <div className="bg-white rounded-full px-3 py-1 text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                </svg>
                Березка
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-400 leading-relaxed">
        В честь открытия дарим карту основателя, которая
        предоставляет <span className="text-orange-500 font-bold">30 000 бонусов</span> на весь 2026 год.
      </p>
    </motion.div>
  );
};
