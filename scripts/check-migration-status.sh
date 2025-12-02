#!/bin/bash

# Скрипт для проверки состояния миграции

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Проверка состояния миграции${NC}"
echo "=================================="

# Определяем директорию скрипта и корень проекта
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"
BACKEND_DIR="$PROJECT_ROOT/backend"

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

echo -e "${GREEN}✅ Подключение к базе данных...${NC}"
echo ""

# Проверка таблиц
echo -e "${YELLOW}📊 Проверка таблиц:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'catalog_subcategories') 
         THEN '✅ catalog_subcategories существует'
         ELSE '❌ catalog_subcategories НЕ существует'
    END as subcategories_status,
    CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'catalog_brands') 
         THEN '✅ catalog_brands существует'
         ELSE '❌ catalog_brands НЕ существует'
    END as brands_status;
"

echo ""

# Проверка полей в catalog_products
echo -e "${YELLOW}📊 Проверка полей в catalog_products:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'catalog_products' AND column_name = 'subcategoryId'
    ) THEN '✅ subcategoryId существует'
    ELSE '❌ subcategoryId НЕ существует'
    END as subcategory_id_status,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'catalog_products' AND column_name = 'brandId'
    ) THEN '✅ brandId существует'
    ELSE '❌ brandId НЕ существует'
    END as brand_id_status;
"

echo ""

# Статистика данных
echo -e "${YELLOW}📊 Статистика данных:${NC}"
psql "$DATABASE_URL" -c "
SELECT 
    (SELECT COUNT(*) FROM catalog_subcategories) as subcategories_count,
    (SELECT COUNT(*) FROM catalog_brands) as brands_count,
    (SELECT COUNT(*) FROM catalog_products WHERE \"subcategoryId\" IS NOT NULL) as products_with_subcategory,
    (SELECT COUNT(*) FROM catalog_products WHERE \"brandId\" IS NOT NULL) as products_with_brand;
"

echo ""
echo -e "${GREEN}✅ Проверка завершена${NC}"

