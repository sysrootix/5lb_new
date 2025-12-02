import { FC } from 'react';
import { Star } from 'lucide-react';

export const FounderBenefitsBlock: FC = () => {
  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0A0502] min-h-[500px]">
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-900/20 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-orange-600/40 blur-[80px] rounded-full pointer-events-none" />

      {/* Watermark Text */}
      <div className="absolute bottom-4 left-6 z-0 pointer-events-none leading-[0.8] select-none opacity-20">
        <div className="text-[5rem] sm:text-[7rem] font-black text-transparent stroke-text-white uppercase tracking-tighter">
          Get<br />to next<br />level
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 p-6 sm:p-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
          Что дает карта основателя?
        </h3>

        <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-[95%]">
          Помимо 30 000 бонусов, карта основателя предоставляет следующие{' '}
          <span className="text-orange-500 font-bold">возможности до конца 2026 года:</span>
        </p>

        <div className="space-y-5 mb-12">
          {[
            'Эксклюзивные акции и предложения.',
            'Ранний доступ к полезным материалам в приложении.',
            'Персональные розыгрыши и подарки.'
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <Star size={22} className="text-orange-500 flex-shrink-0 mt-0.5" fill="transparent" strokeWidth={2} />
              <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-medium">{benefit}</p>
            </div>
          ))}
        </div>

        <p className="text-orange-500 font-bold text-lg sm:text-xl max-w-[60%]">
          Ждем вас на открытии с 12 по 16 декабря.
        </p>
      </div>

      {/* Cards Image */}
      <div className="absolute right-[-80px] bottom-[-60px] w-[320px] sm:w-[420px] z-10 rotate-[30deg]">
        <img
          src="/images/src/card_owner.png"
          alt="Founder Cards"
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>

      <style>{`
        .stroke-text-white {
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};
