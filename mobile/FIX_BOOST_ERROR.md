# Исправление ошибки установки boost

## Проблема
```
[!] Error installing boost
Verification checksum was incorrect, expected 6478edfe2f3305127cffe8caf73ea0176c53769f4bf1585be237eb30798c3b8e, got 9c2f4b99bc7ddb95a8babff8ba78a4108aa0951243ea919166a7e2e279825502
```

## Причина
Проблема с кэшем CocoaPods или поврежденный файл boost. Также может быть проблема с путями в monorepo.

## Решение

### Вариант 1: Очистка кэша CocoaPods (рекомендуется)

```bash
cd mobile/ios

# Очистите кэш CocoaPods
pod cache clean --all
rm -rf ~/Library/Caches/CocoaPods
rm -rf Pods
rm Podfile.lock

# Вернитесь в mobile и переустановите
cd ..
rm -rf ios
npx expo prebuild --platform ios --clean

# Попробуйте снова установить pods
cd ios
pod install --repo-update
```

### Вариант 2: Установка boost вручную

Если проблема сохраняется:

```bash
cd mobile/ios

# Удалите кэш boost
pod cache clean boost --all

# Установите с пропуском проверки контрольной суммы (не рекомендуется, но работает)
pod install --repo-update --no-integrate

# Или попробуйте установить конкретную версию boost
# Отредактируйте Podfile и добавьте:
# pod 'boost', '1.83.0', :podspec => 'https://raw.githubusercontent.com/react-native-community/boost-for-react-native/v1.83.0/boost.podspec'
```

### Вариант 3: Использование Expo без prebuild

Если проблемы продолжаются, можно использовать Expo Go:

```bash
cd mobile
npm start
# Затем нажмите 'i' для iOS симулятора
```

Но это не позволит использовать нативные модули.

### Вариант 4: Исправление путей в monorepo

Если у вас monorepo и зависимости в корне:

```bash
# Из корня проекта
cd /root/5lb

# Убедитесь что react-native установлен
npm install

# Перейдите в mobile
cd mobile

# Проверьте что node_modules существует
ls -la ../node_modules/react-native

# Если нет, установите зависимости в корне
cd ..
npm install
cd mobile
npm install
```

## Быстрое решение (попробуйте сначала):

```bash
cd mobile

# Очистите все
rm -rf ios node_modules package-lock.json

# Очистите кэш CocoaPods
pod cache clean --all 2>/dev/null || true
rm -rf ~/Library/Caches/CocoaPods 2>/dev/null || true

# Переустановите зависимости
npm install

# Пересоздайте iOS проект
npx expo prebuild --platform ios --clean

# Войдите в ios папку
cd ios

# Очистите локальный кэш pods
rm -rf Pods Podfile.lock

# Установите pods с обновлением репозитория
pod install --repo-update

# Если все еще ошибка, попробуйте:
pod deintegrate
pod install --repo-update
```

## Если ничего не помогает

Попробуйте использовать более старую версию boost или обновить CocoaPods:

```bash
# Обновите CocoaPods
sudo gem install cocoapods
pod --version

# Или через Homebrew
brew upgrade cocoapods

# Затем повторите попытку
cd mobile/ios
pod install --repo-update
```

## Проверка окружения

Убедитесь что все правильно установлено:

```bash
# Проверьте версии
node --version
npm --version
pod --version
ruby --version

# Проверьте что CocoaPods использует правильный Ruby
which pod
which ruby
```

## Альтернатива: Использование EAS Build

Если локальная сборка продолжает вызывать проблемы, используйте EAS Build:

```bash
cd mobile
eas build --platform ios --profile development --local
```

Это соберет приложение локально, но используя контейнер с правильным окружением.

