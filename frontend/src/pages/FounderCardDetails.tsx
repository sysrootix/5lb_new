import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star } from 'lucide-react';
import { useTelegramApp } from '@/hooks/useTelegramApp';
import { SpendingInfoBlock } from '@/components/SpendingInfoBlock';
import { HowToGetCardBlock } from '@/components/HowToGetCardBlock';
import { PromoTimer, usePromoTimer } from '@/components/PromoTimer';
import { FounderBenefitsBlock } from '@/components/FounderBenefitsBlock';

export const FounderCardDetailsPage = () => {
  const navigate = useNavigate();
  const { isTelegramApp, setTelegramThemeColor } = useTelegramApp();
  const timeLeft = usePromoTimer();

  useEffect(() => {
    if (isTelegramApp) {
      setTelegramThemeColor('#1a0f0a');
    }
  }, [isTelegramApp, setTelegramThemeColor]);

  return (
    <>

      <motion.main 
        className="min-h-screen pb-8 overflow-x-hidden max-w-xl mx-auto w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Hero Section */}
        <div className="relative h-[460px] sm:h-[500px] overflow-hidden rounded-b-[2.5rem] bg-gradient-to-br from-[#2A1205] via-[#FF6B00] to-[#FF8F40] p-6 sm:p-8">
          {/* Background Elements */}
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-orange-600/20 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="mt-20 relative z-20">
              <h1 className="text-6xl sm:text-8xl font-black text-white leading-[0.85] tracking-tight drop-shadow-xl">
                30 000
              </h1>
              <h2 className="text-5xl sm:text-6xl font-black text-white/95 leading-[0.85] uppercase tracking-tight drop-shadow-lg mt-1">
                БОНУСОВ
              </h2>
              <h2 className="text-5xl sm:text-6xl font-black text-white/90 leading-[0.85] uppercase tracking-tight drop-shadow-lg mt-1">
                НА ВЕСЬ
              </h2>
              
              {/* Watermark 2026 */}
              <div className="absolute top-[140px] left-[-10px] -z-10 select-none">
                <span className="text-[8rem] sm:text-[10rem] font-black text-white/20 leading-none">
                  2026
                </span>
              </div>
            </div>

            {/* Cards Image */}
            <motion.div 
              className="absolute right-[-50px] bottom-2 sm:right-[-20px] sm:bottom-4 rotate-[-8deg] z-10 w-[280px] sm:w-[340px]"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
               <img 
                 src="/images/src/card_owner.png" 
                 alt="Founder Card" 
                 className="w-full h-auto object-contain drop-shadow-2xl"
               />
            </motion.div>
            
            {/* Timer Pill */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-max">
              <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
                 <div className="flex flex-col">
                    <span className="text-[10px] text-white/60 uppercase font-bold tracking-wider leading-none mb-1">До конца акции</span>
                    <div className="text-white font-mono font-bold text-xl leading-none tracking-wide">
                      {timeLeft.isExpired ? (
                        "МЫ ОТКРЫЛИСЬ!"
                      ) : (
                        <>
                          {timeLeft.days}д {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
                        </>
                      )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

      {/* Content Section */}
      <div className="px-4 sm:px-5 pt-6">
        {/* Opening Date Section */}
        <section className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            12 декабря – день открытия
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4 leading-relaxed">
            12 декабря в Хабаровске открывается 3 магазина «5lb» 
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
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{address}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Map Section */}
        <section className="mb-8">
          <div className="relative h-48 rounded-3xl overflow-hidden bg-gray-800">
            {/* Map Image */}
            <img 
              src="/images/src/map.png" 
              alt="Map" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Overlay for better contrast if needed, or just the markers container */}
            <div className="absolute inset-0">
              {/* Mock map markers */}
              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="bg-white rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  </svg>
                  ТЦ Пихта
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 transform translate-x-4">
                <div className="bg-white rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  </svg>
                  ТЦ МаксиМолл
                </div>
              </div>
              <div className="absolute bottom-1/4 left-1/3">
                <div className="bg-white rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold text-gray-900 shadow-lg flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  </svg>
                  Березка
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-400 mt-4 leading-relaxed">
            В честь открытия дарим карту основателя, которая 
            предоставляет <span className="text-orange-500 font-bold">30 000 бонусов</span> на весь 2026 год.
          </p>
        </section>

        {/* How to Spend Bonuses */}
        <section className="mb-8">
          <SpendingInfoBlock />
        </section>

        {/* How to Get Card */}
        <section className="mb-8">
          <HowToGetCardBlock />
        </section>

        {/* Benefits Section */}
        <section className="mb-8">
          <FounderBenefitsBlock />
        </section>

        {/* Countdown Timer */}
        <section className="mb-8">
          <PromoTimer className="text-5xl sm:text-7xl font-black text-[#FF6600] font-mono tracking-tighter text-center" />
        </section>
      </div>
    </motion.main>
    </>
  );
};
