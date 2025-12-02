import { FC } from 'react';

export const HowToGetCardBlock: FC = () => {
  return (
    <>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
        Как получить карту?
      </h3>
      
      <p className="text-gray-300 text-sm leading-relaxed mb-6">
        Для получения карты необходимо совершить покупку в период{' '}
        <span className="text-orange-500 font-semibold">с 12 по 16 декабря</span> на сумму от{' '}
        <span className="text-orange-500 font-semibold">5000 ₽</span> в одном 
        из трех магазинов.
      </p>
      
      <div className="flex items-center gap-6">
        {/* Badge */}
        <div className="bg-[#FF6600] rounded-xl px-6 py-3 shadow-[0_4px_20px_rgba(255,102,0,0.3)]">
           <span className="text-black font-bold text-base sm:text-lg whitespace-nowrap">
             Осталось карт:
           </span>
        </div>
        
        {/* Count */}
        <div className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tighter">
          300<span className="text-white/90">/300</span>
        </div>
      </div>
    </>
  );
};
