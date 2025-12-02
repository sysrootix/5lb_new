/**
 * Утилиты для кеширования и предзагрузки изображений.
 */

/**
 * Предзагружает изображение и сохраняет его в кеше браузера.
 * @param src - URL изображения для кеширования.
 * @returns Promise, который разрешается, когда изображение загружено.
 */
export const cacheImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
  });
};

/**
 * Предзагружает список изображений параллельно.
 * @param sources - Массив URL изображений.
 * @returns Promise, который разрешается, когда все изображения загружены.
 */
export const cacheImages = (sources: string[]): Promise<void[]> => {
  return Promise.all(sources.map(cacheImage));
};

/**
 * Хук для предзагрузки списка изображений при монтировании компонента.
 * @param sources - Массив URL изображений.
 */
import { useEffect } from 'react';

export const useImagePreloader = (sources: string[]) => {
  useEffect(() => {
    cacheImages(sources).catch((err) => 
      console.error('Error preloading images:', err)
    );
  }, [sources]);
};
