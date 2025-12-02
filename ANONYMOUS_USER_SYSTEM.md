# Система анонимных пользователей

## Обзор

Система позволяет неавторизованным пользователям сохранять товары в избранное и другие данные. При авторизации все данные автоматически мигрируют в реальный аккаунт.

## Технологии

- **Browser Fingerprinting** - уникальная идентификация браузера на основе характеристик устройства
- **Prisma ORM** - работа с базой данных
- **Express Middleware** - идентификация анонимных пользователей
- **TypeScript** - типобезопасность

## Архитектура

### Backend

1. **Модель AnonymousUser** (`backend/prisma/schema.prisma`)
   - Хранит fingerprint и избранное
   - Связь с реальным пользователем после авторизации

2. **Сервисы**
   - `anonymousUserService.ts` - CRUD операции с анонимными пользователями
   - `fingerprintUtils.ts` - хеширование fingerprint для безопасности

3. **API Endpoints** (`/api/anonymous`)
   - `POST /init` - создание/получение анонимного пользователя
   - `GET /favorites` - получение избранного
   - `POST /favorites/:productId` - добавление в избранное
   - `DELETE /favorites/:productId` - удаление из избранного
   - `POST /migrate` - миграция данных при авторизации

4. **Middleware**
   - `identifyAnonymous` - опциональная идентификация
   - `requireAnonymous` - обязательная идентификация

### Frontend

1. **Утилиты**
   - `fingerprint.ts` - генерация browser fingerprint

2. **Хуки**
   - `useAnonymousUser.ts` - работа с анонимным пользователем

3. **API**
   - `anonymous.ts` - API клиент для работы с анонимными пользователями

## Применение миграции БД

```bash
cd backend
npx prisma migrate dev --name add_anonymous_user_system
npx prisma generate
```

## Использование

### Frontend

```typescript
import { useAnonymousUser } from '@/hooks/useAnonymousUser';

function ProductCard({ product }) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAnonymousUser();
  
  const handleToggleFavorite = async () => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product.id);
    }
  };
  
  return (
    <button onClick={handleToggleFavorite}>
      {isFavorite(product.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
    </button>
  );
}
```

### Автоматическая миграция при авторизации

При успешной авторизации через `/auth/verify` или `/auth/telegram` данные анонимного пользователя автоматически мигрируют в реальный аккаунт.

## Особенности

1. **Безопасность**: Fingerprint хешируется на сервере перед сохранением
2. **Производительность**: Используются индексы для быстрого поиска
3. **UX**: Пользователь может использовать базовые функции без авторизации
4. **Автоматическая миграция**: Данные переносятся при первой авторизации

## Будущие улучшения

- Поддержка корзины для анонимных пользователей
- История просмотров
- Персонализированные рекомендации





















