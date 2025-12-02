#!/bin/bash

# Docker Deployment Script для 5LB
set -e

echo "====================================="
echo "  5LB Docker Deployment Script"
echo "====================================="
echo ""

# Проверка наличия .env файла
if [ ! -f .env ]; then
    echo "❌ Ошибка: .env файл не найден!"
    echo "Создайте .env файл на основе .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

echo "✅ .env файл найден"

# Опции
REBUILD=false
PULL_LATEST=false
BACKUP_DB=false

# Парсинг аргументов
while [[ $# -gt 0 ]]; do
    case $1 in
        --rebuild)
            REBUILD=true
            shift
            ;;
        --pull)
            PULL_LATEST=true
            shift
            ;;
        --backup)
            BACKUP_DB=true
            shift
            ;;
        *)
            echo "Неизвестная опция: $1"
            echo "Использование: $0 [--rebuild] [--pull] [--backup]"
            exit 1
            ;;
    esac
done

# Pull latest changes
if [ "$PULL_LATEST" = true ]; then
    echo ""
    echo "📥 Получение последних изменений из git..."
    git pull
fi

# Backup database
if [ "$BACKUP_DB" = true ]; then
    echo ""
    echo "💾 Создание бэкапа базы данных..."
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"

    if docker ps | grep -q 5lb-postgres; then
        docker exec 5lb-postgres pg_dump -U postgres 5lb_db > "$BACKUP_FILE"
        echo "✅ Бэкап сохранен: $BACKUP_FILE"
    else
        echo "⚠️  PostgreSQL контейнер не запущен, пропускаем бэкап"
    fi
fi

# Build/rebuild images
if [ "$REBUILD" = true ]; then
    echo ""
    echo "🔨 Пересборка Docker образов..."
    docker-compose build --no-cache
else
    echo ""
    echo "🔨 Сборка Docker образов (если нужно)..."
    docker-compose build
fi

# Stop old containers
echo ""
echo "🛑 Остановка старых контейнеров..."
docker-compose down

# Start new containers
echo ""
echo "🚀 Запуск контейнеров..."
docker-compose up -d

# Wait for services
echo ""
echo "⏳ Ожидание запуска сервисов (15 секунд)..."
sleep 15

# Check services status
echo ""
echo "📊 Статус сервисов:"
docker-compose ps

# Check health
echo ""
echo "🏥 Проверка здоровья сервисов..."

check_health() {
    local container=$1
    local status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health")

    if [ "$status" = "healthy" ]; then
        echo "  ✅ $container: healthy"
    elif [ "$status" = "no-health" ]; then
        echo "  ⚠️  $container: no healthcheck configured"
    else
        echo "  ⏳ $container: $status"
    fi
}

check_health "5lb-postgres"
check_health "5lb-backend"
check_health "5lb-crm-backend"
check_health "5lb-nginx"

echo ""
echo "====================================="
echo "  ✅ Деплой завершен!"
echo "====================================="
echo ""
echo "Полезные команды:"
echo "  docker-compose logs -f          # Просмотр всех логов"
echo "  docker-compose logs -f backend  # Логи backend"
echo "  docker-compose ps               # Статус контейнеров"
echo "  docker-compose down             # Остановить все"
echo "  docker stats                    # Мониторинг ресурсов"
echo ""
