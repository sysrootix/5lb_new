import { useEffect } from 'react';

/**
 * Хук для блокировки скролла body при открытом модальном окне
 */
export const useLockBodyScroll = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      // Сохраняем текущую позицию скролла
      const scrollY = window.scrollY;
      
      // Блокируем скролл
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // Разблокируем скролл и восстанавливаем позицию
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isLocked]);
};

