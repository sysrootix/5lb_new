# API Документация - Авторизация

## Обзор

Система авторизации поддерживает два метода:
1. **Звонок с 4-значным кодом** (через SMSC.ru)
2. **Telegram Login Widget**

## Endpoints

### 1. Запрос звонка с кодом

```http
POST /api/auth/request-call
Content-Type: application/json

{
  "phone": "79991234567"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Звонок отправлен. Ответьте на звонок и запомните 4-значный код"
}
```

### 2. Подтверждение кода из звонка

```http
POST /api/auth/verify-call
Content-Type: application/json

{
  "phone": "79991234567",
  "code": "1234"
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cl...",
    "phone": "79991234567",
    "displayName": "Пользователь",
    "bonusBalance": 0
  },
  "isNewUser": false
}
```

### 3. Авторизация через Telegram

```http
POST /api/auth/telegram
Content-Type: application/json

{
  "id": 123456789,
  "first_name": "Иван",
  "last_name": "Иванов",
  "username": "ivanov",
  "photo_url": "https://...",
  "auth_date": 1234567890,
  "hash": "..."
}
```

**Ответ:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cl...",
    "telegramId": "123456789",
    "displayName": "Иван Иванов",
    "telegramUsername": "ivanov",
    "avatar": "https://...",
    "bonusBalance": 0
  },
  "isNewUser": true
}
```

### 4. Получение профиля

```http
GET /api/profile
Authorization: Bearer <token>
```

**Ответ:**
```json
{
  "id": "cl...",
  "phone": "79991234567",
  "email": "user@example.com",
  "firstName": "Иван",
  "lastName": "Иванов",
  "displayName": "Иван Иванов",
  "dateOfBirth": "1990-01-15T00:00:00.000Z",
  "gender": "MALE",
  "avatar": "https://...",
  "bonusBalance": 150,
  "telegramId": "123456789",
  "telegramUsername": "ivanov",
  "emailNotifications": true,
  "smsNotifications": true,
  "telegramNotifications": true,
  "marketingConsent": false,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLoginAt": "2025-10-27T12:00:00.000Z"
}
```

### 5. Обновление профиля

```http
PATCH /api/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Иван",
  "lastName": "Иванов",
  "email": "new@example.com",
  "dateOfBirth": "1990-01-15",
  "gender": "MALE",
  "emailNotifications": true,
  "marketingConsent": true
}
```

## Переменные окружения

Добавьте в `.env`:

```env
# SMSC.ru API credentials
SMSC_LOGIN=your_login
SMSC_PASSWORD=your_password
SMSC_SENDER=5LB

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token

# JWT
JWT_SECRET=your_secret_key
```

## Особенности реализации

1. **Защита от спама**: Нельзя запросить новый код раньше чем через 60 секунд
2. **Ограничение попыток**: Максимум 3 попытки ввода кода
3. **TTL кодов**: Коды действительны 5 минут
4. **Telegram validation**: Проверка hash для безопасности
5. **Auto-merge**: Если пользователь входит через Telegram, но у него уже есть аккаунт с этим номером - аккаунты объединяются

## Состояния пользователя

1. **Новый пользователь** - `isNewUser: true` - показываем форму регистрации
2. **Существующий** - `isNewUser: false` - сразу авторизуем
3. **Неполный профиль** - отсутствуют firstName/lastName - просим заполнить

## Следующие шаги

1. Реализовать endpoints на backend
2. Применить миграции БД
3. Настроить SMSC.ru аккаунт
4. Создать Telegram бота
5. Протестировать flow авторизации
