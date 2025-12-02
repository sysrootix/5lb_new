# Настройка иконок и splash-экранов

## Требования к файлам

### Основная иконка (`icon.png`)
- **Размер:** 1024x1024 пикселей
- **Формат:** PNG
- **Прозрачность:** НЕ допускается (для iOS)
- **Содержимое:** Центрированная иконка на однотонном фоне

### Android Adaptive Icon (`adaptive-icon.png`)
- **Размер:** 1024x1024 пикселей
- **Формат:** PNG
- **Прозрачность:** Допускается
- **Важно:** Иконка должна быть центрирована, так как система может обрезать края

### Splash Screen (`splash.png`)
- **Размер:** 1242x2436 пикселей (iPhone) или 2048x2732 (iPad)
- **Формат:** PNG
- **Содержимое:** Логотип или изображение приложения на фоне цвета `#FF6B00`

## Создание иконок из SVG

У вас есть файл `5lb_logo_RGB-07.svg` в корне проекта. Вот несколько способов создать иконки:

### Способ 1: Онлайн-инструменты

1. **AppIcon.co** (https://www.appicon.co/)
   - Загрузите ваш SVG или PNG логотип
   - Генератор создаст все необходимые размеры автоматически

2. **IconKitchen** (https://icon.kitchen/)
   - Поддержка Android Adaptive Icons
   - Генерация для iOS и Android

3. **Expo Icon Generator** (через npm)
   ```bash
   npm install -g @expo/image-utils
   ```

### Способ 2: Использование ImageMagick/GraphicsMagick

Если у вас установлен ImageMagick:

```bash
# Создание icon.png (1024x1024)
convert 5lb_logo_RGB-07.svg -resize 1024x1024 -background white -gravity center -extent 1024x1024 mobile/assets/icon.png

# Создание adaptive-icon.png (1024x1024 с прозрачностью)
convert 5lb_logo_RGB-07.svg -resize 1024x1024 -background transparent -gravity center -extent 1024x1024 mobile/assets/adaptive-icon.png

# Создание splash.png (1242x2436)
convert 5lb_logo_RGB-07.svg -resize 600x600 -background "#FF6B00" -gravity center -extent 1242x2436 mobile/assets/splash.png
```

### Способ 3: Использование Figma/Sketch/Adobe Illustrator

1. Откройте ваш SVG в редакторе
2. Создайте новый файл с нужными размерами
3. Разместите логотип по центру
4. Экспортируйте как PNG

### Способ 4: Использование React Native Image Resizer

Если у вас уже есть React Native окружение:

```bash
cd mobile
npm install react-native-image-resizer
```

Затем создайте скрипт для генерации иконок.

## Структура папки assets

После создания файлов структура должна выглядеть так:

```
mobile/
  assets/
    icon.png              (1024x1024)
    adaptive-icon.png     (1024x1024)
    splash.png           (1242x2436 или 2048x2732)
```

## Проверка

После добавления файлов проверьте, что они правильно подключены в `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "backgroundColor": "#FF6B00"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    }
  }
}
```

## Тестирование

Запустите приложение локально, чтобы проверить иконки:

```bash
cd mobile
npm start
```

Затем откройте на устройстве или эмуляторе. Иконки будут видны:
- На рабочем столе устройства (после установки)
- В splash screen при запуске приложения
- В списке приложений

## Дополнительные ресурсы

- [Expo Icon Guidelines](https://docs.expo.dev/guides/app-icons/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [iOS App Icon Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)

