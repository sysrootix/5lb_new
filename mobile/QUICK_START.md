# Быстрый старт для сборки мобильного приложения

## Шаг 1: Установка EAS CLI

```bash
npm install -g eas-cli
```

## Шаг 2: Вход в Expo

```bash
eas login
```

Если нет аккаунта:
```bash
eas register
```

## Шаг 3: Инициализация проекта

```bash
cd mobile
eas build:configure
```

Это создаст файл `eas.json`. Если файл не создался, скопируйте `eas.json.example` в `eas.json`:

```bash
cp eas.json.example eas.json
```

## Шаг 4: Настройка app.json

Убедитесь, что в `app.json` указаны правильные идентификаторы:

- iOS: `bundleIdentifier` (например, `com.fivelb.app`)
- Android: `package` (например, `com.fivelb.app`)

После первой сборки EAS автоматически добавит `projectId` в `app.json`.

## Шаг 5: Подготовка иконок

Создайте папку `assets` и добавьте:

- `icon.png` (1024x1024) - основная иконка
- `adaptive-icon.png` (1024x1024) - для Android
- `splash.png` (1242x2436) - splash screen

## Шаг 6: Сборка

### Android APK (для тестирования):

```bash
eas build --platform android --profile preview
```

### Android AAB (для Google Play):

```bash
eas build --platform android --profile production
```

### iOS (требует macOS и Apple Developer Account):

```bash
eas build --platform ios --profile production
```

## Шаг 7: Скачивание приложения

После завершения сборки скачайте файл:

```bash
eas build:download
```

Или используйте ссылку из дашборда Expo.

## Шаг 8: Публикация

### Google Play:

```bash
eas submit --platform android
```

### App Store:

```bash
eas submit --platform ios
```

---

## Переменные окружения

Для настройки API URL используйте EAS Secrets:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://app.5lb.pro/api
```

Или создайте файл `.env` в папке `mobile/`:

```env
EXPO_PUBLIC_API_URL=https://app.5lb.pro/api
```

---

## Полезные команды

```bash
# Просмотр всех сборок
eas build:list

# Статус последней сборки
eas build:view

# Локальная разработка
npm start

# Запуск на Android эмуляторе
npm run android

# Запуск на iOS симуляторе (только macOS)
npm run ios
```

---

Подробное руководство см. в [MOBILE_BUILD_GUIDE.md](../MOBILE_BUILD_GUIDE.md)

