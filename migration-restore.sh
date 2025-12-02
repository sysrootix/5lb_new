#!/bin/bash
# Скрипт восстановления для миграции 5LB на новый сервер
# Запускать на НОВОМ сервере после копирования бэкапа

set -e

echo "🚀 Начало восстановления 5LB на новом сервере..."

# Проверка что скрипт запускается от root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Пожалуйста, запустите скрипт от имени root"
  exit 1
fi

# Поиск директории бэкапа
BACKUP_DIR=$(ls -dt /root/5lb-migration-* 2>/dev/null | head -1)

if [ -z "$BACKUP_DIR" ]; then
  echo "❌ Директория бэкапа не найдена!"
  echo "Убедитесь что вы скопировали директорию 5lb-migration-* на этот сервер"
  exit 1
fi

echo "📁 Найдена директория бэкапа: $BACKUP_DIR"
echo ""

# Функция для запроса подтверждения
confirm() {
  read -p "❓ $1 (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    return 1
  fi
  return 0
}

# Проверка установленных зависимостей
echo "🔍 Проверка установленных зависимостей..."

if ! command -v node &> /dev/null; then
  echo "⚠️  Node.js не установлен!"
  if confirm "Установить Node.js 20.x?"; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
  else
    echo "❌ Node.js необходим для работы. Выход."
    exit 1
  fi
fi

if ! command -v psql &> /dev/null; then
  echo "⚠️  PostgreSQL не установлен!"
  if confirm "Установить PostgreSQL?"; then
    apt install -y postgresql postgresql-contrib
    systemctl start postgresql
    systemctl enable postgresql
  else
    echo "❌ PostgreSQL необходим для работы. Выход."
    exit 1
  fi
fi

if ! command -v pm2 &> /dev/null; then
  echo "⚠️  PM2 не установлен!"
  if confirm "Установить PM2?"; then
    npm install -g pm2
  else
    echo "❌ PM2 необходим для работы. Выход."
    exit 1
  fi
fi

if ! command -v nginx &> /dev/null; then
  echo "⚠️  Nginx не установлен!"
  if confirm "Установить Nginx?"; then
    apt install -y nginx
    systemctl start nginx
    systemctl enable nginx
  else
    echo "⚠️  Nginx не установлен, продолжаем без него..."
  fi
fi

echo "✅ Все зависимости установлены"
echo ""

# Восстановление базы данных
echo "💾 Восстановление базы данных..."

DB_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='lb_db'" || echo "")

if [ "$DB_EXISTS" = "1" ]; then
  echo "⚠️  База данных lb_db уже существует!"
  if confirm "Удалить существующую базу и создать новую?"; then
    sudo -u postgres psql -c "DROP DATABASE lb_db;"
    sudo -u postgres psql -c "CREATE DATABASE lb_db;"
  else
    echo "⚠️  Восстановление в существующую базу данных..."
  fi
else
  sudo -u postgres psql -c "CREATE DATABASE lb_db;"
fi

# Создание пользователя если не существует
USER_EXISTS=$(sudo -u postgres psql -tAc "SELECT 1 FROM pg_user WHERE usename='lb_user'" || echo "")

if [ "$USER_EXISTS" != "1" ]; then
  sudo -u postgres psql -c "CREATE USER lb_user WITH ENCRYPTED PASSWORD 'MLwNXtCr8lGjab7vhA7UWKw1J2uePa';"
fi

sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lb_db TO lb_user;"
sudo -u postgres psql -c "ALTER DATABASE lb_db OWNER TO lb_user;"

# Восстановление из дампа
echo "📥 Восстановление данных из дампа..."
if [ -f "$BACKUP_DIR/lb_db.dump" ]; then
  PGPASSWORD=MLwNXtCr8lGjab7vhA7UWKw1J2uePa pg_restore -U lb_user -h localhost -d lb_db -v "$BACKUP_DIR/lb_db.dump" 2>&1 | grep -v "already exists" || true
  echo "✅ Бинарный дамп восстановлен"
elif [ -f "$BACKUP_DIR/lb_db.sql" ]; then
  PGPASSWORD=MLwNXtCr8lGjab7vhA7UWKw1J2uePa psql -U lb_user -h localhost -d lb_db < "$BACKUP_DIR/lb_db.sql"
  echo "✅ SQL дамп восстановлен"
else
  echo "❌ Файл дампа не найден!"
  exit 1
fi

# Проверка восстановления БД
USER_COUNT=$(PGPASSWORD=MLwNXtCr8lGjab7vhA7UWKw1J2uePa psql -U lb_user -h localhost -d lb_db -tAc 'SELECT COUNT(*) FROM "User"' 2>/dev/null || echo "0")
echo "✅ База данных восстановлена. Пользователей: $USER_COUNT"
echo ""

# Распаковка кода
echo "📦 Распаковка кода проекта..."

if [ -d "/root/5lb" ]; then
  echo "⚠️  Директория /root/5lb уже существует!"
  if confirm "Создать резервную копию и заменить?"; then
    mv /root/5lb /root/5lb-old-$(date +%Y%m%d-%H%M%S)
  else
    echo "⚠️  Пропускаем распаковку кода..."
    cd /root/5lb
  fi
fi

if [ ! -d "/root/5lb" ]; then
  cd /root
  tar -xzf "$BACKUP_DIR/5lb-code.tar.gz"
  echo "✅ Код распакован"
fi

cd /root/5lb

# Восстановление .env файлов
echo "🔐 Восстановление .env файлов..."

if [ -f "$BACKUP_DIR/env/backend.env" ]; then
  cp "$BACKUP_DIR/env/backend.env" /root/5lb/backend/.env
  echo "✅ backend/.env восстановлен"
fi

if [ -f "$BACKUP_DIR/env/frontend.env" ]; then
  cp "$BACKUP_DIR/env/frontend.env" /root/5lb/frontend/.env
  echo "✅ frontend/.env восстановлен"
fi

if [ -f "$BACKUP_DIR/env/crm_backend.env" ]; then
  mkdir -p /root/5lb/crm/crm_backend
  cp "$BACKUP_DIR/env/crm_backend.env" /root/5lb/crm/crm_backend/.env
  echo "✅ crm/crm_backend/.env восстановлен"
fi

echo ""
echo "⚠️  ВАЖНО: Проверьте .env файлы и обновите URL-ы если нужно!"
echo "Файлы для проверки:"
echo "  - /root/5lb/backend/.env"
echo "  - /root/5lb/frontend/.env"
echo "  - /root/5lb/crm/crm_backend/.env"
echo ""

# Автоматическое обновление портов на новом сервере
echo "🔧 Обновление портов на новом сервере (60000-60010)..."
if [ -f "/root/5lb/migration-update-ports.sh" ]; then
  /root/5lb/migration-update-ports.sh
  echo "✅ Порты обновлены автоматически"
else
  echo "⚠️  Скрипт migration-update-ports.sh не найден"
  echo "⚠️  Порты останутся стандартными (4000, 5000)"
fi
echo ""

if ! confirm "Продолжить установку зависимостей?"; then
  echo "⚠️  Установка остановлена. Вы можете:"
  echo "  - Вручную отредактировать .env файлы"
  echo "  - Запустить ./migration-update-ports.sh для смены портов"
  echo "  - Запустить этот скрипт снова"
  exit 0
fi

# Установка зависимостей
echo "📚 Установка зависимостей..."

echo "  → Root dependencies..."
npm install --silent

echo "  → Frontend dependencies..."
npm install --workspace frontend --silent

echo "  → Backend dependencies..."
npm install --workspace backend --silent

echo "  → Mobile dependencies..."
npm install --workspace mobile --silent 2>/dev/null || echo "⚠️  Mobile workspace пропущен"

if [ -d "/root/5lb/crm/crm_backend" ]; then
  echo "  → CRM dependencies..."
  cd /root/5lb/crm/crm_backend
  npm install --silent
  cd /root/5lb
fi

echo "✅ Зависимости установлены"
echo ""

# Генерация Prisma Client
echo "🔧 Генерация Prisma Client..."
cd /root/5lb/backend
npx prisma generate
echo "✅ Prisma Client сгенерирован"
echo ""

# Сборка проектов
echo "🏗️  Сборка проектов..."

cd /root/5lb

echo "  → Building backend..."
npm run build:backend

echo "  → Building frontend..."
npm run build:frontend

if [ -d "/root/5lb/crm/crm_backend" ]; then
  echo "  → Building CRM..."
  cd /root/5lb/crm/crm_backend
  npm run build
  cd /root/5lb
fi

echo "✅ Все проекты собраны"
echo ""

# Настройка Nginx
if command -v nginx &> /dev/null && [ -d "$BACKUP_DIR/nginx/sites-available" ]; then
  echo "🌐 Настройка Nginx..."

  if confirm "Скопировать конфигурацию Nginx?"; then
    cp -r "$BACKUP_DIR/nginx/sites-available/"* /etc/nginx/sites-available/ 2>/dev/null || true

    echo "⚠️  Проверьте конфигурацию Nginx перед активацией!"
    echo "Файлы в /etc/nginx/sites-available/"
    ls -la /etc/nginx/sites-available/
    echo ""

    if confirm "Создать симлинки и активировать конфигурацию?"; then
      for conf in /etc/nginx/sites-available/*.conf; do
        if [ -f "$conf" ]; then
          ln -sf "$conf" /etc/nginx/sites-enabled/
        fi
      done

      if nginx -t; then
        systemctl reload nginx
        echo "✅ Nginx настроен и перезапущен"
      else
        echo "❌ Ошибка в конфигурации Nginx! Исправьте и запустите: systemctl reload nginx"
      fi
    fi
  fi
fi

echo ""

# Запуск через PM2
echo "🚀 Запуск приложений через PM2..."

cd /root/5lb

if confirm "Запустить приложения через PM2?"; then
  # Остановка существующих процессов если есть
  pm2 delete all 2>/dev/null || true

  # Запуск backend
  pm2 start ecosystem.config.js

  # Запуск CRM если существует
  if [ -f "/root/5lb/crm/crm_backend/dist/src/index.js" ]; then
    cd /root/5lb/crm/crm_backend
    pm2 start dist/src/index.js --name "5lb-crm-backend"
    cd /root/5lb
  fi

  # Сохранение конфигурации PM2
  pm2 save

  echo "✅ Приложения запущены"
  echo ""

  # Показать статус
  pm2 list
fi

echo ""
echo "✨ Восстановление завершено!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Проверьте статус сервисов:"
echo "   pm2 list"
echo "   pm2 logs"
echo "   systemctl status nginx"
echo ""
echo "2. Проверьте работу API:"
echo "   curl http://localhost:4000/api/health"
echo ""
echo "3. Проверьте работу frontend:"
echo "   curl -I http://localhost:80"
echo ""
echo "4. Если все работает - обновите DNS на новый IP"
echo ""
echo "5. Настройте SSL если нужно:"
echo "   certbot --nginx -d app.5lb.pro"
echo ""
echo "6. Настройте автозапуск PM2:"
echo "   pm2 startup"
echo "   # Выполните команду которую выведет pm2 startup"
echo ""
echo "📊 Полная документация: /root/5lb/MIGRATION-GUIDE.md"
echo ""
