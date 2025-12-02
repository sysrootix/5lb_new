#!/bin/bash

# Database Backup Script для 5LB Docker
set -e

echo "====================================="
echo "  5LB Database Backup Script"
echo "====================================="
echo ""

# Проверка, что PostgreSQL контейнер запущен
if ! docker ps | grep -q 5lb-postgres; then
    echo "❌ Ошибка: PostgreSQL контейнер не запущен!"
    echo "Запустите его командой: docker-compose up -d postgres"
    exit 1
fi

# Создание директории для бэкапов
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Имя файла с датой
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/5lb_backup_$TIMESTAMP.sql"

echo "📦 Создание бэкапа базы данных..."
echo "Файл: $BACKUP_FILE"
echo ""

# Создание бэкапа
docker exec 5lb-postgres pg_dump -U postgres 5lb_db > "$BACKUP_FILE"

# Проверка размера
FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

echo "✅ Бэкап успешно создан!"
echo "   Размер: $FILE_SIZE"
echo "   Путь: $BACKUP_FILE"
echo ""

# Список всех бэкапов
echo "📋 Все бэкапы:"
ls -lh "$BACKUP_DIR"
echo ""

# Опция сжатия
read -p "Сжать бэкап? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗜️  Сжатие бэкапа..."
    gzip "$BACKUP_FILE"
    echo "✅ Бэкап сжат: ${BACKUP_FILE}.gz"
fi

echo ""
echo "====================================="
echo "  Готово!"
echo "====================================="
