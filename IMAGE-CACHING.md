# Система кеширования изображений

Проект настроен для автоматического кеширования всех изображений на устройстве пользователя.

## Как это работает

### 1. Service Worker (PWA)

Vite PWA автоматически кеширует все изображения через Service Worker:

- **Локальные изображения** (из папки `public/`) — кешируются на **180 дней** (до 200 файлов)
- **Внешние изображения** (с CDN/API) — кешируются на **90 дней** (до 500 файлов)
- **Google Fonts** — кешируются на **1 год**

Конфигурация в `frontend/vite.config.ts`:
- Использует стратегию `CacheFirst` — изображение берется из кеша, если доступно
- Автоматически обновляется при изменении версии приложения

### 2. HTTP-заголовки на сервере

Backend автоматически устанавливает правильные заголовки для кеширования:

```typescript
Cache-Control: public, max-age=31536000, immutable
```

Это говорит браузеру:
- `public` — можно кешировать на клиенте и CDN
- `max-age=31536000` — кешировать 1 год (в секундах)
- `immutable` — файл не изменится, не нужно проверять обновления

### 3. Компонент OptimizedImage

Для удобства создан компонент `OptimizedImage`, который:
- Автоматически использует **lazy loading** (загрузка при приближении к viewport)
- Показывает **shimmer skeleton** пока изображение грузится
- Поддерживает **placeholder** при ошибке загрузки
- Плавная анимация появления
- Использует `crossOrigin="anonymous"` для PWA

## Использование

### Простой пример

```tsx
import { OptimizedImage } from '../components/OptimizedImage';

<OptimizedImage
  src="https://example.com/image.jpg"
  alt="Описание"
  className="w-full h-full object-cover"
/>
```

### С placeholder

```tsx
<OptimizedImage
  src={product.imageUrl}
  alt={product.name}
  placeholder="/images/placeholder.svg"
  className="w-full h-auto"
/>
```

### Без lazy loading (для критических изображений)

```tsx
<OptimizedImage
  src="/logo.svg"
  alt="Logo"
  lazy={false}
  className="w-32 h-32"
/>
```

### Обычный img тег (тоже кешируется)

Обычные `<img>` теги тоже будут кешироваться автоматически:

```tsx
<img
  src={banner.imageUrl}
  alt={banner.title}
  loading="lazy"
  className="w-full"
/>
```

## Утилиты для управления кешем

В `frontend/src/utils/imageCache.ts` доступны функции:

```typescript
import {
  preloadImage,
  preloadImages,
  getCacheSize,
  clearImageCache,
  isImageCached
} from '@/utils/imageCache';

// Прелоад одного изображения
await preloadImage('/logo.svg');

// Прелоад нескольких
await preloadImages(['/img1.jpg', '/img2.jpg']);

// Получить количество закешированных изображений
const count = await getCacheSize();

// Очистить кеш изображений
await clearImageCache();

// Проверить закешировано ли изображение
const cached = await isImageCached('/logo.svg');
```

## Автоматический прелоад критических изображений

При запуске приложения автоматически прелоадятся:
- `/logo.svg`
- `/images/global-bg.svg`
- `/images/background-pattern.svg`

Добавить новые в `frontend/src/utils/imageCache.ts` → `preloadCriticalImages()`.

## Проверка работы кеша

### В DevTools

1. Откройте Chrome DevTools → **Application** → **Cache Storage**
2. Найдите кеши:
   - `local-images-cache` — локальные изображения
   - `external-images-cache` — внешние изображения
   - `google-fonts-cache` — шрифты

### В Network tab

1. Откройте DevTools → **Network**
2. Перезагрузите страницу
3. Колонка **Size** должна показывать `(disk cache)` или `(from ServiceWorker)` для закешированных файлов

### Консоль браузера

```javascript
// Посмотреть все кеши
await caches.keys()

// Открыть конкретный кеш
const cache = await caches.open('external-images-cache')
const keys = await cache.keys()
console.log(keys)
```

## Сброс кеша

### Через код

```typescript
import { clearImageCache } from '@/utils/imageCache';
await clearImageCache();
```

### Вручную в браузере

1. DevTools → Application → Cache Storage
2. Правый клик на кеш → Delete
3. Или Clear storage → Clear site data

### При обновлении PWA

Кеш автоматически обновляется при:
- Изменении версии в `package.json`
- Обновлении Service Worker
- Ручной очистке кеша браузера

## Рекомендации

### ✅ Используйте OptimizedImage для:
- Изображений товаров
- Баннеров и промо-материалов
- Аватаров пользователей
- Любых внешних изображений

### ✅ Используйте обычный img для:
- Критических изображений (логотипы, иконки в header)
- SVG иконок из папки `/public`
- Изображений, которые должны загрузиться сразу

### ✅ Не забывайте:
- Всегда указывать `alt` атрибут
- Использовать `loading="lazy"` для изображений ниже первого экрана
- Оптимизировать изображения перед загрузкой (WebP, AVIF)

## Технические детали

### Размеры кеша

- Максимальный размер одного файла: **10MB**
- Максимум локальных изображений: **200**
- Максимум внешних изображений: **500**

При превышении лимитов старые изображения автоматически удаляются (FIFO).

### Время кеширования

| Тип ресурса | Время кеша | Стратегия |
|------------|-----------|-----------|
| Локальные изображения | 180 дней | CacheFirst |
| Внешние изображения | 90 дней | CacheFirst |
| API запросы | 10 минут | NetworkFirst |
| Google Fonts | 1 год | CacheFirst |
| Статические файлы (JS, CSS) | По умолчанию Vite | CacheFirst |

### Поддержка форматов

Автоматически кешируются:
- `.png`, `.jpg`, `.jpeg`
- `.webp`, `.avif`
- `.svg`, `.gif`
- `.ico`

## Отладка проблем

### Изображения не кешируются

1. Проверьте, что Service Worker активен:
   ```javascript
   navigator.serviceWorker.getRegistration()
   ```

2. Проверьте CORS заголовки для внешних изображений

3. Проверьте размер файлов (не больше 10MB)

### Старые изображения не обновляются

1. Очистите кеш вручную
2. Обновите версию приложения
3. Перерегистрируйте Service Worker

### Кеш занимает много места

```typescript
// Получить размер
const size = await getCacheSize();

// Очистить если нужно
if (size > 400) {
  await clearImageCache();
}
```

## Поддержка браузеров

Кеширование работает во всех современных браузерах с поддержкой:
- Service Workers (все современные браузеры)
- Cache API (Chrome 40+, Firefox 39+, Safari 11.1+)
- Intersection Observer для lazy loading (все современные браузеры)

Для старых браузеров изображения будут загружаться обычным способом, без кеширования.
