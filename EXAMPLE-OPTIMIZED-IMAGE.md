# Примеры использования OptimizedImage

Вот как можно обновить существующие компоненты для использования `OptimizedImage`:

## Пример 1: HomeBanner (баннеры на главной)

**До:**
```tsx
<img
  src={banner.imageUrl}
  alt={banner.title || 'Banner'}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  loading="lazy"
/>
```

**После:**
```tsx
import { OptimizedImage } from '../OptimizedImage';

<OptimizedImage
  src={banner.imageUrl}
  alt={banner.title || 'Banner'}
  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  lazy={true}
  placeholderClassName="shimmer bg-white/5"
/>
```

## Пример 2: ProductCard (карточки товаров)

**До:**
```tsx
<img
  src={product.imageUrl}
  alt={product.name}
  className="w-full h-48 object-cover"
  loading="lazy"
/>
```

**После:**
```tsx
<OptimizedImage
  src={product.imageUrl}
  alt={product.name}
  placeholder="/images/placeholder-product.svg"
  className="w-full h-48 object-cover"
  lazy={true}
/>
```

## Пример 3: Avatar (аватары пользователей)

**До:**
```tsx
<img
  src={user.avatarUrl || '/images/default-avatar.png'}
  alt={user.name}
  className="w-12 h-12 rounded-full"
/>
```

**После:**
```tsx
<OptimizedImage
  src={user.avatarUrl || '/images/default-avatar.png'}
  alt={user.name}
  placeholder="/images/default-avatar.png"
  className="w-12 h-12 rounded-full"
  lazy={false} // Аватар обычно сразу видим
/>
```

## Пример 4: Логотип (критическое изображение)

**До:**
```tsx
<img
  src="/logo.svg"
  alt="5LB Logo"
  className="h-8"
/>
```

**После:**
```tsx
<OptimizedImage
  src="/logo.svg"
  alt="5LB Logo"
  className="h-8"
  lazy={false} // Логотип должен загрузиться сразу
/>
```

## Пример 5: Background Image через CSS

Если у вас background-image в CSS, замените на img:

**До:**
```tsx
<div
  style={{
    backgroundImage: `url('${image}')`,
    backgroundSize: 'cover',
  }}
  className="w-full h-64"
/>
```

**После:**
```tsx
<div className="relative w-full h-64 overflow-hidden">
  <OptimizedImage
    src={image}
    alt="Background"
    className="absolute inset-0 w-full h-full object-cover"
    lazy={true}
  />
</div>
```

## Пример 6: Прелоадинг изображений программно

```tsx
import { useEffect } from 'react';
import { preloadImages } from '@/utils/imageCache';

function ProductGallery({ productImages }) {
  useEffect(() => {
    // Прелоадим все изображения при монтировании компонента
    preloadImages(productImages.map(img => img.url));
  }, [productImages]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {productImages.map((img, idx) => (
        <OptimizedImage
          key={idx}
          src={img.url}
          alt={img.alt}
          className="w-full h-auto"
          lazy={idx > 6} // Первые 6 загружаем сразу, остальные lazy
        />
      ))}
    </div>
  );
}
```

## Пример 7: С обработкой ошибок

```tsx
import { useState } from 'react';
import { OptimizedImage } from '../OptimizedImage';

function ProductImage({ product }) {
  const [hasError, setHasError] = useState(false);

  return (
    <OptimizedImage
      src={product.imageUrl}
      alt={product.name}
      placeholder="/images/no-image.svg"
      className="w-full h-64 object-cover"
      onError={() => {
        setHasError(true);
        console.error('Не удалось загрузить изображение:', product.imageUrl);
      }}
      onLoad={() => {
        console.log('Изображение загружено:', product.imageUrl);
      }}
    />
  );
}
```

## Когда использовать обычный <img>

Используйте обычный `<img>` только для:
1. **SVG иконок** внутри кнопок и текста (они мелкие и не нуждаются в оптимизации)
2. **Изображений, которые уже в base64** (data:image/...)
3. **Критических изображений выше первого экрана** если lazy loading нежелателен

## Замена во всем проекте

Чтобы автоматически заменить все `<img>` на `<OptimizedImage>`:

```bash
# Найти все файлы с <img>
grep -r "<img" frontend/src --include="*.tsx" --include="*.jsx"

# Или использовать поиск в VSCode:
# Найти: <img\s+src=\{([^}]+)\}\s+alt="([^"]+)"
# Заменить на: <OptimizedImage src={$1} alt="$2" lazy={true}
```

После замены проверьте каждый случай вручную и настройте параметры:
- `lazy={true/false}` — нужен ли lazy loading
- `placeholder` — изображение на случай ошибки
- `placeholderClassName` — стили для placeholder

## Проверка результата

После внедрения:
1. Откройте DevTools → Network
2. Перезагрузите страницу
3. Прокрутите вниз
4. Изображения с `lazy={true}` должны загружаться только когда появляются в viewport
5. При повторной загрузке все должно грузиться из кеша (disk cache)
