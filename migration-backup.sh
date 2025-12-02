#!/bin/bash
# Скрипт резервного копирования для миграции 5LB на новый сервер
# Запускать на СТАРОМ сервере

set -e

echo "🔄 Начало резервного копирования для миграции..."

# Создаем директорию для бэкапа
BACKUP_DIR="/root/5lb-migration-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Директория бэкапа: $BACKUP_DIR"

# 1. Резервная копия базы данных PostgreSQL
echo "💾 Создание дампа базы данных..."
pg_dump -U lb_user -h localhost -d lb_db -F c -f "$BACKUP_DIR/lb_db.dump"
echo "✅ Дамп БД создан: lb_db.dump"

# 2. Также создаем SQL dump для удобства
pg_dump -U lb_user -h localhost -d lb_db > "$BACKUP_DIR/lb_db.sql"
echo "✅ SQL дамп создан: lb_db.sql"

# 3. Сохраняем .env файлы
echo "🔐 Копирование .env файлов..."
mkdir -p "$BACKUP_DIR/env"
cp /root/5lb/backend/.env "$BACKUP_DIR/env/backend.env"
cp /root/5lb/frontend/.env "$BACKUP_DIR/env/frontend.env"
cp /root/5lb/crm/crm_backend/.env "$BACKUP_DIR/env/crm_backend.env"
echo "✅ .env файлы скопированы"

# 4. Сохраняем конфигурацию PM2
echo "⚙️  Сохранение конфигурации PM2..."
pm2 save
cp ~/.pm2/dump.pm2 "$BACKUP_DIR/pm2-processes.json" 2>/dev/null || echo "⚠️  PM2 dump не найден"
cp /root/5lb/ecosystem.config.js "$BACKUP_DIR/ecosystem.config.js"
pm2 list > "$BACKUP_DIR/pm2-list.txt"
echo "✅ Конфигурация PM2 сохранена"

# 5. Сохраняем конфигурацию Nginx
echo "🌐 Сохранение конфигурации Nginx..."
mkdir -p "$BACKUP_DIR/nginx"
cp /etc/nginx/nginx.conf "$BACKUP_DIR/nginx/nginx.conf" 2>/dev/null || echo "⚠️  nginx.conf не найден"
cp -r /etc/nginx/sites-enabled/ "$BACKUP_DIR/nginx/sites-enabled/" 2>/dev/null || echo "⚠️  sites-enabled не найден"
cp -r /etc/nginx/sites-available/ "$BACKUP_DIR/nginx/sites-available/" 2>/dev/null || echo "⚠️  sites-available не найден"
echo "✅ Конфигурация Nginx сохранена"

# 6. Архивируем код проекта (без node_modules)
echo "📦 Архивирование кода проекта..."
cd /root
tar --exclude='5lb/node_modules' \
    --exclude='5lb/frontend/node_modules' \
    --exclude='5lb/backend/node_modules' \
    --exclude='5lb/mobile/node_modules' \
    --exclude='5lb/crm/crm_backend/node_modules' \
    --exclude='5lb/frontend/dist' \
    --exclude='5lb/backend/dist' \
    --exclude='5lb/.git' \
    -czf "$BACKUP_DIR/5lb-code.tar.gz" 5lb/
echo "✅ Код проекта заархивирован"

# 6.1 Копируем скрипты миграции отдельно (для удобства)
echo "📋 Копирование скриптов миграции..."
mkdir -p "$BACKUP_DIR/migration-scripts"
cp /root/5lb/migration-*.sh "$BACKUP_DIR/migration-scripts/" 2>/dev/null || echo "⚠️  Скрипты миграции не найдены"
cp /root/5lb/ecosystem.config.new-server.js "$BACKUP_DIR/migration-scripts/" 2>/dev/null || echo "⚠️  ecosystem.config.new-server.js не найден"
cp /root/5lb/MIGRATION-*.md "$BACKUP_DIR/migration-scripts/" 2>/dev/null || echo "⚠️  Документация миграции не найдена"
echo "✅ Скрипты скопированы в migration-scripts/"

# 7. Сохраняем информацию о системе
echo "📝 Сохранение информации о системе..."
cat > "$BACKUP_DIR/system-info.txt" <<EOF
Дата резервного копирования: $(date)
Имя хоста: $(hostname)
IP адрес: $(hostname -I)
Версия ОС: $(lsb_release -d 2>/dev/null || cat /etc/os-release | grep PRETTY_NAME)
Версия Node.js: $(node -v)
Версия npm: $(npm -v)
Версия PostgreSQL: $(psql --version)
Версия PM2: $(pm2 -v)
Версия Nginx: $(nginx -v 2>&1)
EOF
echo "✅ Информация о системе сохранена"

# 8. Создаем README для восстановления
cat > "$BACKUP_DIR/README.md" <<'EOF'
# Резервная копия 5LB для миграции

## Содержимое

- `lb_db.dump` - бинарный дамп PostgreSQL (рекомендуется)
- `lb_db.sql` - текстовый SQL дамп (резервный вариант)
- `env/` - все .env файлы
- `nginx/` - конфигурация Nginx
- `ecosystem.config.js` - конфигурация PM2
- `pm2-*.txt/json` - список процессов PM2
- `5lb-code.tar.gz` - архив кода проекта
- `system-info.txt` - информация о старой системе

## Порядок восстановления

См. файл MIGRATION-GUIDE.md в корне проекта
EOF

# 9. Создаем контрольные суммы
echo "🔍 Создание контрольных сумм..."
cd "$BACKUP_DIR"
find . -type f -exec md5sum {} \; > checksums.md5
echo "✅ Контрольные суммы созданы"

# 10. Финальная информация
echo ""
echo "✨ Резервное копирование завершено!"
echo "📁 Все файлы сохранены в: $BACKUP_DIR"
echo ""
echo "📊 Размер бэкапа:"
du -sh "$BACKUP_DIR"
echo ""
echo "📋 Содержимое:"
ls -lh "$BACKUP_DIR"
echo ""
echo "🚀 Следующие шаги:"
echo "1. Скопируйте директорию $BACKUP_DIR на новый сервер"
echo "2. Используйте команду: scp -r $BACKUP_DIR user@new-server:/root/"
echo "3. На новом сервере запустите migration-restore.sh"
echo ""
