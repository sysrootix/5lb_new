import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Coins, Percent } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Story, StoryPage } from '../api/stories';
import { useTelegramApp } from '../hooks/useTelegramApp';
import { useUIStore } from '../store/uiStore';

interface StoryViewerProps {
  stories: Story[];
  currentStoryIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onStoryChange?: (newIndex: number) => void;
}

const MEDIA_DURATION = 5000; // 5 секунд для изображений по умолчанию

export const StoryViewer = ({ stories, currentStoryIndex, isOpen, onClose, onStoryChange }: StoryViewerProps) => {
  const navigate = useNavigate();
  const { isTelegramApp } = useTelegramApp();
  const { hideTabBar, showTabBar } = useUIStore();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragY, setDragY] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startYRef = useRef(0);

  const story = stories[currentStoryIndex];

  // Скрываем нижнее меню при открытии истории
  useEffect(() => {
    if (isOpen) {
      hideTabBar();
    } else {
      showTabBar();
    }
  }, [isOpen, hideTabBar, showTabBar]);

  useEffect(() => {
    if (!isOpen || !story) {
      return;
    }

    // Сброс при открытии новой истории
    setCurrentPageIndex(0);
    setProgress(0);
    setIsPaused(false);
  }, [isOpen, currentStoryIndex]);

  // Обработка Telegram back button
  useEffect(() => {
    if (!isTelegramApp || !isOpen) return;

    const handleBackButton = () => {
      onClose();
    };

    // @ts-ignore
    if (window.Telegram?.WebApp) {
      // @ts-ignore
      window.Telegram.WebApp.BackButton.show();
      // @ts-ignore
      window.Telegram.WebApp.BackButton.onClick(handleBackButton);
    }

    return () => {
      // @ts-ignore
      if (window.Telegram?.WebApp) {
        // @ts-ignore
        window.Telegram.WebApp.BackButton.offClick(handleBackButton);
      }
    };
  }, [isTelegramApp, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !story || isPaused) {
      // Очистка таймеров
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (mediaTimeoutRef.current) {
        clearTimeout(mediaTimeoutRef.current);
      }
      return;
    }

    const currentPage = story.pages[currentPageIndex];
    const duration = currentPage?.duration
      ? currentPage.duration * 1000
      : MEDIA_DURATION;

    // Прогресс-бар
    setProgress(0);
    const progressStep = 100 / (duration / 100);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + progressStep;
        return next >= 100 ? 100 : next;
      });
    }, 100);

    // Переключение на следующую страницу
    mediaTimeoutRef.current = setTimeout(() => {
      goToNextPage();
    }, duration);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (mediaTimeoutRef.current) {
        clearTimeout(mediaTimeoutRef.current);
      }
    };
  }, [currentPageIndex, isOpen, currentStoryIndex, isPaused]);

  const goToNextPage = () => {
    if (!story) return;

    if (currentPageIndex < story.pages.length - 1) {
      // Следующая страница в текущей истории
      setCurrentPageIndex(currentPageIndex + 1);
      setProgress(0);
    } else if (currentStoryIndex < stories.length - 1) {
      // Следующая история
      onStoryChange?.(currentStoryIndex + 1);
      setCurrentPageIndex(0);
      setProgress(0);
    } else {
      // Конец всех историй - закрываем
      onClose();
    }
  };

  const goToPreviousPage = () => {
    if (currentPageIndex > 0) {
      // Предыдущая страница в текущей истории
      setCurrentPageIndex(currentPageIndex - 1);
      setProgress(0);
    } else if (currentStoryIndex > 0) {
      // Предыдущая история
      const prevStory = stories[currentStoryIndex - 1];
      onStoryChange?.(currentStoryIndex - 1);
      setCurrentPageIndex(prevStory.pages.length - 1);
      setProgress(0);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      // Клик в левой половине - предыдущее
      goToPreviousPage();
    } else {
      // Клик в правой половине - следующее
      goToNextPage();
    }
  };

  // Обработка свайпа вниз для закрытия
  const handleTouchStart = (e: React.TouchEvent) => {
    startYRef.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    // Только если свайп вниз
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsPaused(false);

    // Если протянули больше 100px - закрываем
    if (dragY > 100) {
      onClose();
    }

    // Сбрасываем позицию
    setDragY(0);
  };

  const renderContentElement = (element: any, index: number) => {
    switch (element.type) {
      case 'text':
        return (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: element.content }}
            style={{
              ...element.style,
              whiteSpace: 'pre-line'
            }}
          />
        );

      case 'list':
        return (
          <div key={index} style={element.style} className="space-y-3">
            {element.items?.map((item: any, itemIndex: number) => (
              <div key={itemIndex} className="flex items-start gap-3">
                {item.icon === 'coin' && <Coins size={20} color="#FF6B00" className="flex-shrink-0 mt-0.5" />}
                {item.icon === 'percent' && <Percent size={20} color="#FF6B00" className="flex-shrink-0 mt-0.5" />}
                {item.icon === 'map-pin' && <MapPin size={20} color="#FF6B00" className="flex-shrink-0 mt-0.5" />}
                {item.number && <span style={{ color: 'white', fontWeight: 'bold', flexShrink: 0 }}>{item.number}</span>}
                <span
                  style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.4' }}
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        );

      case 'button':
        return (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              handleButtonAction(element.action);
            }}
            style={element.style}
            className="flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {element.icon === 'phone' && <Phone size={20} />}
            {element.label}
          </button>
        );

      default:
        return null;
    }
  };

  const handleButtonAction = (action: string) => {
    if (!action) return;

    if (action === 'copy_referral') {
      // TODO: Implement referral link copy
      console.log('Copy referral link');
      return;
    }

    // Проверяем, это внутренняя ссылка или внешняя
    if (action.startsWith('/')) {
      // Внутренняя ссылка
      onClose();
      navigate(action);
    } else if (action.startsWith('http://') || action.startsWith('https://')) {
      // Внешняя ссылка
      window.open(action, '_blank', 'noopener,noreferrer');
    } else if (action.startsWith('tel:')) {
      // Телефонный звонок
      window.location.href = action;
    } else {
      // Относительная ссылка
      onClose();
      navigate('/' + action);
    }
  };

  if (!isOpen || !story) return null;

  const currentPage = story.pages[currentPageIndex];
  const isVacanciesStory = story.id === 'vacansies';

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key={`story-${currentStoryIndex}-${currentPageIndex}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: 1,
            scale: 1,
            y: dragY
          }}
          exit={{ opacity: 0, scale: 0.95, y: 100 }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300
          }}
          className="fixed inset-0 z-[100] bg-black overflow-hidden"
          style={{ height: '100dvh' }}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top bar with progress and close button */}
          <div className="absolute top-0 left-0 right-0 z-20 p-4 safe-top">
            <div className="flex items-start gap-2">
              {/* Progress Bars */}
              <div className="flex-1 flex gap-1">
                {story.pages.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-white rounded-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: index < currentPageIndex
                          ? '100%'
                          : index === currentPageIndex
                            ? `${progress}%`
                            : '0%'
                      }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                ))}
              </div>

              {/* Close Button - Hidden for vacansies story */}
              {!isVacanciesStory && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all active:scale-90 flex-shrink-0"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Story Title */}
            <h3 className="text-white font-bold text-base mt-3 drop-shadow-lg">{story.title}</h3>
          </div>

          {/* Background Image/Video */}
          <div
            className="absolute inset-0"
            onClick={handleClick}
            style={{
              backgroundImage: currentPage?.type === 'IMAGE' ? `url(${currentPage.url})` : undefined,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {currentPage?.type === 'VIDEO' && (
              <video
                src={currentPage.url}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                onEnded={goToNextPage}
              />
            )}

            {/* Gradient Blur Overlay */}
            {currentPage?.hasBlur && (
              <div className="absolute inset-0 pointer-events-none backdrop-blur-sm">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 194 345"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  preserveAspectRatio="none"
                >
                  <rect width="194" height="345" fill="url(#paint0_linear_241_546)" />
                  <defs>
                    <linearGradient id="paint0_linear_241_546" x1="97" y1="-104" x2="97" y2="345" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF8301" stopOpacity="0.15" />
                      <stop offset="0.5" stopColor="#000000" stopOpacity="0.4" />
                      <stop offset="1" stopColor="#000000" stopOpacity="0.85" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Content Overlay */}
          {currentPage?.content && (
            <div className="absolute inset-0 z-10 flex flex-col pointer-events-none">
              <div className="flex-1 flex flex-col justify-between" style={{ paddingTop: '80px', paddingBottom: '40px', paddingLeft: '20px', paddingRight: '20px' }}>
                {currentPage.content.elements?.map((element: any, index: number) => {
                  // Separate buttons from other content
                  const isButton = element.type === 'button';

                  return (
                    <div
                      key={index}
                      className={isButton ? 'pointer-events-auto mt-auto' : ''}
                      style={isButton ? { alignSelf: 'stretch' } : {}}
                    >
                      {renderContentElement(element, index)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};
