import { useState, useEffect, useRef, ImgHTMLAttributes, memo } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'loading'> {
  src: string;
  alt: string;
  /** Включить ленивую загрузку (по умолчанию true) */
  lazy?: boolean;
  /** Placeholder пока изображение не загрузится */
  placeholder?: string;
  /** Класс для placeholder */
  placeholderClassName?: string;
  /** Callback при успешной загрузке */
  onLoad?: () => void;
  /** Callback при ошибке загрузки */
  onError?: () => void;
}

/**
 * Оптимизированный компонент для изображений с:
 * - Автоматическим кешированием через Service Worker
 * - Ленивой загрузкой (lazy loading)
 * - Placeholder пока изображение грузится
 * - Обработкой ошибок
 */
export const OptimizedImage = memo(({
  src,
  alt,
  lazy = true,
  placeholder,
  placeholderClassName = 'shimmer',
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer для ленивой загрузки
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до появления в viewport
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
    onError?.();
  };

  // Если изображение еще не в viewport (при lazy loading)
  if (lazy && !isInView) {
    return (
      <div
        ref={imgRef as any}
        className={`${placeholderClassName} ${className || ''}`}
        {...(props as any)}
      />
    );
  }

  return (
    <div className="relative">
      {/* Placeholder пока изображение не загружено */}
      {!isLoaded && !hasError && (
        <div
          className={`absolute inset-0 ${placeholderClassName} ${className || ''}`}
        />
      )}

      {/* Fallback если изображение не загрузилось */}
      {hasError && placeholder && (
        <img
          src={placeholder}
          alt={alt}
          className={className}
          {...props}
        />
      )}

      {/* Основное изображение */}
      {!hasError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`${className || ''} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          // Добавляем атрибуты для браузерного кеширования
          crossOrigin="anonymous"
          {...props}
        />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
