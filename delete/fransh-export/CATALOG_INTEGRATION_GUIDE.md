# Руководство по интеграции каталогов магазинов

## Обзор

Система получает каталоги магазинов из Balance API (1С) через защищенное HTTPS соединение с использованием клиентского сертификата и Basic Auth.

## Конфигурация подключения

### Текущая конфигурация (mda-trade)

```javascript
const BALANCE_API_CONFIG = {
  username: 'ТерехинНА',
  password: '123455123',
  apiUrl: 'https://cloud.mda-medusa.ru/mda-trade/hs/Api/BalanceData',
  credentials: Buffer.from('ТерехинНА:123455123').toString('base64')
};
```

### Конфигурация для франшизы (fransh-trade)

```javascript
const BALANCE_API_CONFIG = {
  username: 'ТерехинНА',
  password: '123455123',
  apiUrl: 'https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData',
  credentials: Buffer.from('ТерехинНА:123455123').toString('base64')
};
```

**Изменение**: Заменить `mda-trade` на `fransh-trade` в URL API.

## Сертификат

### Файл сертификата
- **Имя файла**: `terehin_n.cloud.mda-medusa.ru.p12`
- **Пароль**: `000000000` (9 нулей)
- **Тип**: PKCS#12 (клиентский сертификат)
- **Местоположение**: Поместите в `routes/certs/` или другую безопасную директорию

### Структура директорий

```
backend/
├── routes/
│   ├── catalog.js
│   └── certs/
│       └── terehin_n.cloud.mda-medusa.ru.p12
```

## Логика получения каталогов

### 1. Инициализация HTTPS агента с сертификатом

```javascript
import https from 'https';
import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

const CERT_PATH = path.join(process.cwd(), 'routes', 'certs', 'terehin_n.cloud.mda-medusa.ru.p12');
const CERT_PASSWORD = '000000000';

function initializeHttpsAgent() {
  try {
    if (!fs.existsSync(CERT_PATH)) {
      console.warn(`⚠️ Сертификат не найден: ${CERT_PATH}`);
      return null;
    }

    const certBuffer = fs.readFileSync(CERT_PATH);
    const p12Der = forge.util.createBuffer(certBuffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, CERT_PASSWORD);

    // Извлекаем сертификат и приватный ключ
    let privateKey, certificate;
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    if (certBags[forge.pki.oids.certBag] && certBags[forge.pki.oids.certBag].length) {
      certificate = forge.pki.certificateToPem(certBags[forge.pki.oids.certBag][0].cert);
    }

    if (keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] && keyBags[forge.pki.oids.pkcs8ShroudedKeyBag].length) {
      privateKey = forge.pki.privateKeyToPem(keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key);
    }

    // Настраиваем https агент с клиентским сертификатом
    return new https.Agent({
      rejectUnauthorized: true,
      cert: certificate,
      key: privateKey
    });
  } catch (error) {
    console.error('❌ Ошибка при инициализации HTTPS агента:', error);
    return null;
  }
}
```

### 2. Отправка запроса к Balance API

```javascript
import axios from 'axios';

async function sendBalanceRequest(shopId, type = 'store_data') {
  try {
    console.log(`🌐 Отправка запроса к Balance API: shopId: ${shopId}, type: ${type}`);

    const httpsAgent = initializeHttpsAgent();
    if (!httpsAgent) {
      throw new Error('Не удалось инициализировать HTTPS агент с сертификатом');
    }

    // Подготавливаем данные для отправки
    const requestData = {
      shop_id: shopId,
      type: type
    };

    // Подготавливаем опции запроса с сертификатом
    const options = {
      httpsAgent: httpsAgent,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${BALANCE_API_CONFIG.credentials}`
      },
      timeout: 30000 // 30 секунд таймаут
    };

    // Отправляем запрос к API
    const response = await axios.post(BALANCE_API_CONFIG.apiUrl, requestData, options);

    // Обрабатываем ответ
    if (response.data) {
      if (response.data.status === 'success') {
        console.log(`✅ Успешный ответ от Balance API (${type})`);
        return {
          success: true,
          data: response.data.data
        };
      } else if (response.data.status === 'error') {
        console.warn(`⚠️ Ошибка от Balance API (${type}): ${response.data.message}`);
        return {
          success: false,
          message: response.data.message || 'Ошибка от API'
        };
      } else {
        // Если сервер вернул данные без поля status - считаем это успешным ответом
        console.log(`✅ Получены данные от Balance API (${type}) без поля status`);
        return {
          success: true,
          data: response.data
        };
      }
    }
  } catch (error) {
    console.error(`❌ Ошибка при отправке запроса к Balance API (${type}):`, error.message);
    return {
      success: false,
      message: `Ошибка при отправке запроса: ${error.message}`
    };
  }
}
```

### 3. Формат запроса

**POST** запрос к `https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData`

**Headers:**
```
Content-Type: application/json
Authorization: Basic VGVyZWhpbkFOOjEyMzQ1NTEyMw==
```

**Body:**
```json
{
  "shop_id": "13",
  "type": "store_data"
}
```

### 4. Формат ответа от API

Ответ содержит структуру каталога:

```json
{
  "status": "success",
  "data": {
    "shopname": "Название магазина",
    "items": [
      {
        "id": "category_id",
        "name": "Название категории",
        "quanty": null,
        "items": [
          {
            "id": "product_id",
            "name": "Название товара",
            "quanty": 10,
            "retail_price": 500.00,
            "purchase_price": 300.00,
            "items": [
              {
                "id": "modification_id",
                "name": "Вкус: Клубника",
                "quanty": 5,
                "retail_price": 500.00
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 5. Преобразование в удобочитаемый формат

Функция `buildReadableCatalog` преобразует сырые данные в структуру:

```javascript
{
  "shopname": "Название магазина",
  "shop_id": "13",
  "categories": [
    {
      "id": "category_id",
      "name": "Название категории",
      "products": [
        {
          "id": "product_id",
          "name": "Название товара",
          "quanty": 10,
          "retail_price": 500.00,
          "modifications": [
            {
              "id": "modification_id",
              "name": "Вкус: Клубника",
              "quanty": 5,
              "retail_price": 500.00
            }
          ]
        }
      ]
    }
  ]
}
```

## Автоматическое обновление каталогов

Система автоматически обновляет каталоги:
- **При старте сервера**: через 10 секунд после запуска
- **По расписанию**: каждые 30 минут (cron: `*/30 * * * *`)
- **Ручное обновление**: через API endpoint `POST /api/catalog/update-catalogs`

```javascript
import cron from 'node-cron';

// Запускаем обновление каталогов каждые 30 минут
cron.schedule('*/30 * * * *', async () => {
  console.log('⏰ Запуск планового обновления каталогов...');
  await updateAllCatalogs();
});

// Запускаем первое обновление при старте сервера через 10 секунд
setTimeout(async () => {
  await updateAllCatalogs();
}, 10000);
```

## Кэширование

Каталоги кэшируются в памяти на 60 минут (1 час):

```javascript
let catalogsCache = new Map();
let catalogsLastUpdated = 0;
const CATALOGS_CACHE_DURATION = 60 * 60 * 1000; // 60 минут
```

При запросе каталога сначала проверяется кэш. Если кэш свежий - возвращаются данные из кэша, иначе делается запрос к API.

## Сохранение в базу данных

Товары сохраняются в таблицу `catalog_products`:

```sql
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
```

## API Endpoints

### GET /api/catalog/shops
Получить список всех активных магазинов

### GET /api/catalog/shop/:id
Получить каталог конкретного магазина

### GET /api/catalog/search-products?q=запрос
Глобальный поиск товаров по всем магазинам

### POST /api/catalog/update-catalogs
Запустить ручное обновление каталогов

### GET /api/catalog/catalogs-status
Получить статус кэша каталогов

## Необходимые npm пакеты

```json
{
  "dependencies": {
    "axios": "^1.6.0",
    "node-forge": "^1.3.1",
    "node-cron": "^3.0.3"
  }
}
```

## Безопасность

1. **Сертификат** должен храниться в защищенной директории с ограниченными правами доступа
2. **Пароль сертификата** лучше хранить в переменных окружения (`.env` файл)
3. **Credentials** для Basic Auth также рекомендуется хранить в `.env`

### Пример .env файла

```env
# Balance API Configuration
BALANCE_API_URL=https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData
BALANCE_API_USERNAME=ТерехинНА
BALANCE_API_PASSWORD=123455123

# Certificate Configuration
CERT_PATH=routes/certs/terehin_n.cloud.mda-medusa.ru.p12
CERT_PASSWORD=000000000
```

## Обработка ошибок

Система включает fallback механизмы:
- Если API недоступен - возвращается пустой каталог
- Если сертификат не найден - логируется предупреждение
- Если ответ от API некорректен - используется кэш или пустой каталог

## Тестирование

Для тестирования подключения можно использовать:

```bash
# Установите необходимые пакеты
npm install axios node-forge

# Создайте тестовый файл test_balance_api.js (см. в корне проекта)
node test_balance_api.js
```

## Миграция на fransh-trade

**Шаги:**

1. **Скопировать сертификат** в новый проект в директорию `routes/certs/`
2. **Изменить URL** в конфигурации:
   ```javascript
   apiUrl: 'https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData'
   ```
3. **Убедиться** что username и password остались теми же (если не изменились)
4. **Проверить подключение** через тестовый скрипт
5. **Настроить расписание** обновления каталогов под нужды проекта

## Поддержка

При возникновении проблем проверьте:
- ✅ Сертификат находится в правильной директории
- ✅ Пароль сертификата корректный
- ✅ URL API указан правильно (`fransh-trade`, а не `mda-trade`)
- ✅ Credentials для Basic Auth корректные
- ✅ Сервер имеет доступ к `cloud.mda-medusa.ru` через HTTPS
- ✅ Установлены все необходимые npm пакеты

## Контакты

При вопросах обращаться: @sysrootix

