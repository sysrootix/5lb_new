# Мобильное приложение 5LB

Мобильное приложение для iOS и Android, построенное на React Native и Expo.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
cd mobile
npm install
```

### 2. Подготовка иконок

Создайте папку `assets` и добавьте необходимые файлы (см. [ASSETS_SETUP.md](./ASSETS_SETUP.md)):

```bash
mkdir -p assets
# Добавьте: icon.png, adaptive-icon.png, splash.png
```

### 3. Настройка переменных окружения

Создайте файл `.env` (опционально):

```env
EXPO_PUBLIC_API_URL=https://app.5lb.pro/api
```

Или используйте EAS Secrets (рекомендуется для продакшена).

### 4. Запуск в режиме разработки

```bash
npm start
```

Затем выберите:
- `a` - для Android эмулятора/устройства
- `i` - для iOS симулятора (только macOS)

Или используйте:

```bash
npm run android  # Android
npm run ios      # iOS (только macOS)
```

## 📱 Сборка для продакшена

### Android

#### Через EAS Build (рекомендуется):

```bash
# Установите EAS CLI
npm install -g eas-cli

# Войдите в Expo
eas login

# Настройте проект
eas build:configure

# Соберите APK (для тестирования)
eas build --platform android --profile preview

# Соберите AAB (для Google Play)
eas build --platform android --profile production
```

#### Локальная сборка:

```bash
npm run android
```

### iOS

⚠️ **Требуется macOS и Apple Developer Account ($99/год)**

```bash
# Установите EAS CLI
npm install -g eas-cli

# Войдите в Expo
eas login

# Настройте проект
eas build:configure

# Настройте сертификаты
eas credentials

# Соберите для iOS
eas build --platform ios --profile production
```

## 📦 Публикация в магазины

### Google Play Store

1. Создайте аккаунт разработчика в [Google Play Console](https://play.google.com/console) ($25)
2. Соберите AAB файл (см. выше)
3. Загрузите через EAS:

```bash
eas submit --platform android
```

Или вручную через Google Play Console.

### Apple App Store

1. Убедитесь, что у вас есть Apple Developer Account ($99/год)
2. Создайте App ID в Apple Developer Portal
3. Соберите IPA файл (см. выше)
4. Загрузите через EAS:

```bash
eas submit --platform ios
```

Или через Xcode → App Store Connect.

## 📚 Документация

- **[QUICK_START.md](./QUICK_START.md)** - Быстрое руководство по сборке
- **[ASSETS_SETUP.md](./ASSETS_SETUP.md)** - Настройка иконок и splash-экранов
- **[IOS_TESTING_GUIDE.md](./IOS_TESTING_GUIDE.md)** - Тестирование iOS без платного аккаунта
- **[FREE_DEVICE_TESTING.md](./FREE_DEVICE_TESTING.md)** - Бесплатное тестирование на реальных устройствах
- **[TESTFLIGHT_GUIDE.md](./TESTFLIGHT_GUIDE.md)** - Что такое TestFlight и как использовать
- **[../MOBILE_BUILD_GUIDE.md](../MOBILE_BUILD_GUIDE.md)** - Подробное руководство

## 🛠️ Структура проекта

```
mobile/
├── src/
│   ├── components/      # Переиспользуемые компоненты
│   ├── navigation/      # Настройка навигации
│   ├── screens/         # Экраны приложения
│   ├── services/        # API сервисы
│   └── store/           # Zustand stores
├── assets/              # Иконки и изображения
├── App.tsx              # Точка входа
├── app.json             # Конфигурация Expo
├── package.json         # Зависимости
└── eas.json            # Конфигурация EAS Build
```

## 🔧 Полезные команды

```bash
# Разработка
npm start                # Запуск Metro bundler
npm run android          # Запуск на Android
npm run ios              # Запуск на iOS (macOS)

# Сборка
eas build:list           # Список всех сборок
eas build:view           # Статус последней сборки
eas build:download       # Скачать собранное приложение

# Публикация
eas submit --platform android  # Отправить в Google Play
eas submit --platform ios     # Отправить в App Store

# Обновление через OTA (без пересборки)
eas update --branch production --message "Bug fixes"
```

## 🐛 Решение проблем

### Android

**Проблема:** "SDK location not found"
- Установите Android Studio
- Настройте переменную `ANDROID_HOME`

**Проблема:** "JDK not found"
- Установите JDK 17+
- Настройте переменную `JAVA_HOME`

### iOS

**Проблема:** "No provisioning profile found"
- Запустите `eas credentials`
- Настройте сертификаты в Apple Developer Portal

**Проблема:** "Code signing error"
- Убедитесь, что Bundle ID совпадает в `app.json` и Apple Developer Portal

## 📝 Обновление версии

При обновлении приложения увеличьте версию:

1. **app.json:**
```json
{
  "expo": {
    "version": "1.0.1",
    "ios": { "buildNumber": "2" },
    "android": { "versionCode": 2 }
  }
}
```

2. Соберите новую версию:
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

3. Загрузите в магазины:
```bash
eas submit --platform android
eas submit --platform ios
```

## 🔗 Полезные ссылки

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [React Native](https://reactnative.dev/)
- [Expo Forums](https://forums.expo.dev/)

