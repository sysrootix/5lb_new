# Миграция: Добавление полей catalogFavorites и cart в таблицу User

## Проблема
Колонки `catalogFavorites` и `cart` не существуют в таблице `User`, что вызывает ошибки 500 при работе с избранным и корзиной для авторизованных пользователей.

## Решение
Нужно применить миграцию к базе данных.

## Команды для выполнения на сервере:

```bash
cd /root/5lb/backend

# Вариант 1: Использовать prisma db push (рекомендуется)
npx prisma db push

# Вариант 2: Выполнить SQL напрямую
psql $DATABASE_URL -c "ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"catalogFavorites\" JSONB, ADD COLUMN IF NOT EXISTS \"cart\" JSONB;"

# После применения миграции перезапустить backend
pm2 restart 5lb-backend
```

## Изменения в схеме:
- Добавлено поле `catalogFavorites` типа JSONB в модель User
- Добавлено поле `cart` типа JSONB в модель User

Эти поля используются для хранения избранного и корзины авторизованных пользователей (аналогично AnonymousUser).




















