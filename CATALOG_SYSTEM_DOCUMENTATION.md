# Документация системы каталогов для франшизы MEDUSA

## 📋 Содержание

1. [Обзор системы](#обзор-системы)
2. [Архитектура](#архитектура)
3. [Установка и настройка](#установка-и-настройка)
4. [API Endpoints](#api-endpoints)
5. [Frontend компоненты](#frontend-компоненты)
6. [База данных](#база-данных)
7. [Интеграция с Balance API](#интеграция-с-balance-api)
8. [Использование](#использование)
9. [Troubleshooting](#troubleshooting)

---

## Обзор системы

Система каталогов предназначена для интеграции с Balance API (1С) франшизы MEDUSA. Она позволяет:

- Получать каталоги товаров из разных магазинов франшизы
- Автоматически обновлять данные каждые 30 минут
- Кэшировать данные для быстрого доступа
- Предоставлять удобный интерфейс для просмотра товаров
- Осуществлять поиск товаров по всем магазинам

### Ключевые особенности

✅ **Автоматическое обновление** - каталоги обновляются каждые 30 минут  
✅ **Кэширование** - данные кэшируются на 60 минут для быстрого доступа  
✅ **Безопасность** - использование клиентских сертификатов для SSL/TLS  
✅ **Fallback** - при недоступности API используются данные из БД  
✅ **Responsive дизайн** - адаптивный интерфейс для всех устройств  

---

## Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  ShopsPage  │  │ CatalogPage  │  │  catalog.ts  │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (Node.js)                       │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ catalogRoutes  │→ │catalogController │→ │catalogService│ │
│  └────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
           │                                        │
           ▼                                        ▼
┌──────────────────┐                  ┌──────────────────────┐
│   PostgreSQL     │                  │    Balance API       │
│   (Prisma ORM)   │                  │  (1С fransh-trade)   │
│                  │                  │  + SSL Certificate   │
└──────────────────┘                  └──────────────────────┘
```

---

## Установка и настройка

### 1. Установка зависимостей

```bash
cd /root/5lb/backend
npm install node-forge node-cron
```

### 2. Настройка переменных окружения

Добавьте в `.env` файл backend:

```env
# Balance API Configuration для франшизы
BALANCE_API_URL=https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData
BALANCE_API_USERNAME=ТерехинНА
BALANCE_API_PASSWORD=123455123

# Certificate Configuration
CERT_PATH=src/certs/terehin_n.cloud.mda-medusa.ru.p12
CERT_PASSWORD=000000000
```

### 3. Установка сертификата

```bash
# Создайте директорию для сертификатов (уже создана)
mkdir -p /root/5lb/backend/src/certs

# Скопируйте сертификат в директорию
cp terehin_n.cloud.mda-medusa.ru.p12 /root/5lb/backend/src/certs/

# Установите правильные права доступа
chmod 600 /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12
```

### 4. База данных

База данных уже настроена через Prisma. Таблицы созданы:

- `shop_locations` - магазины франшизы
- `catalog_products` - товары из каталогов
- `catalog_exclusions` - исключения (опционально)

### 5. Добавление магазинов

Добавьте магазины в базу данных:

```sql
INSERT INTO shop_locations (
  shop_code, 
  shop_name, 
  address, 
  city, 
  phone, 
  working_hours,
  priority_order,
  is_active
) VALUES 
  ('13', 'Калинина 10', 'г. Москва, ул. Калинина, д. 10', 'Москва', '+7 (495) 123-45-67', 'ПН-ВС 10:00-22:00', 1, true);
```

---

## API Endpoints

### Backend API

Все endpoints доступны по префиксу `/api/catalog`

#### 1. Получить список магазинов
```http
GET /api/catalog/shops
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "shopCode": "13",
      "shopName": "Калинина 10",
      "address": "г. Москва, ул. Калинина, д. 10",
      "city": "Москва",
      "phone": "+7 (495) 123-45-67",
      "workingHours": "ПН-ВС 10:00-22:00"
    }
  ]
}
```

#### 2. Получить каталог магазина
```http
GET /api/catalog/shop/:shopCode
```

**Пример:** `GET /api/catalog/shop/13`

**Ответ:**
```json
{
  "success": true,
  "data": {
    "shopname": "Калинина 10",
    "shop_id": "13",
    "categories": [
      {
        "id": "cat_123",
        "name": "Протеины",
        "products": [
          {
            "id": "prod_456",
            "name": "Whey Protein 2kg",
            "quanty": 10,
            "retail_price": 2500,
            "modifications": []
          }
        ]
      }
    ]
  },
  "cached": false
}
```

#### 3. Поиск товаров
```http
GET /api/catalog/search-products?q=протеин&shopCode=13
```

**Параметры:**
- `q` (обязательный) - поисковый запрос
- `shopCode` (опциональный) - код магазина для фильтрации

#### 4. Получить информацию о товаре
```http
GET /api/catalog/product/:productId?shopCode=13
```

#### 5. Получить товары магазина по категории
```http
GET /api/catalog/shop-products/:shopCode?categoryId=cat_123
```

#### 6. Получить статус кэша
```http
GET /api/catalog/status
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "cacheSize": 3,
    "lastUpdated": "2025-10-30T12:00:00.000Z",
    "cacheDuration": 3600000
  }
}
```

#### 7. Обновить каталоги вручную
```http
POST /api/catalog/update
```

**Ответ:**
```json
{
  "success": true,
  "message": "Обновление каталогов запущено"
}
```

---

## Frontend компоненты

### 1. ShopsPage (`/shops`)

Страница со списком всех магазинов франшизы.

**Основные функции:**
- Отображение списка магазинов с адресами и контактами
- Кнопки для открытия карт (Яндекс, 2ГИС, Google)
- Переход к каталогу конкретного магазина

**Использование:**
```tsx
import ShopsPage from './pages/ShopsPage';

// В роутинге
<Route path="/shops" element={<ShopsPage />} />
```

### 2. CatalogPage (`/catalog/:shopCode`)

Страница с каталогом товаров конкретного магазина.

**Основные функции:**
- Отображение товаров по категориям
- Фильтрация по категориям
- Поиск по названию товара
- Информация о наличии и ценах
- Отображение модификаций товаров

**Использование:**
```tsx
import CatalogPage from './pages/CatalogPage';

// В роутинге
<Route path="/catalog/:shopCode" element={<CatalogPage />} />
```

### 3. API клиент (`catalog.ts`)

Модуль для работы с API каталога.

**Основные функции:**
```typescript
import { 
  getShops, 
  getShopCatalog, 
  searchProducts,
  formatPrice,
  getStockStatus 
} from './api/catalog';

// Получить список магазинов
const shops = await getShops();

// Получить каталог магазина
const catalog = await getShopCatalog('13');

// Поиск товаров
const products = await searchProducts('протеин', '13');

// Форматирование цены
const price = formatPrice(2500); // "2 500 ₽"

// Статус наличия
const status = getStockStatus(10); // "В наличии"
```

---

## База данных

### Модели Prisma

#### ShopLocation
```prisma
model ShopLocation {
  id            String   @id @default(cuid())
  shopCode      String   @unique
  shopName      String
  address       String?
  city          String   @default("Москва")
  description   String?
  phone         String?
  workingHours  String?
  twogisUrl     String?
  yandexMapsUrl String?
  googleMapsUrl String?
  latitude      Float?
  longitude     Float?
  priorityOrder Int      @default(0)
  isActive      Boolean  @default(true)
  products      CatalogProduct[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### CatalogProduct
```prisma
model CatalogProduct {
  id              String       @id @default(cuid())
  externalId      String
  name            String
  categoryName    String?
  categoryId      String?
  retailPrice     Float?
  purchasePrice   Float?
  quantity        Float?
  characteristics Json?
  modifications   Json?
  shopCode        String
  shop            ShopLocation @relation(fields: [shopCode], references: [shopCode])
  shopName        String?
  isActive        Boolean      @default(true)
  lastUpdated     DateTime     @default(now())
  createdAt       DateTime     @default(now())
}
```

### SQL запросы

#### Добавить магазин
```sql
INSERT INTO shop_locations (
  shop_code, shop_name, address, city, phone, working_hours
) VALUES 
  ('14', 'Новый магазин', 'Адрес', 'Москва', '+7...', 'ПН-ВС 10:00-22:00');
```

#### Найти товары по названию
```sql
SELECT * FROM catalog_products 
WHERE is_active = true 
  AND name ILIKE '%протеин%'
LIMIT 50;
```

#### Статистика по магазинам
```sql
SELECT 
  shop_code,
  shop_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN quantity > 0 THEN 1 END) as in_stock
FROM catalog_products
WHERE is_active = true
GROUP BY shop_code, shop_name;
```

---

## Интеграция с Balance API

### Конфигурация

Система использует следующие параметры для подключения к Balance API:

- **URL:** `https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData`
- **Метод:** POST
- **Аутентификация:** Basic Auth + SSL Client Certificate
- **Username:** `ТерехинНА`
- **Password:** `123455123`
- **Сертификат:** `terehin_n.cloud.mda-medusa.ru.p12`
- **Пароль сертификата:** `000000000` (9 нулей)

### Формат запроса

```json
{
  "shop_id": "13",
  "type": "store_data"
}
```

### Формат ответа

```json
{
  "status": "success",
  "data": {
    "shopname": "Калинина 10",
    "items": [
      {
        "id": "category_id",
        "name": "Категория",
        "quanty": null,
        "items": [
          {
            "id": "product_id",
            "name": "Товар",
            "quanty": 10,
            "retail_price": 500.00,
            "items": []
          }
        ]
      }
    ]
  }
}
```

### Автоматическое обновление

Система автоматически обновляет каталоги:

- **При старте сервера:** через 10 секунд
- **По расписанию:** каждые 30 минут
- **Вручную:** через API endpoint `/api/catalog/update`

---

## Использование

### Запуск приложения

```bash
# Backend
cd /root/5lb/backend
npm run dev

# Frontend (в другом терминале)
cd /root/5lb/frontend
npm run dev
```

### Навигация в приложении

1. Откройте приложение в браузере
2. Нажмите на вкладку "Каталог" в нижней навигации
3. Выберите магазин из списка
4. Просматривайте товары по категориям
5. Используйте поиск для быстрого нахождения товаров

### Добавление нового магазина

1. Добавьте магазин в базу данных:
```sql
INSERT INTO shop_locations (shop_code, shop_name, address, city) 
VALUES ('15', 'Новый магазин', 'Адрес', 'Город');
```

2. Запустите обновление каталогов:
```bash
curl -X POST http://localhost:4000/api/catalog/update
```

3. Магазин появится в списке автоматически

---

## Troubleshooting

### Проблема: Сертификат не найден

**Ошибка:** `⚠️ Сертификат не найден`

**Решение:**
```bash
# Проверьте наличие файла
ls -la /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12

# Если файла нет - скопируйте его
cp terehin_n.cloud.mda-medusa.ru.p12 /root/5lb/backend/src/certs/

# Установите правильные права
chmod 600 /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12
```

### Проблема: 401 Unauthorized

**Ошибка:** `401 Unauthorized от Balance API`

**Решение:**
1. Проверьте credentials в `.env`:
   - `BALANCE_API_USERNAME=ТерехинНА`
   - `BALANCE_API_PASSWORD=123455123`

2. Убедитесь, что credentials правильно закодированы в Base64

### Проблема: 404 Not Found

**Ошибка:** `404 Not Found при запросе каталога`

**Решение:**
1. Проверьте URL API (должен быть `fransh-trade`, а не `mda-trade`)
2. Убедитесь что магазин существует в базе fransh-trade
3. Проверьте код магазина в базе данных

### Проблема: Каталоги не обновляются

**Решение:**
1. Проверьте логи backend:
```bash
pm2 logs backend
```

2. Проверьте статус кэша:
```bash
curl http://localhost:4000/api/catalog/status
```

3. Запустите обновление вручную:
```bash
curl -X POST http://localhost:4000/api/catalog/update
```

### Проблема: Frontend не отображает данные

**Решение:**
1. Откройте DevTools (F12) и проверьте Console на ошибки
2. Проверьте вкладку Network - успешны ли запросы к API
3. Убедитесь что backend запущен и доступен
4. Проверьте CORS настройки

---

## Конфигурация

### Изменение расписания обновления

В `backend/src/services/catalogService.ts`:

```typescript
// Изменить с 30 минут на 15 минут
cron.schedule('*/15 * * * *', async () => {
  await updateAllCatalogs();
});
```

### Изменение времени кэширования

В `backend/src/services/catalogService.ts`:

```typescript
// Изменить с 60 минут на 30 минут
const CATALOGS_CACHE_DURATION = 30 * 60 * 1000;
```

---

## Безопасность

### Важные правила:

1. ⚠️ **НЕ коммитить** сертификаты в репозиторий
2. ⚠️ **НЕ хранить** пароли в коде
3. ⚠️ **Использовать** переменные окружения
4. ⚠️ **Ограничить доступ** к сертификатам (chmod 600)
5. ⚠️ **Логировать** все запросы к API

### .gitignore

Убедитесь что в `.gitignore` есть:
```
# Сертификаты
*.p12
src/certs/*.p12

# Переменные окружения
.env
.env.local
```

---

## Контакты и поддержка

- **Telegram:** @sysrootix
- **Email:** support@medusa-franchise.com

---

**Дата создания:** 30 октября 2025  
**Версия:** 1.0  
**Проект:** Франшиза MEDUSA  

