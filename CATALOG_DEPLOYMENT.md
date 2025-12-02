# Развертывание системы каталогов на Production

## 📋 Чек-лист перед развертыванием

- [ ] Сертификат `.p12` скопирован на сервер
- [ ] Переменные окружения настроены в `.env`
- [ ] База данных обновлена (prisma db push)
- [ ] Магазины добавлены в таблицу `shop_locations`
- [ ] Backend скомпилирован (`npm run build`)
- [ ] Frontend скомпилирован (`npm run build`)
- [ ] .gitignore обновлен (сертификаты не коммитятся)
- [ ] PM2 или другой process manager настроен

---

## 🚀 Пошаговое развертывание

### 1. Подготовка сервера

```bash
# Обновите код из репозитория
cd /root/5lb
git pull

# Установите зависимости backend
cd backend
npm install

# Установите зависимости frontend
cd ../frontend
npm install
```

### 2. Настройка сертификата

```bash
# Создайте директорию для сертификатов
mkdir -p /root/5lb/backend/src/certs

# Скопируйте сертификат на сервер (через SCP или другим способом)
scp terehin_n.cloud.mda-medusa.ru.p12 user@server:/root/5lb/backend/src/certs/

# Установите правильные права доступа
chmod 600 /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12
```

### 3. Настройка переменных окружения

Обновите `/root/5lb/backend/.env`:

```env
# Production настройки
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/lb_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-production

# Domain & CORS
APP_DOMAIN=https://app.5lb.pro
API_PUBLIC_URL=https://app.5lb.pro/api
CORS_ALLOWED_ORIGINS=https://app.5lb.pro,https://www.5lb.pro

# Balance API для франшизы
BALANCE_API_URL=https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData
BALANCE_API_USERNAME=ТерехинНА
BALANCE_API_PASSWORD=123455123

# Certificate
CERT_PATH=src/certs/terehin_n.cloud.mda-medusa.ru.p12
CERT_PASSWORD=000000000

# SMS и Telegram (ваши существующие настройки)
TELEGRAM_BOT_TOKEN=your-token
SMSC_LOGIN=your-login
SMSC_PASSWORD=your-password
```

### 4. Обновление базы данных

```bash
cd /root/5lb/backend

# Синхронизируйте схему с базой
npx prisma db push

# Или создайте миграцию (если нужно)
# npx prisma migrate deploy
```

### 5. Добавление магазинов

Выполните SQL скрипт:

```bash
psql -U your_user -d lb_db -f /root/5lb/catalog_test_data.sql
```

Или добавьте магазины вручную через SQL:

```sql
INSERT INTO shop_locations (id, shop_code, shop_name, address, city, is_active, created_at, updated_at) 
VALUES 
  ('clshop13', '13', 'Калинина 10', 'г. Москва, ул. Калинина, д. 10', 'Москва', true, NOW(), NOW());
```

### 6. Сборка приложений

```bash
# Backend
cd /root/5lb/backend
npm run build

# Frontend
cd /root/5lb/frontend
npm run build
```

### 7. Настройка PM2

Обновите или создайте `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: '5lb-backend',
      script: './backend/dist/index.js',
      cwd: '/root/5lb',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
```

### 8. Запуск приложения

```bash
# Запустите backend через PM2
pm2 start ecosystem.config.js

# Или если PM2 уже запущен - перезапустите
pm2 restart 5lb-backend

# Проверьте логи
pm2 logs 5lb-backend

# Сохраните конфигурацию PM2
pm2 save
```

### 9. Настройка Nginx

Обновите конфигурацию Nginx для проксирования каталога:

```nginx
server {
    listen 80;
    server_name app.5lb.pro;

    # Frontend
    location / {
        root /root/5lb/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Uploads
    location /uploads {
        alias /root/5lb/backend/uploads;
    }
}
```

Перезапустите Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ Проверка работоспособности

### 1. Проверка Backend

```bash
# Проверка статуса PM2
pm2 status

# Проверка логов
pm2 logs 5lb-backend --lines 50

# Проверка API
curl http://localhost:4000/api/catalog/shops
curl http://localhost:4000/api/catalog/status
```

### 2. Проверка каталогов

```bash
# Запустите обновление каталогов
curl -X POST http://localhost:4000/api/catalog/update

# Проверьте статус через несколько секунд
curl http://localhost:4000/api/catalog/status

# Проверьте каталог магазина
curl http://localhost:4000/api/catalog/shop/13
```

### 3. Проверка Frontend

Откройте в браузере:
- `https://app.5lb.pro/shops` - должен отобразиться список магазинов
- `https://app.5lb.pro/catalog/13` - должен отобразиться каталог магазина

### 4. Проверка автообновления

```bash
# Проверьте логи PM2 через несколько минут
pm2 logs 5lb-backend | grep "каталог"

# Должны появиться сообщения:
# "🔄 Обновление каталога магазина..."
# "✅ Обновление каталогов завершено"
```

---

## 📊 Мониторинг

### Логи

```bash
# Просмотр логов в реальном времени
pm2 logs 5lb-backend

# Просмотр только ошибок
pm2 logs 5lb-backend --err

# Последние 100 строк
pm2 logs 5lb-backend --lines 100
```

### Метрики PM2

```bash
# Мониторинг в реальном времени
pm2 monit

# Информация о приложении
pm2 info 5lb-backend
```

### SQL запросы для мониторинга

```sql
-- Количество магазинов
SELECT COUNT(*) FROM shop_locations WHERE is_active = true;

-- Статистика товаров по магазинам
SELECT 
  shop_code,
  shop_name,
  COUNT(*) as total_products,
  COUNT(CASE WHEN quantity > 0 THEN 1 END) as in_stock,
  MAX(last_updated) as last_update
FROM catalog_products
WHERE is_active = true
GROUP BY shop_code, shop_name;

-- Последнее обновление каталогов
SELECT 
  shop_code,
  MAX(last_updated) as last_update,
  COUNT(*) as products_count
FROM catalog_products
WHERE is_active = true
GROUP BY shop_code
ORDER BY last_update DESC;
```

---

## 🔄 Обновление системы

### При изменении кода

```bash
cd /root/5lb

# Получите изменения
git pull

# Backend
cd backend
npm install
npm run build
pm2 restart 5lb-backend

# Frontend
cd ../frontend
npm install
npm run build
```

### При изменении схемы БД

```bash
cd /root/5lb/backend

# Синхронизируйте изменения
npx prisma db push

# Или создайте миграцию
npx prisma migrate deploy

# Перезапустите backend
pm2 restart 5lb-backend
```

---

## 🐛 Troubleshooting на Production

### Проблема 1: Сертификат не работает

```bash
# Проверьте наличие и права
ls -la /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12

# Должно быть: -rw------- (600)
# Если нет - исправьте:
chmod 600 /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12

# Проверьте владельца (должен совпадать с пользователем PM2)
chown $(whoami):$(whoami) /root/5lb/backend/src/certs/terehin_n.cloud.mda-medusa.ru.p12
```

### Проблема 2: Каталоги не обновляются

```bash
# Проверьте логи
pm2 logs 5lb-backend | grep "Balance API"

# Проверьте переменные окружения
pm2 env 5lb-backend

# Запустите обновление вручную
curl -X POST http://localhost:4000/api/catalog/update

# Проверьте соединение с Balance API
curl -v https://cloud.mda-medusa.ru/fransh-trade/hs/Api/BalanceData
```

### Проблема 3: 502 Bad Gateway

```bash
# Проверьте что backend запущен
pm2 status

# Проверьте что backend слушает правильный порт
netstat -tulpn | grep 4000

# Проверьте логи
pm2 logs 5lb-backend --err

# Перезапустите если нужно
pm2 restart 5lb-backend
```

### Проблема 4: Высокая нагрузка

```bash
# Проверьте память и CPU
pm2 monit

# Увеличьте кэш если нужно
# В catalogService.ts измените:
# const CATALOGS_CACHE_DURATION = 120 * 60 * 1000; // 2 часа

# Или уменьшите частоту обновления
# cron.schedule('*/60 * * * *', ...) // каждый час
```

---

## 🔐 Безопасность на Production

### 1. Защита сертификата

```bash
# Убедитесь что сертификат имеет правильные права
chmod 600 /root/5lb/backend/src/certs/*.p12

# Проверьте что сертификат не в .git
git check-ignore /root/5lb/backend/src/certs/*.p12
# Должен вывести путь, если игнорируется
```

### 2. Защита .env

```bash
# Права доступа только для владельца
chmod 600 /root/5lb/backend/.env

# Проверьте что .env не в git
git check-ignore /root/5lb/backend/.env
```

### 3. HTTPS

Убедитесь что используется HTTPS через Nginx с Let's Encrypt сертификатом.

---

## 📅 Регулярное обслуживание

### Еженедельно

```bash
# Проверка логов на ошибки
pm2 logs 5lb-backend --lines 1000 | grep "ERROR"

# Очистка старых логов
pm2 flush
```

### Ежемесячно

```sql
-- Очистка старых неактивных товаров
DELETE FROM catalog_products 
WHERE is_active = false 
  AND last_updated < NOW() - INTERVAL '30 days';

-- Проверка размера БД
SELECT pg_size_pretty(pg_database_size('lb_db'));
```

---

## ✅ Развертывание завершено!

Если все проверки прошли успешно - система каталогов работает на production! 🎉

---

**Поддержка:** @sysrootix  
**Дата:** 30 октября 2025

