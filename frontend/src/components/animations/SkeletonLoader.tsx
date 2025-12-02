interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  type?: 'text' | 'card' | 'circle' | 'image';
}

/**
 * SkeletonLoader - skeleton screen с shimmer эффектом
 * Оптимизирован для 60 FPS - использует CSS анимации вместо JS
 *
 * НЕ используй обычные спиннеры - только skeleton screens!
 *
 * Эффекты:
 * - Shimmer анимация (движущийся градиент через CSS)
 * - Различные типы: text, card, circle, image
 * - Можно указать количество элементов
 *
 * Использование:
 * <SkeletonLoader type="card" count={3} />
 * <SkeletonLoader type="text" count={5} />
 */
export const SkeletonLoader = ({
  className = '',
  count = 1,
  type = 'text',
}: SkeletonLoaderProps) => {
  const getSkeletonClass = () => {
    switch (type) {
      case 'text':
        return 'h-4 w-full rounded';
      case 'card':
        return 'h-48 w-full rounded-2xl';
      case 'circle':
        return 'h-12 w-12 rounded-full';
      case 'image':
        return 'h-64 w-full rounded-xl';
      default:
        return 'h-4 w-full rounded';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`shimmer ${getSkeletonClass()}`}
          style={{ animationDelay: `${index * 100}ms` }}
        />
      ))}
    </div>
  );
};

/**
 * ProductCardSkeleton - специальный skeleton для карточки товара
 * Оптимизирован для 60 FPS
 */
export const ProductCardSkeleton = ({ count = 1 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-4 shadow-sm border border-5lb-gray-100"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Изображение */}
          <div className="shimmer rounded-xl aspect-square mb-3" />

          {/* Текст */}
          <div className="space-y-2">
            <div className="shimmer rounded h-4" />
            <div className="shimmer rounded h-4 w-2/3" />
            <div className="flex justify-between items-center mt-4">
              <div className="shimmer rounded h-4 w-1/3" />
              <div className="shimmer rounded-full h-8 w-8" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
