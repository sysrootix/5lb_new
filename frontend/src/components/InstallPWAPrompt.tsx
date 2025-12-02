import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, MoreVertical } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

export const InstallPWAPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { hideTabBar, showTabBar } = useUIStore();

  useEffect(() => {
    // Проверяем, показывали ли уже промпт
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
    if (hasSeenPrompt === 'true') {
      return;
    }

    // Показываем промпт через 2 секунды после загрузки
    const timer = setTimeout(() => {
      setShowPrompt(true);
      hideTabBar();
      document.body.style.overflow = 'hidden';
    }, 2000);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [hideTabBar]);

  const handleDismiss = () => {
    setShowPrompt(false);
    showTabBar();
    document.body.style.overflow = '';
    localStorage.setItem('pwa-install-prompt-seen', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={handleDismiss}
          />

          {/* Bottom Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[9999] pb-safe"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#2A1205] to-[#180C06] shadow-2xl border-t border-x border-white/5">
              {/* Watermark */}
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none mix-blend-overlay scale-150">
                 <svg width="125" height="135" viewBox="0 0 116 125" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path opacity="1" d="M76.9807 -3C97.4009 -3 116.986 5.11145 131.426 19.5498C145.866 33.9881 153.979 53.5711 153.982 73.9912L153.989 75.418C153.718 90.1485 149.226 104.504 141.031 116.771C132.573 129.435 120.548 139.306 106.48 145.136C92.4111 150.966 76.9292 152.494 61.9924 149.525C47.0557 146.557 33.3342 139.226 22.5637 128.46C11.7932 117.694 4.45679 103.975 1.48267 89.0391C-1.49144 74.1034 0.030034 58.6208 5.85474 44.5498C11.6795 30.479 21.546 18.451 34.2063 9.9873C46.8665 1.52373 61.7521 -2.99601 76.9807 -3ZM32.9124 70.4951H90.4875C97.7178 70.4951 102.948 71.7761 106.022 74.2979C108.534 76.3862 110.031 79.9026 110.031 86.9062C110.031 93.9096 108.701 98.9625 106.091 101.149C103.481 103.336 98.1215 104.617 90.5071 104.617H62.6995C55.6565 104.617 50.6625 103.573 47.9241 101.593C45.1858 99.6129 43.9837 96.8846 43.9836 92.915V91.0625H32.9124V92.915C32.9124 100.51 35.4439 106.282 40.4084 110.055C45.373 113.827 52.6621 115.659 62.6995 115.659H89.7092C100.456 115.659 108.426 113.64 113.351 109.66C118.276 105.681 121.034 98.9531 121.034 89.96C121.074 89.891 121.074 84.6338 121.064 84.2861C121.034 82.3308 120.85 80.3803 120.512 78.4541C119.527 72.8789 117.113 68.5056 113.4 65.4717C108.376 61.3641 100.653 59.4131 89.6604 59.4131H32.9124V70.4951ZM32.9124 49.5342H118.306V38.4912H32.9124V49.5342Z" fill="white"/>
                 </svg>
              </div>

              <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FF6B00]/10 border border-[#FF6B00]/20">
                      <Download size={24} className="text-[#FF6B00]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white leading-tight">
                        Установите<br />приложение
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Instruction */}
                <div className="space-y-4 mb-6">
                  <p className="text-sm text-white/80 leading-relaxed">
                    Чтобы установить наше приложение на главный экран:
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-black">
                        1
                      </div>
                      <p className="text-sm text-white/70">
                        В правом верхнем углу нажмите на три точки <MoreVertical className="inline-block w-4 h-4 align-text-bottom mx-1" />
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-black">
                        2
                      </div>
                      <p className="text-sm text-white/70">
                        Выберите <span className="text-white font-medium">"Добавить на экран Домой"</span>
                      </p>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-black">
                        3
                      </div>
                      <p className="text-sm text-white/70">
                        Следуйте дальнейшим инструкциям на странице
                      </p>
                    </div>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={handleDismiss}
                  className="w-full rounded-xl bg-[#FF6B00] py-3.5 text-sm font-bold text-black shadow-lg shadow-orange-900/20 transition hover:bg-orange-500 active:scale-95"
                >
                  Понятно
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
