# Система cookie-сессий и расширенной регистрации 5LB

## Обзор

Реализована безопасная система аутентификации на основе cookie с поддержкой refresh токенов и расширенной регистрацией пользователей.

## Безопасность

### Cookie настройки
- **httpOnly: true** - защита от XSS атак (JavaScript не может прочитать cookie)
- **secure: true** (в production) - передача только по HTTPS
- **sameSite: 'strict'** - защита от CSRF атак
- **path: '/'** - доступно для всего приложения

### Токены
- **Access Token**: короткий срок жизни (15 минут), в httpOnly cookie
- **Refresh Token**: длинный срок жизни (30 дней), хранится в БД
- **Rotation**: при каждом обновлении старый refresh token удаляется, создается новый

### Отслеживание устройств
Каждый refresh token содержит:
- `userAgent` - браузер/приложение
- `ipAddress` - IP адрес
- `expiresAt` - время истечения

## API Endpoints

### Публичные

#### POST /api/auth/login
Запрос кода подтверждения на телефон
```json
{
  "phone": "79991234567"
}
```

#### POST /api/auth/verify
Верификация кода и вход/регистрация
```json
{
  "phone": "79991234567",
  "code": "1234"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "phone": "79991234567",
    "firstName": "...",
    "lastName": "...",
    "isRegistrationComplete": false
  },
  "isNewUser": true,
  "needsRegistration": true
}
```

Cookies устанавливаются автоматически.

#### POST /api/auth/telegram
Вход через Telegram
```json
{
  "initData": "query_id=..."
}
```

**Response:** аналогично `/verify`

#### POST /api/auth/refresh
Обновление access token используя refresh token из cookie
```json
{}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "phone": "...",
    "displayName": "...",
    "isRegistrationComplete": true
  }
}
```

### Защищенные (требуют аутентификации)

#### POST /api/auth/complete-registration
Завершение регистрации с дополнительными данными
```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "middleName": "Иванович",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "referredByCode": "ABC12345"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "firstName": "Иван",
    "lastName": "Иванов",
    "middleName": "Иванович",
    "referralCode": "XYZ98765",
    "isRegistrationComplete": true
  }
}
```

#### POST /api/auth/logout
Выход из текущей сессии
```json
{}
```

#### POST /api/auth/logout-all
Выход со всех устройств
```json
{}
```

## База данных

### Модель User (расширена)
```prisma
model User {
  // Персональные данные
  firstName    String?
  lastName     String?
  middleName   String?  // Отчество
  dateOfBirth  DateTime?
  gender       Gender?

  // Реферальная система
  referralCode String?  @unique
  referredById String?
  referredBy   User?    @relation("Referrals", fields: [referredById], references: [id])
  referrals    User[]   @relation("Referrals")

  // Метаданные
  isRegistrationComplete Boolean @default(false)

  // Refresh токены
  refreshTokens RefreshToken[]
}
```

### Модель RefreshToken (новая)
```prisma
model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  expiresAt DateTime
  createdAt DateTime @default(now())

  // Отслеживание устройств
  userAgent String?
  ipAddress String?
}
```

## Frontend

### authStore (обновлен)
```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  needsRegistration: boolean;

  setUser: (user: User | null) => void;
  logout: () => void;
}
```

### Новые страницы
- `/complete-registration` - форма завершения регистрации

### Обновленный flow
1. Вход → проверка `needsRegistration`
2. Если `true` → `/complete-registration`
3. Заполнение ФИО, даты рождения, реферального кода
4. Получение собственного реферального кода
5. Редирект на главную

## Реферальная система

### Генерация кода
- 8 символов (буквы и цифры)
- Проверка уникальности
- Автоматическая генерация при завершении регистрации

### Бонусы
- Приглашенный получает свой реферальный код
- Пригласивший получает **500 бонусов** на счет

### Валидация
- Проверка существования кода
- Нельзя использовать свой собственный код
- Код можно указать только при первой регистрации

## Безопасные практики

### Token Rotation
При каждом `/refresh`:
1. Проверяем refresh token из cookie
2. Удаляем старый refresh token из БД
3. Генерируем новый access + refresh токены
4. Возвращаем новые cookies

### Logout
- `/logout` - удаляет только текущий refresh token
- `/logout-all` - удаляет ВСЕ refresh токены пользователя

### Автоматическая очистка
```typescript
export const cleanupExpiredTokens = async () => {
  const deleted = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } }
  });
  return deleted.count;
};
```

Рекомендуется запускать по cron (например, раз в день).

## Миграция с старой системы

**Было:**
- JWT токены в JSON response
- Хранение в localStorage
- Нет защиты от XSS
- Долгий срок жизни токенов

**Стало:**
- httpOnly cookies (защита от XSS)
- Refresh tokens в БД
- Короткие access tokens (15 мин)
- Rotation при каждом обновлении
- Отслеживание устройств

## Примеры использования

### Frontend (axios with credentials)
```typescript
const { data } = await http.post<AuthResponse>(
  '/auth/verify',
  { phone, code },
  { withCredentials: true } // ВАЖНО!
);
```

### Обновление токена
```typescript
try {
  await refreshToken();
} catch (error) {
  // Редирект на /login
}
```

### Выход
```typescript
await logout();
clearAuthCookies(res);
navigate('/login');
```

## Troubleshooting

### Пользователь выходит при смене IP
✅ **Решено** - refresh token продолжает работать, IP записывается только для логирования

### Access token истек
✅ **Решено** - автоматический refresh через `/auth/refresh`

### CORS ошибки
Проверьте `corsOptions`:
```typescript
{
  origin: env.corsAllowedOrigins,
  credentials: true // ВАЖНО!
}
```

### Cookie не устанавливаются
- Проверьте `secure: true` только для production
- Убедитесь что `sameSite: 'strict'` совместим с вашим фронтендом
- Добавьте `withCredentials: true` в axios запросы

## Рекомендации

1. **Production:** установите `NODE_ENV=production` для `secure: true`
2. **Monitoring:** логируйте refresh token usage для анализа
3. **Cleanup:** настройте cron для `cleanupExpiredTokens()`
4. **Rate limiting:** добавьте ограничение на `/auth/refresh`
5. **HTTPS:** всегда используйте HTTPS в production

## Changelog

### v2.0.0 - Cookie Authentication
- ✅ httpOnly cookies для токенов
- ✅ Refresh token rotation
- ✅ Расширенная регистрация (ФИО, дата рождения)
- ✅ Реферальная система с бонусами
- ✅ Отслеживание устройств
- ✅ Logout со всех устройств
- ✅ Интеграция в Telegram flow

