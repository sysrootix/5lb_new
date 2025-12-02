# Миграция базы данных 5LB

## Обновление схемы базы данных

Схема Prisma была обновлена с добавлением новых моделей и полей для улучшенной функциональности.

### Новые поля в модели User:

**Контактные данные:**
- `email` - Email для коммуникации и восстановления доступа

**Персональные данные:**
- `firstName`, `lastName` - Имя и фамилия
- `dateOfBirth` - Дата рождения (для поздравлений и аналитики)
- `gender` - Пол (для персонализации)
- `avatar` - URL аватара

**Telegram:**
- `telegramUsername` - Username в Telegram
- `telegramChatId` - ID чата для отправки уведомлений

**Настройки коммуникации:**
- `emailNotifications` - Согласие на email рассылку
- `smsNotifications` - Согласие на SMS
- `telegramNotifications` - Уведомления в Telegram
- `pushNotifications` - Push уведомления
- `marketingConsent` - Согласие на маркетинговые материалы

**Метаданные:**
- `registrationSource` - Откуда пришел пользователь
- `lastLoginAt` - Последний вход

### Новые модели:

1. **Address** - Адреса доставки пользователя
2. **Order** - Заказы
3. **OrderItem** - Товары в заказе
4. **Product** - Товары
5. **Category** - Категории товаров

### Enum типы:

- `Gender` - MALE, FEMALE, OTHER
- `OrderStatus` - PENDING, CONFIRMED, PREPARING, DELIVERING, COMPLETED, CANCELLED

## Применение миграции

```bash
# 1. Создать миграцию
cd backend
npx prisma migrate dev --name add_user_details_and_orders

# 2. Сгенерировать Prisma Client
npx prisma generate

# 3. (Опционально) Заполнить тестовыми данными
npx prisma db seed
```

## Важные замечания:

1. **Обратная совместимость**: Все новые поля nullable, существующие пользователи не будут затронуты
2. **Индексы**: Добавлены индексы для phone, email, telegramId для быстрого поиска
3. **Каскадное удаление**: Address и OrderItem удаляются при удалении пользователя/заказа
4. **JSON поля**: specs в Product для гибкого хранения характеристик товаров

## Следующие шаги:

1. Обновить backend endpoints для работы с новыми полями
2. Добавить валидацию данных
3. Создать API endpoints для управления адресами
4. Реализовать систему заказов
