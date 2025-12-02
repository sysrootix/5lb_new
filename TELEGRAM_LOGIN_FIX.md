# Исправление проблемы с перенаправлением на регистрацию после входа через Telegram

## Проблема

После входа через Telegram WebApp пользователи, которые уже завершили регистрацию, перенаправлялись на страницу `/complete-registration` вместо главной страницы.

## Причина

Backend возвращал флаг `needsRegistration: !user.isRegistrationComplete`, но у некоторых пользователей поле `isRegistrationComplete` было установлено в `false`, даже если они уже заполнили все обязательные поля (имя, фамилия, дата рождения).

## Решение

### 1. Изменения на Frontend

Добавлена дополнительная проверка `isRegistrationComplete` из объекта пользователя перед перенаправлением на страницу регистрации:

**Файлы:**
- `frontend/src/App.tsx` - автоматический вход через Telegram WebApp
- `frontend/src/pages/Login.tsx` - вход через Telegram (кнопка и WebApp)
- `frontend/src/pages/CompleteRegistration.tsx` - редирект на главную, если регистрация уже завершена

**Логика:**
```typescript
// Теперь перенаправление происходит только если ОБА условия выполнены
if (response.needsRegistration && !response.user.isRegistrationComplete) {
  navigate('/complete-registration');
} else {
  navigate('/');
}
```

### 2. Скрипт для исправления данных в базе

Создан скрипт `backend/scripts/fix-registration-complete.ts`, который автоматически устанавливает `isRegistrationComplete = true` для пользователей, у которых:
- Заполнены `firstName`, `lastName`
- Заполнена `dateOfBirth`
- Но `isRegistrationComplete = false`

**Запуск скрипта:**

```bash
cd backend
npm run fix:registration
```

Скрипт безопасен и только обновляет флаг для пользователей с заполненными данными.

## Тестирование

1. Войдите через Telegram WebApp с учётной записью, где регистрация уже завершена
2. Вы должны попасть на главную страницу (`/`), а не на страницу регистрации
3. Для новых пользователей всё должно работать как раньше - перенаправление на `/complete-registration`

## Дополнительные улучшения

### Страница CompleteRegistration

Теперь страница проверяет, завершена ли регистрация при монтировании:

```typescript
useEffect(() => {
  if (user?.isRegistrationComplete) {
    navigate('/', { replace: true });
  }
}, [user, navigate]);
```

Это предотвращает попытки повторно заполнить форму регистрации.

## Обратная совместимость

Все изменения обратно совместимы:
- Старая логика входа через SMS продолжает работать
- Новые пользователи проходят регистрацию как раньше
- Существующие пользователи с корректными данными больше не перенаправляются на регистрацию

## Миграция данных (опционально)

Если в базе данных есть пользователи со старыми данными, рекомендуется запустить скрипт исправления:

```bash
cd backend
npm run fix:registration
```

Скрипт покажет:
- Количество найденных пользователей с некорректным флагом
- Список обновлённых пользователей (телефон и имя)
- Количество обновлённых записей

## Затронутые файлы

### Frontend
- `frontend/src/App.tsx`
- `frontend/src/pages/Login.tsx`
- `frontend/src/pages/CompleteRegistration.tsx`

### Backend
- `backend/scripts/fix-registration-complete.ts` (новый файл)
- `backend/package.json` (добавлена команда `fix:registration`)

### Документация
- `TELEGRAM_LOGIN_FIX.md` (этот файл)

