const fs = require('fs');
const path = require('path');

// Проверяем наличие sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp не установлен. Устанавливаю...');
  console.log('Запустите: npm install --save-dev sharp');
  process.exit(1);
}

const svgPath = path.join(__dirname, '..', '5lb_logo_RGB-07.svg');
const assetsDir = path.join(__dirname, 'assets');

// Создаем папку assets если её нет
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

async function generateIcons() {
  try {
    // Проверяем наличие SVG файла
    if (!fs.existsSync(svgPath)) {
      console.error(`SVG файл не найден: ${svgPath}`);
      process.exit(1);
    }

    console.log('Генерация иконок из SVG...\n');

    // 1. Основная иконка для iOS (1024x1024, белый фон)
    console.log('Создание icon.png (1024x1024)...');
    await sharp(svgPath)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .extend({
        top: 112,
        bottom: 112,
        left: 112,
        right: 112,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(path.join(assetsDir, 'icon.png'));
    console.log('✓ icon.png создан\n');

    // 2. Android Adaptive Icon (1024x1024, прозрачный фон)
    console.log('Создание adaptive-icon.png (1024x1024)...');
    await sharp(svgPath)
      .resize(800, 800, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .extend({
        top: 112,
        bottom: 112,
        left: 112,
        right: 112,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(path.join(assetsDir, 'adaptive-icon.png'));
    console.log('✓ adaptive-icon.png создан\n');

    // 3. Splash Screen (1242x2436, фон #FF6B00)
    console.log('Создание splash.png (1242x2436)...');
    const splashBg = { r: 255, g: 107, b: 0, alpha: 1 }; // #FF6B00
    
    await sharp(svgPath)
      .resize(600, 600, {
        fit: 'contain',
        background: splashBg
      })
      .extend({
        top: 918,
        bottom: 918,
        left: 321,
        right: 321,
        background: splashBg
      })
      .png()
      .toFile(path.join(assetsDir, 'splash.png'));
    console.log('✓ splash.png создан\n');

    console.log('✅ Все иконки успешно созданы!');
    console.log(`📁 Файлы находятся в: ${assetsDir}`);
    console.log('\nФайлы:');
    console.log('  - icon.png (1024x1024)');
    console.log('  - adaptive-icon.png (1024x1024)');
    console.log('  - splash.png (1242x2436)');
    
  } catch (error) {
    console.error('Ошибка при генерации иконок:', error);
    process.exit(1);
  }
}

generateIcons();

