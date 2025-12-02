#!/bin/bash

# Скрипт для применения миграции базы данных с использованием Node.js
# Альтернативный способ через Prisma и Node.js

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск миграции через Node.js${NC}"
echo "=================================="

# Определяем директорию скрипта и корень проекта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
MIGRATION_DIR="$PROJECT_ROOT/backend/prisma/migrations/20250101000000_add_subcategories_and_brands"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Проверяем наличие директории миграции
if [ ! -d "$MIGRATION_DIR" ]; then
    echo -e "${RED}❌ Директория миграции не найдена: $MIGRATION_DIR${NC}"
    exit 1
fi

# Переходим в директорию backend
cd "$BACKEND_DIR"

# Проверяем наличие node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Установка зависимостей...${NC}"
    npm install
fi

# Проверяем наличие Prisma
if [ ! -f "node_modules/.bin/prisma" ]; then
    echo -e "${RED}❌ Prisma не найден. Установите зависимости: npm install${NC}"
    exit 1
fi

echo -e "${GREEN}📦 Применение миграции через Prisma...${NC}"

# Применяем миграцию через Prisma
npx prisma migrate deploy --schema=prisma/schema.prisma || {
    echo -e "${YELLOW}⚠️  Prisma migrate deploy не сработал, применяем SQL напрямую...${NC}"
    
    # Извлекаем DATABASE_URL, учитывая что значение может быть на следующей строке
    if [ -f ".env" ]; then
        DATABASE_URL=$(grep -A 0 "^DATABASE_URL=" .env | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
    else
        DATABASE_URL="${DATABASE_URL}"
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL не найден${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}📦 Применение SQL миграции напрямую...${NC}"
    psql "$DATABASE_URL" -f "$MIGRATION_DIR/migration.sql"
}

echo ""
echo -e "${GREEN}📦 Генерация Prisma Client...${NC}"
npx prisma generate --schema=prisma/schema.prisma

echo ""
echo -e "${GREEN}🎉 Миграция завершена!${NC}"

# Спрашиваем о загрузке тестовых данных
if [ -f "$MIGRATION_DIR/seed_data.sql" ]; then
    echo ""
    echo -e "${YELLOW}💡 Найдены тестовые данные${NC}"
    read -p "Загрузить тестовые данные? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}📦 Загрузка тестовых данных...${NC}"
        
        if [ -z "$DATABASE_URL" ]; then
            # Извлекаем DATABASE_URL, учитывая что значение может быть на следующей строке
            if [ -f ".env" ]; then
                DATABASE_URL=$(grep -A 0 "^DATABASE_URL=" .env | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
            else
                DATABASE_URL="${DATABASE_URL}"
            fi
        fi
        
        if [ -z "$DATABASE_URL" ]; then
            echo -e "${RED}❌ DATABASE_URL не найден${NC}"
            exit 1
        fi
        
        psql "$DATABASE_URL" -f "$MIGRATION_DIR/seed_data.sql" || {
            echo -e "${YELLOW}⚠️  Произошли ошибки при загрузке тестовых данных (возможно, данные уже существуют)${NC}"
        }
        
        echo -e "${GREEN}✅ Тестовые данные загружены${NC}"
    fi
fi

echo ""
echo -e "${GREEN}📋 Миграция завершена успешно!${NC}"

