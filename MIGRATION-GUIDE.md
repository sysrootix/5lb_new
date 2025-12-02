# Руководство по миграции 5LB на новый сервер

## Обзор процесса

Миграция состоит из 4 этапов:
1. **Резервное копирование** на старом сервере
2. **Подготовка** нового сервера
3. **Перенос данных** и восстановление
4. **Проверка** и переключение DNS

---

## Этап 1: Резервное копирование (Старый сервер)

### 1.1 Запуск резервного копирования

```bash
cd /root/5lb
./migration-backup.sh
```

Скрипт создаст директорию `/root/5lb-migration-YYYYMMDD-HHMMSS/` со всеми данными:
- Дамп базы данных PostgreSQL
- Все .env файлы
- Код проекта (без node_modules)
- Конфигурация Nginx
- Конфигурация PM2

### 1.2 Проверка бэкапа

```bash
# Проверьте размер и содержимое
ls -lh /root/5lb-migration-*/
cat /root/5lb-migration-*/system-info.txt
```

### 1.3 Копирование на новый сервер

```bash
# Замените NEW_SERVER_IP на IP нового сервера
BACKUP_DIR=$(ls -dt /root/5lb-migration-* | head -1)
scp -r $BACKUP_DIR root@NEW_SERVER_IP:/root/
```

---

## Этап 2: Подготовка нового сервера

### 2.1 Обновление системы

```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# Установка базовых инструментов
apt install -y curl wget git build-essential
```

### 2.2 Установка Node.js

```bash
# Установка Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Проверка
node -v  # должно быть v20.x.x
npm -v
```

### 2.3 Установка PostgreSQL

```bash
# Установка PostgreSQL 15
apt install -y postgresql postgresql-contrib

# Запуск сервиса
systemctl start postgresql
systemctl enable postgresql

# Проверка
systemctl status postgresql
```

### 2.4 Установка PM2

```bash
npm install -g pm2

# Настройка автозапуска
pm2 startup
# Выполните команду, которую выведет pm2 startup
```

### 2.5 Установка Nginx

```bash
apt install -y nginx

# Запуск
systemctl start nginx
systemctl enable nginx

# Проверка
systemctl status nginx
```

### 2.6 Установка дополнительных инструментов

```bash
# Certbot для SSL (если используется)
apt install -y certbot python3-certbot-nginx
```

---

## Этап 3: Восстановление данных

### 3.1 Подготовка базы данных

```bash
# Переключитесь на пользователя postgres
sudo -u postgres psql

# В консоли PostgreSQL выполните:
CREATE DATABASE lb_db;
CREATE USER lb_user WITH ENCRYPTED PASSWORD 'MLwNXtCr8lGjab7vhA7UWKw1J2uePa';
GRANT ALL PRIVILEGES ON DATABASE lb_db TO lb_user;
ALTER DATABASE lb_db OWNER TO lb_user;
\q
```

### 3.2 Восстановление базы данных

```bash
# Найдите директорию с бэкапом
BACKUP_DIR=$(ls -dt /root/5lb-migration-* | head -1)

# Восстановление из бинарного дампа (рекомендуется)
pg_restore -U lb_user -h localhost -d lb_db -v "$BACKUP_DIR/lb_db.dump"

# Или из SQL дампа (если первый не работает)
psql -U lb_user -h localhost -d lb_db < "$BACKUP_DIR/lb_db.sql"

# Проверка
psql -U lb_user -h localhost -d lb_db -c "SELECT COUNT(*) FROM \"User\";"
```

### 3.3 Восстановление кода проекта

```bash
# Распаковка архива
cd /root
tar -xzf $BACKUP_DIR/5lb-code.tar.gz

# Проверка
ls -la /root/5lb/
```

### 3.4 Восстановление .env файлов

```bash
# Копирование .env файлов
cp "$BACKUP_DIR/env/backend.env" /root/5lb/backend/.env
cp "$BACKUP_DIR/env/frontend.env" /root/5lb/frontend/.env
cp "$BACKUP_DIR/env/crm_backend.env" /root/5lb/crm/crm_backend/.env

# ВАЖНО: Обновите URL-ы в .env файлах на новые (если изменились)
# Например, если изменился домен или IP
nano /root/5lb/backend/.env
nano /root/5lb/frontend/.env
```

### 3.5 Установка зависимостей и сборка

```bash
cd /root/5lb

# Установка зависимостей
npm install

# Установка зависимостей для всех workspace
npm install --workspace frontend
npm install --workspace backend
npm install --workspace mobile

# Установка зависимостей CRM
cd /root/5lb/crm/crm_backend
npm install
cd /root/5lb

# Генерация Prisma Client
cd /root/5lb/backend
npx prisma generate

# Сборка проектов
cd /root/5lb
npm run build:backend
npm run build:frontend

# Сборка CRM
cd /root/5lb/crm/crm_backend
npm run build
cd /root/5lb
```

### 3.6 Настройка Nginx

```bash
# Копирование конфигурации Nginx
cp $BACKUP_DIR/nginx/sites-available/* /etc/nginx/sites-available/

# ВАЖНО: Проверьте и обновите конфигурацию если нужно
nano /etc/nginx/sites-available/5lb.conf

# Создайте симлинки
ln -sf /etc/nginx/sites-available/5lb.conf /etc/nginx/sites-enabled/

# Проверка конфигурации
nginx -t

# Перезагрузка Nginx
systemctl reload nginx
```

### 3.7 Запуск приложений через PM2

```bash
cd /root/5lb

# Запуск через ecosystem.config.js
pm2 start ecosystem.config.js

# Запуск CRM
cd /root/5lb/crm/crm_backend
pm2 start dist/src/index.js --name "5lb-crm-backend"

# Сохранение конфигурации PM2
pm2 save

# Проверка статуса
pm2 list
pm2 logs
```

---

## Этап 4: Проверка и тестирование

### 4.1 Проверка сервисов

```bash
# Проверка PostgreSQL
systemctl status postgresql
psql -U lb_user -h localhost -d lb_db -c "SELECT COUNT(*) FROM \"User\";"

# Проверка PM2
pm2 list
pm2 logs --lines 50

# Проверка Nginx
systemctl status nginx
nginx -t
```

### 4.2 Тестирование API

```bash
# Проверка backend (замените на ваш домен/IP)
curl http://localhost:4000/api/health
curl https://app.5lb.pro/api/health

# Проверка frontend
curl -I http://localhost:80
curl -I https://app.5lb.pro
```

### 4.3 Проверка логов

```bash
# Логи PM2
pm2 logs 5lb-backend --lines 100
pm2 logs 5lb-crm-backend --lines 100

# Логи Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### 4.4 Функциональное тестирование

1. Откройте сайт в браузере
2. Попробуйте войти в систему
3. Проверьте основные функции:
   - Авторизация/регистрация
   - Просмотр товаров
   - Работа корзины
   - Профиль пользователя
4. Проверьте CRM панель

---

## Этап 5: Настройка SSL (если нужно)

```bash
# Получение SSL сертификата через Let's Encrypt
certbot --nginx -d app.5lb.pro

# Автоматическое обновление
certbot renew --dry-run
```

---

## Этап 6: Финальные шаги

### 6.1 Настройка файрвола

```bash
# UFW (Ubuntu)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

ufw status
```

### 6.2 Настройка мониторинга

```bash
# PM2 мониторинг
pm2 install pm2-logrotate

# Настройка логротации
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

### 6.3 Переключение DNS

После полной проверки обновите DNS записи вашего домена на новый IP адрес:

1. Зайдите в панель управления доменом
2. Обновите A-запись для `app.5lb.pro` на новый IP
3. Подождите распространения DNS (5-30 минут)
4. Проверьте: `nslookup app.5lb.pro`

---

## Troubleshooting

### База данных не подключается

```bash
# Проверьте что PostgreSQL запущен
systemctl status postgresql

# Проверьте подключение
psql -U lb_user -h localhost -d lb_db

# Проверьте права доступа
sudo -u postgres psql -c "\du"
sudo -u postgres psql -c "\l"
```

### PM2 процессы падают

```bash
# Смотрим логи
pm2 logs

# Перезапуск
pm2 restart all

# Проверка переменных окружения
pm2 env 0
```

### Nginx 502 Bad Gateway

```bash
# Проверьте что backend работает
pm2 list
curl http://localhost:4000/api/health

# Проверьте конфигурацию Nginx
nginx -t
cat /etc/nginx/sites-enabled/5lb.conf

# Логи Nginx
tail -f /var/log/nginx/error.log
```

### Ошибки при миграции БД

```bash
# Попробуйте текстовый SQL дамп вместо бинарного
psql -U lb_user -h localhost -d lb_db < $BACKUP_DIR/lb_db.sql

# Или создайте БД заново и примените миграции Prisma
cd /root/5lb/backend
npx prisma migrate deploy
```

---

## Откат на старый сервер

Если что-то пошло не так:

1. Не трогайте старый сервер до полной проверки нового
2. Переключите DNS обратно на старый IP
3. Проверьте логи чтобы понять проблему

---

## Чеклист миграции

- [ ] Создан бэкап на старом сервере
- [ ] Установлены все зависимости на новом сервере
- [ ] База данных восстановлена
- [ ] Код проекта распакован
- [ ] .env файлы скопированы и обновлены
- [ ] Зависимости установлены (npm install)
- [ ] Проекты собраны (npm run build)
- [ ] Nginx настроен и работает
- [ ] PM2 процессы запущены
- [ ] API отвечает корректно
- [ ] Frontend загружается
- [ ] SSL настроен (если нужно)
- [ ] Функциональное тестирование пройдено
- [ ] DNS переключен на новый IP
- [ ] Мониторинг настроен

---

## Контакты и помощь

Если возникли проблемы:
1. Проверьте логи: `pm2 logs`, `/var/log/nginx/error.log`
2. Используйте раздел Troubleshooting выше
3. Не удаляйте старый сервер пока новый не работает стабильно 100%
