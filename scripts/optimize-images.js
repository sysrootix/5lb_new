#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Конфигурация
const MAX_SIZE_KB = 500;
const MAX_SIZE_BYTES = MAX_SIZE_KB * 1024;
const TARGET_DIR = path.join(__dirname, '../frontend/public');
const BACKUP_DIR = path.join(__dirname, '../frontend/public/.image-backups');

// Поддерживаемые форматы
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Проверка наличия sharp
function checkSharpInstalled() {
  try {
    require('sharp');
    return true;
  } catch (e) {
    return false;
  }
}

// Рекурсивный поиск всех изображений
function findAllImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    // Пропускаем директорию с бэкапами
    if (filePath.includes('.image-backups')) {
      return;
    }

    if (stat.isDirectory()) {
      findAllImages(filePath, fileList);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        fileList.push({
          path: filePath,
          size: stat.size,
          name: file,
          ext: ext,
        });
      }
    }
  });

  return fileList;
}

// Создание бэкапа
function createBackup(filePath) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const fileName = path.basename(filePath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `${timestamp}_${fileName}`);

  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Оптимизация изображения
async function optimizeImage(filePath, ext) {
  const sharp = require('sharp');

  const image = sharp(filePath);
  const metadata = await image.metadata();

  let optimized;

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      optimized = image.jpeg({
        quality: 85,
        progressive: true,
        mozjpeg: true,
      });
      break;

    case '.png':
      optimized = image.png({
        quality: 85,
        compressionLevel: 9,
        palette: true,
      });
      break;

    case '.webp':
      optimized = image.webp({
        quality: 85,
        effort: 6,
      });
      break;

    default:
      throw new Error(`Unsupported format: ${ext}`);
  }

  // Если изображение слишком большое, уменьшаем размеры
  if (metadata.width > 2000) {
    optimized = optimized.resize(2000, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  const buffer = await optimized.toBuffer();
  return buffer;
}

// Форматирование размера
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Главная функция
async function main() {
  log('\n🔍 Image Optimizer Script\n', 'bright');
  log(`📁 Scanning directory: ${TARGET_DIR}`, 'cyan');
  log(`📏 Max size threshold: ${MAX_SIZE_KB} KB\n`, 'cyan');

  // Проверка установки sharp
  if (!checkSharpInstalled()) {
    log('❌ Package "sharp" is not installed!', 'red');
    log('\nInstalling sharp...', 'yellow');
    try {
      execSync('npm install sharp', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      log('✅ Sharp installed successfully!\n', 'green');
    } catch (error) {
      log('❌ Failed to install sharp. Please run: npm install sharp', 'red');
      process.exit(1);
    }
  }

  // Поиск всех изображений
  log('🔎 Finding all images...', 'yellow');
  const allImages = findAllImages(TARGET_DIR);
  log(`📊 Found ${allImages.length} images total\n`, 'blue');

  // Фильтрация больших изображений
  const largeImages = allImages.filter((img) => img.size > MAX_SIZE_BYTES);

  if (largeImages.length === 0) {
    log('✅ No images larger than 500KB found! All good! 🎉', 'green');
    return;
  }

  log(`⚠️  Found ${largeImages.length} images larger than ${MAX_SIZE_KB} KB:\n`, 'yellow');

  // Вывод списка больших изображений
  largeImages.forEach((img, index) => {
    const relativePath = path.relative(TARGET_DIR, img.path);
    log(
      `${index + 1}. ${relativePath} - ${formatSize(img.size)}`,
      img.size > MAX_SIZE_BYTES * 2 ? 'red' : 'yellow'
    );
  });

  log('\n🔧 Starting optimization...\n', 'bright');

  const sharp = require('sharp');
  let optimizedCount = 0;
  let totalSaved = 0;

  // Оптимизация каждого изображения
  for (const img of largeImages) {
    const relativePath = path.relative(TARGET_DIR, img.path);

    try {
      log(`⚙️  Processing: ${relativePath}`, 'cyan');

      // Создаем бэкап
      const backupPath = createBackup(img.path);
      log(`   💾 Backup created`, 'blue');

      // Оптимизируем
      const optimizedBuffer = await optimizeImage(img.path, img.ext);
      const newSize = optimizedBuffer.length;
      const saved = img.size - newSize;
      const savedPercent = ((saved / img.size) * 100).toFixed(1);

      // Сохраняем оптимизированное изображение
      fs.writeFileSync(img.path, optimizedBuffer);

      optimizedCount++;
      totalSaved += saved;

      log(
        `   ✅ Optimized: ${formatSize(img.size)} → ${formatSize(newSize)} (saved ${savedPercent}%)`,
        'green'
      );
    } catch (error) {
      log(`   ❌ Error: ${error.message}`, 'red');
    }

    log(''); // Пустая строка для разделения
  }

  // Итоговая статистика
  log('═'.repeat(60), 'bright');
  log('\n📊 Summary:\n', 'bright');
  log(`✅ Optimized: ${optimizedCount} / ${largeImages.length} images`, 'green');
  log(`💾 Total saved: ${formatSize(totalSaved)}`, 'green');
  log(`📁 Backups location: ${path.relative(process.cwd(), BACKUP_DIR)}`, 'blue');
  log('\n🎉 Done!\n', 'bright');
}

// Запуск
main().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
