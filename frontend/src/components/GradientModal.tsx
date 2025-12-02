import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { X, LucideIcon } from 'lucide-react';
import { ReactNode, useState, useEffect, useRef, ElementType } from 'react';
import { useUIStore } from '@/store/uiStore';

interface GradientModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ElementType;
  children: ReactNode;
  showHandle?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  gradientType?: 'orange' | 'red' | 'blue' | 'green' | 'profile';
  centered?: boolean;
}

const maxWidthClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
};

const gradientClasses = {
  orange: 'bg-gradient-to-br from-orange-500/20 via-orange-600/20 to-red-500/20 border-b border-white/10',
  red: 'bg-gradient-to-br from-red-500/20 via-red-600/20 to-red-700/20 border-b border-white/10',
  blue: 'bg-gradient-to-br from-blue-500/20 via-blue-600/20 to-blue-700/20 border-b border-white/10',
  green: 'bg-gradient-to-br from-green-500/20 via-green-600/20 to-green-700/20 border-b border-white/10',
  profile: 'bg-white/5 border-b border-white/10',
};

export const GradientModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  showHandle = true,
  maxWidth = '2xl',
  className = '',
  gradientType = 'orange',
  centered = true,
}: GradientModalProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [contentScrollTop, setContentScrollTop] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  
  const hideTabBar = useUIStore((state) => state.hideTabBar);
  const showTabBar = useUIStore((state) => state.showTabBar);

  // Manage TabBar visibility for bottom sheets
  useEffect(() => {
    // Only hide tab bar if NOT centered (bottom sheet mode)
    if (!centered && isOpen) {
      hideTabBar();
    }
  }, [isOpen, centered, hideTabBar]);

  // Safety net: Restore TabBar if component unmounts unexpectedly
  useEffect(() => {
    return () => {
      showTabBar();
    };
  }, [showTabBar]);

  // Плавные spring настройки для красивых анимаций (60 FPS)
  const springConfig = {
    type: 'spring' as const,
    stiffness: 350,
    damping: 35,
    mass: 0.9,
  };

  const backdropSpringConfig = {
    type: 'spring' as const,
    stiffness: 280,
    damping: 32,
    mass: 0.6,
  };

  // Улучшенные анимации с плавными переходами
  const initialAnimation = centered 
    ? { opacity: 0, scale: 0.94, y: 24 }
    : { y: '100%', opacity: 0, scale: 0.96 };
  const animateAnimation = centered
    ? { opacity: 1, scale: 1, y: 0 }
    : { y: 0, opacity: 1, scale: 1 };
  const exitAnimation = centered
    ? { opacity: 0, scale: 0.94, y: 24 }
    : { y: '100%', opacity: 0, scale: 0.96 };

  // Плавные трансформации для drag-эффекта (только для не-centered модалок)
  const dragY = useTransform(y, (value) => Math.max(0, value));
  const opacity = useTransform(dragY, [0, 120], [1, 0.5], { clamp: true });
  const scale = useTransform(dragY, [0, 120], [1, 0.97], { clamp: true });
  const backdropOpacity = useTransform(dragY, [0, 120], [1, 0.4], { clamp: true });
  const handleScale = useTransform(dragY, [0, 120], [1, 1.15], { clamp: true });
  const headerOpacity = useTransform(dragY, [0, 120], [1, 0.85], { clamp: true });

  const maxWidthClass = maxWidthClasses[maxWidth];
  const gradientClass = gradientClasses[gradientType];

  // Обработка drag для закрытия модалки
  const handleDragStart = () => {
    setIsDragging(true);
    // Сохраняем текущую позицию скролла контента
    if (contentRef.current) {
      setContentScrollTop(contentRef.current.scrollTop);
    }
  };

  const handleDrag = (_: any, info: any) => {
    // Мы больше не обновляем y вручную, Framer Motion делает это сам через drag
    // Но нам нужно блокировать скролл контента при драге вниз
    if (contentRef.current && info.offset.y > 0) {
      contentRef.current.scrollTop = contentScrollTop;
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const threshold = 100; // Порог в пикселях для закрытия
    const velocityThreshold = 500; // Порог скорости для закрытия
    const shouldClose = info.offset.y > threshold || info.velocity.y > velocityThreshold;
    
    if (shouldClose && !centered) {
      onClose();
    } else {
      // Плавный возврат в исходное положение
      animate(y, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8,
      });
    }
  };

  // Сброс позиции и состояния при открытии
  useEffect(() => {
    if (isOpen) {
      y.set(0);
      setIsDragging(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, y]);

  const bodyBgClass = 'bg-transparent text-white';

  return (
    <AnimatePresence 
      mode="wait"
      onExitComplete={() => {
        if (!centered) {
          showTabBar();
        }
      }}
    >
      {isOpen && (
        <motion.div 
          key="modal-wrapper" 
          className={`fixed inset-0 z-[100] flex ${centered ? 'items-center justify-center p-4' : 'items-end sm:items-end sm:justify-center sm:p-4'}`}
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
        >
          <motion.div
            key="backdrop"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropSpringConfig}
            style={centered ? {} : { opacity: backdropOpacity }}
          />
          <motion.div
            key="modal"
            className={`relative z-10 w-full ${maxWidthClass} ${centered ? 'h-auto max-h-[90vh]' : 'h-auto max-h-[90vh] sm:h-auto sm:max-h-[90vh]'} overflow-hidden flex flex-col shadow-2xl ${centered ? 'rounded-3xl' : 'sm:rounded-b-3xl'} ${className} bg-[#100501]/90 backdrop-blur-xl border border-white/10`}
            initial={initialAnimation}
            animate={isDragging ? {} : animateAnimation}
            exit={exitAnimation}
            transition={springConfig}
            style={centered ? {} : { y, opacity, scale }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Градиентный header с drag для закрытия - полностью перекрывает белый фон сверху */}
          <motion.div 
            className={`relative overflow-hidden ${gradientClass} rounded-t-3xl px-6 py-6 flex-shrink-0 select-none touch-none`}
            drag={centered ? false : 'y'}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            dragMomentum={false}
            dragListener={!centered}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={centered ? {} : { opacity: headerOpacity, y: 0 }}
            whileDrag={{ cursor: 'grabbing' }}
          >
            {/* Декоративные элементы - Removed for cleaner glass look */}
            {/* <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" /> */}
            {/* <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-5lb-red-600/30 blur-2xl" /> */}
            
            {/* Ручка для закрытия (только на мобильных) - внутри оранжевого блока */}
            {showHandle && !centered && (
              <motion.div 
                className="sm:hidden flex justify-center mb-4 -mt-2 cursor-grab active:cursor-grabbing"
                style={centered ? {} : { scale: handleScale }}
              >
                <motion.div 
                  className="w-12 h-1.5 rounded-full bg-white/30"
                  animate={isDragging ? { opacity: 0.6 } : { opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>
            )}
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3>
                  {subtitle && (
                    <p className="mt-1 text-sm font-medium text-white/90">{subtitle}</p>
                  )}
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white transition-all hover:bg-white/30"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Контент */}
          <div 
            ref={contentRef}
            className={`${bodyBgClass} ${centered ? 'rounded-b-3xl' : 'rounded-b-none sm:rounded-b-3xl'} flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y`}
            style={{ 
              touchAction: isDragging ? 'none' : 'pan-y',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {children}
          </div>
        </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

