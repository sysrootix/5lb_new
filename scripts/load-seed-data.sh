#!/bin/bash

# Скрипт для загрузки тестовых данных (бренды, подкатегории, товары)

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}📦 Загрузка тестовых данных${NC}"
echo "=================================="

# Определяем директорию скрипта и корень проекта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
MIGRATION_DIR="$PROJECT_ROOT/backend/prisma/migrations/20250101000000_add_subcategories_and_brands"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Проверяем наличие файла с тестовыми данными
if [ ! -f "$MIGRATION_DIR/seed_data.sql" ]; then
    echo -e "${RED}❌ Файл с тестовыми данными не найден: $MIGRATION_DIR/seed_data.sql${NC}"
    exit 1
fi

# Извлекаем DATABASE_URL
ENV_FILE="$BACKEND_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    # Извлекаем DATABASE_URL, учитывая что значение может быть на следующей строке
    DATABASE_URL=$(grep -A 0 "^DATABASE_URL=" "$ENV_FILE" | head -1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d ' ')
else
    DATABASE_URL="${DATABASE_URL}"
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL не найден${NC}"
    exit 1
fi

echo -e "${GREEN}✅ DATABASE_URL найден${NC}"
echo ""

# Загружаем тестовые данные
echo -e "${GREEN}📦 Загрузка тестовых данных...${NC}"
psql "$DATABASE_URL" -f "$MIGRATION_DIR/seed_data.sql" 2>&1 | grep -v "NOTICE:" || {
    echo -e "${YELLOW}⚠️  Произошли ошибки при загрузке тестовых данных${NC}"
    echo -e "${YELLOW}Это нормально, если данные уже существуют (используется ON CONFLICT DO NOTHING)${NC}"
}

echo ""
echo -e "${GREEN}✅ Тестовые данные загружены${NC}"
echo ""
echo -e "${GREEN}📊 Статистика загруженных данных:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    (SELECT COUNT(*) FROM catalog_brands) as brands_count,
    (SELECT COUNT(*) FROM catalog_subcategories) as subcategories_count,
    (SELECT COUNT(*) FROM catalog_products WHERE \"brandId\" IS NOT NULL) as products_with_brand,
    (SELECT COUNT(*) FROM catalog_products WHERE \"subcategoryId\" IS NOT NULL) as products_with_subcategory;
"

echo ""
echo -e "${GREEN}🎉 Готово!${NC}"

