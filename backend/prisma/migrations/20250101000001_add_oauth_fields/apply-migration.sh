#!/bin/bash

# Скрипт для применения миграции OAuth полей
# Использование: ./apply-oauth-migration.sh

set -e

echo "🚀 Применение миграции OAuth полей"
echo "=================================="

# Определяем путь к директории миграции
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
MIGRATION_DIR="$PROJECT_ROOT/backend/prisma/migrations/20250101000001_add_oauth_fields"

if [ ! -f "$MIGRATION_DIR/migration.sql" ]; then
  echo "❌ Файл миграции не найден: $MIGRATION_DIR/migration.sql"
  exit 1
fi

# Извлекаем DATABASE_URL из .env файла
ENV_FILE="$PROJECT_ROOT/backend/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Файл .env не найден: $ENV_FILE"
  exit 1
fi

DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL не найден в .env файле"
  exit 1
fi

echo "📋 Применение SQL миграции..."
echo ""

# Применяем миграцию
psql "$DATABASE_URL" -f "$MIGRATION_DIR/migration.sql"

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Миграция успешно применена!"
  echo ""
  echo "📝 Теперь нужно:"
  echo "   1. Запустить: cd backend && npx prisma generate"
  echo "   2. Настроить OAuth credentials в .env файле"
  echo "   3. См. инструкции в OAUTH_SETUP.md"
else
  echo ""
  echo "❌ Ошибка при применении миграции"
  exit 1
fi













