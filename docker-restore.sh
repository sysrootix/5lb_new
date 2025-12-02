#!/bin/bash

# Database Restore Script для 5LB Docker
set -e

echo "====================================="
echo "  5LB Database Restore Script"
echo "====================================="
echo ""

# Проверка аргумента
if [ -z "$1" ]; then
    echo "❌ Ошибка: Укажите файл бэкапа!"
    echo "Использование: $0 <backup_file.sql>"
    echo ""
    echo "Доступные бэкапы:"
    ls -lh ./backups/ 2>/dev/null || echo "  (нет бэкапов)"
    exit 1
fi

BACKUP_FILE="$1"

# Проверка существования файла
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Ошибка: Файл не найден: $BACKUP_FILE"
    exit 1
fi

# Проверка, что PostgreSQL контейнер запущен
if ! docker ps | grep -q 5lb-postgres; then
    echo "❌ Ошибка: PostgreSQL контейнер не запущен!"
    echo "Запустите его командой: docker-compose up -d postgres"
    exit 1
fi

echo "⚠️  ВНИМАНИЕ!"
echo "Эта операция удалит все текущие данные в базе и восстановит их из бэкапа."
echo "Файл бэкапа: $BACKUP_FILE"
echo ""
read -p "Продолжить? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Отменено."
    exit 0
fi

# Если файл сжат - распаковываем
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "📦 Распаковка бэкапа..."
    gunzip -c "$BACKUP_FILE" > /tmp/restore_temp.sql
    RESTORE_FILE="/tmp/restore_temp.sql"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Восстановление
echo "🔄 Восстановление базы данных..."
echo ""

# Удаляем и создаем базу заново
docker exec 5lb-postgres psql -U postgres -c "DROP DATABASE IF EXISTS 5lb_db;"
docker exec 5lb-postgres psql -U postgres -c "CREATE DATABASE 5lb_db;"

# Импортируем данные
docker exec -i 5lb-postgres psql -U postgres 5lb_db < "$RESTORE_FILE"

# Удаляем временный файл
if [[ $BACKUP_FILE == *.gz ]]; then
    rm -f /tmp/restore_temp.sql
fi

echo ""
echo "✅ База данных успешно восстановлена!"
echo ""
echo "Рекомендуется перезапустить backend сервисы:"
echo "  docker-compose restart backend crm-backend"
echo ""
