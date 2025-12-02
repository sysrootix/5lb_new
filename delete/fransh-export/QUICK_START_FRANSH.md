# Быстрый старт для франшизы

## Что находится в этой папке

1. **terehin_n.cloud.mda-medusa.ru.p12** - клиентский сертификат для подключения к Balance API
2. **CATALOG_INTEGRATION_GUIDE.md** - полное руководство по интеграции
3. **QUICK_START_FRANSH.md** - этот файл (быстрая инструкция)

## Минимальные изменения для франшизы

### 1. Скопировать сертификат

```bash
mkdir -p routes/certs
cp terehin_n.cloud.mda-medusa.ru.p12 routes/certs/
```

### 2. Изменить конфигурацию в catalog.js

**Было (mda-trade):**
```javascript
const BALANCE_API_CONFIG = {
  username: 'ТерехинНА',
  password: '123455123',
  apiUrl: 'https://cloud.mda-medusa.ru/mda-trade/hs/Api/BalanceData',
  credentials: Buffer.from('ТерехинНА:123455123').toString('base64')
};
```

**Стало (fransh-trade):**
```javascript
const BALANCE_API_CONFIG = {
  username: 'ТерехинНА',
  password: '123455123',
  apiUrl: 'https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData',
  credentials: Buffer.from('ТерехинНА:123455123').toString('base64')
};
```

**Изменение:** `mda-trade` → `fransh-trade`

### 3. Установить необходимые пакеты

```bash
npm install axios node-forge node-cron
```

### 4. Проверить подключение

Создайте тестовый файл `test_fransh_catalog.js`:

```javascript
import axios from 'axios';
import https from 'https';
import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

const BALANCE_API_CONFIG = {
  username: 'ТерехинНА',
  password: '123455123',
  apiUrl: 'https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData',
  credentials: Buffer.from('ТерехинНА:123455123').toString('base64')
};

const CERT_PATH = path.join(process.cwd(), 'routes', 'certs', 'terehin_n.cloud.mda-medusa.ru.p12');
const CERT_PASSWORD = '000000000';

function initializeHttpsAgent() {
  try {
    const certBuffer = fs.readFileSync(CERT_PATH);
    const p12Der = forge.util.createBuffer(certBuffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, CERT_PASSWORD);

    let privateKey, certificate;
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    if (certBags[forge.pki.oids.certBag]) {
      certificate = forge.pki.certificateToPem(certBags[forge.pki.oids.certBag][0].cert);
    }

    if (keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]) {
      privateKey = forge.pki.privateKeyToPem(keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);
    }

    return new https.Agent({
      rejectUnauthorized: true,
      cert: certificate,
      key: privateKey
    });
  } catch (error) {
    console.error('❌ Ошибка инициализации HTTPS агента:', error);
    return null;
  }
}

async function testConnection() {
  try {
    console.log('🔍 Тестирование подключения к fransh-trade API...');
    
    const httpsAgent = initializeHttpsAgent();
    if (!httpsAgent) {
      throw new Error('Не удалось инициализировать HTTPS агент');
    }

    const requestData = {
      shop_id: '13', // Замените на код вашего магазина
      type: 'store_data'
    };

    const response = await axios.post(BALANCE_API_CONFIG.apiUrl, requestData, {
      httpsAgent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BALANCE_API_CONFIG.credentials}`
      },
      timeout: 30000
    });

    console.log('✅ Подключение успешно!');
    console.log('📦 Получено данных:', JSON.stringify(response.data, null, 2).slice(0, 500));
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
    if (error.response) {
      console.error('📥 Ответ сервера:', error.response.status, error.response.data);
    }
  }
}

testConnection();
```

Запустите:
```bash
node test_fransh_catalog.js
```

## Структура проекта

```
fransh-project/
├── routes/
│   ├── catalog.js           # Маршруты для работы с каталогом
│   └── certs/
│       └── terehin_n.cloud.mda-medusa.ru.p12
├── .env                     # Конфигурация (опционально)
└── server.js               # Основной файл сервера
```

## Переменные окружения (.env)

Рекомендуется вынести конфигурацию в .env:

```env
# Balance API Configuration для франшизы
BALANCE_API_URL=https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData
BALANCE_API_USERNAME=ТерехинНА
BALANCE_API_PASSWORD=123455123

# Certificate Configuration
CERT_PATH=routes/certs/terehin_n.cloud.mda-medusa.ru.p12
CERT_PASSWORD=000000000
```

И использовать в коде:

```javascript
const BALANCE_API_CONFIG = {
  username: process.env.BALANCE_API_USERNAME,
  password: process.env.BALANCE_API_PASSWORD,
  apiUrl: process.env.BALANCE_API_URL,
  credentials: Buffer.from(
    `${process.env.BALANCE_API_USERNAME}:${process.env.BALANCE_API_PASSWORD}`
  ).toString('base64')
};

const CERT_PATH = process.env.CERT_PATH || 'routes/certs/terehin_n.cloud.mda-medusa.ru.p12';
const CERT_PASSWORD = process.env.CERT_PASSWORD;
```

## Основные API endpoints

После интеграции будут доступны:

- **GET** `/api/catalog/shops` - список магазинов
- **GET** `/api/catalog/shop/:id` - каталог магазина
- **GET** `/api/catalog/search-products?q=запрос` - поиск товаров
- **POST** `/api/catalog/update-catalogs` - обновить каталоги вручную
- **GET** `/api/catalog/catalogs-status` - статус кэша

## База данных

Необходимо создать таблицы:

```sql
-- Таблица для магазинов
CREATE TABLE IF NOT EXISTS shop_locations (
  shop_code VARCHAR(20) PRIMARY KEY,
  shop_name VARCHAR(200) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(100) DEFAULT 'Москва',
  description TEXT,
  phone VARCHAR(20),
  working_hours VARCHAR(200),
  twogis_url VARCHAR(500),
  yandex_maps_url VARCHAR(500),
  google_maps_url VARCHAR(500),
  priority_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица для товаров
CREATE TABLE IF NOT EXISTS catalog_products (
  id VARCHAR(50) NOT NULL,
  name VARCHAR(500) NOT NULL,
  category_name VARCHAR(200),
  category_id VARCHAR(50),
  retail_price DECIMAL(10,2),
  quanty DECIMAL(10,3),
  characteristics JSONB,
  modifications JSONB,
  shop_code VARCHAR(20) NOT NULL,
  shop_name VARCHAR(200),
  is_active BOOLEAN DEFAULT TRUE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id, shop_code)
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_catalog_products_shop ON catalog_products(shop_code);
CREATE INDEX IF NOT EXISTS idx_catalog_products_name ON catalog_products(name);
CREATE INDEX IF NOT EXISTS idx_catalog_products_category ON catalog_products(category_id);

-- Таблица для исключений (необязательно)
CREATE TABLE IF NOT EXISTS catalog_exclusions (
  id SERIAL PRIMARY KEY,
  exclusion_type VARCHAR(20) NOT NULL CHECK (exclusion_type IN ('product', 'category')),
  item_id VARCHAR(50) NOT NULL,
  reason TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_by BIGINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(exclusion_type, item_id)
);
```

## Важные моменты

### 1. Разница между базами

- **mda-trade**: основная база MEDUSA
- **fransh-trade**: база для франшиз

Различие только в URL, все остальное (сертификат, credentials) одинаковое.

### 2. Безопасность

⚠️ **НЕ КОММИТИТЬ** сертификат и credentials в публичный репозиторий!

Добавьте в `.gitignore`:
```
routes/certs/*.p12
.env
```

### 3. Права доступа на сертификат

```bash
chmod 600 routes/certs/terehin_n.cloud.mda-medusa.ru.p12
```

### 4. Обновление каталогов

По умолчанию:
- Первое обновление: через 10 секунд после старта
- Автоматическое обновление: каждые 30 минут
- Кэш: 60 минут

Можно изменить в catalog.js:

```javascript
// Изменить расписание обновления
cron.schedule('*/15 * * * *', async () => { // Каждые 15 минут
  await updateAllCatalogs();
});

// Изменить время кэша
const CATALOGS_CACHE_DURATION = 30 * 60 * 1000; // 30 минут
```

## Проверка работы

1. Запустите сервер
2. Проверьте логи на наличие сообщений:
   ```
   ✅ База данных готова
   🔄 Обновление каталогов для магазина...
   ✅ Успешный ответ от Balance API
   ```
3. Откройте в браузере: `http://localhost:5001/api/catalog/shops`
4. Должен вернуться список магазинов

## Частые проблемы

### Ошибка: "Сертификат не найден"
- Проверьте путь к сертификату
- Убедитесь что файл скопирован в `routes/certs/`

### Ошибка: "UNABLE_TO_GET_ISSUER_CERT"
- Проблема с цепочкой сертификатов
- Попробуйте установить `rejectUnauthorized: false` (только для тестирования!)

### Ошибка: "401 Unauthorized"
- Проверьте username и password
- Убедитесь что credentials правильно закодированы в Base64

### Ошибка: "404 Not Found"
- Проверьте URL (должен быть `fransh-trade`, а не `mda-trade`)
- Убедитесь что магазин существует в базе fransh-trade

## Контакты

При возникновении вопросов: @sysrootix

---

**Дата создания:** 30 октября 2025  
**Версия:** 1.0  
**Проект:** Франшиза MEDUSA

