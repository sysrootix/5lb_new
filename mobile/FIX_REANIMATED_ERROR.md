# Исправление ошибки react-native-reanimated

## Проблема
```
[!] Invalid `RNReanimated.podspec` file: [Reanimated] Unsupported React Native version. Please use 78 or newer..
```

## Причина
`react-native-reanimated` версии 3.6.0 требует React Native 78+, а в проекте используется React Native 0.73.0 (Expo SDK 50).

## Решение

### Шаг 1: Обновите зависимости

Версия уже исправлена в `package.json`. Теперь выполните:

```bash
cd mobile

# Удалите старые зависимости
rm -rf node_modules
rm -rf ios
rm package-lock.json

# Переустановите зависимости
npm install
```

### Шаг 2: Пересоздайте iOS папку

```bash
# Пересоздайте iOS проект
npx expo prebuild --platform ios --clean
```

### Шаг 3: Установите CocoaPods зависимости

```bash
cd ios
pod install
cd ..
```

### Шаг 4: Запустите приложение

```bash
npm run ios
```

## Альтернативное решение (если проблема сохраняется)

Если проблема все еще есть, попробуйте использовать точную версию:

```bash
npm install react-native-reanimated@3.3.0 --save-exact
```

Затем повторите шаги выше.

## Проверка версий

Проверьте совместимость версий:
- Expo SDK 50 → React Native 0.73
- React Native 0.73 → react-native-reanimated ~3.3.0

## Если ничего не помогает

Попробуйте обновить Expo SDK до последней версии (но это может потребовать обновления других зависимостей):

```bash
npx expo install --fix
```

Но это не рекомендуется, так как может привести к другим проблемам совместимости.

