# Docker Deployment Guide для 5LB

Полное руководство по развертыванию проекта 5LB в Docker контейнерах.

## Структура Docker-композиции

Проект включает следующие сервисы:
- **postgres** - PostgreSQL 16 база данных
- **backend** - Основной backend API (порт 60000)
- **crm-backend** - CRM backend API (порт 60001)
- **frontend** - Основное веб-приложение
- **crm-frontend** - CRM веб-интерфейс
- **nginx** - Reverse proxy для всех сервисов

## Быстрый старт

### 1. Подготовка

```bash
# Клонируйте репозиторий (или скопируйте файлы на новый сервер)
cd /root/5lb

# Создайте .env файл из примера
cp .env.example .env

# Отредактируйте .env и заполните все переменные
nano .env
```

### 2. Обязательные переменные окружения

Отредактируйте `.env` файл:

```env
# PostgreSQL Database
POSTGRES_DB=5lb_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_jwt_secret_here

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
```

### 3. Запуск в Docker

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
```

### 4. Остановка и управление

```bash
# Остановка всех сервисов
docker-compose down

# Остановка с удалением volumes (ОСТОРОЖНО! Удалит БД)
docker-compose down -v

# Перезапуск конкретного сервиса
docker-compose restart backend

# Просмотр используемых ресурсов
docker stats
```

## Миграция с существующего сервера

### Шаг 1: Создание бэкапа базы данных на старом сервере

```bash
# На старом сервере
pg_dump -U postgres -h localhost -p 5432 5lb_db > /tmp/5lb_backup.sql
```

### Шаг 2: Перенос бэкапа на новый сервер

```bash
# Скопируйте файл бэкапа на новый сервер
scp /tmp/5lb_backup.sql root@новый_сервер:/root/
```

### Шаг 3: Запуск Docker на новом сервере

```bash
# На новом сервере
cd /root/5lb

# Запустите только PostgreSQL
docker-compose up -d postgres

# Дождитесь готовности базы
docker-compose logs -f postgres
# Ctrl+C когда увидите "database system is ready to accept connections"
```

### Шаг 4: Восстановление базы данных

```bash
# Импортируйте бэкап в Docker PostgreSQL
docker exec -i 5lb-postgres psql -U postgres 5lb_db < /root/5lb_backup.sql

# Или подключитесь к контейнеру и выполните импорт
docker exec -it 5lb-postgres bash
psql -U postgres 5lb_db < /path/to/backup.sql
exit
```

### Шаг 5: Запуск остальных сервисов

```bash
# Запустите все сервисы
docker-compose up -d

# Проверьте статус
docker-compose ps
```

## Настройка Nginx для Docker

### Для локальной разработки (без SSL)

Nginx уже настроен в контейнере и использует конфигурации из:
- `nginx/docker-nginx.conf` - основная конфигурация
- `nginx/docker-app.conf` - конфигурация для app.5lb.pro
- `nginx/docker-crm.conf` - конфигурация для crm.5lb.pro

Приложение будет доступно на:
- http://app.5lb.pro (или http://localhost:80)
- http://crm.5lb.pro

### Для production с SSL

1. Установите certbot на хост-машине (не в Docker):

```bash
apt install certbot
```

2. Получите сертификаты:

```bash
certbot certonly --standalone -d app.5lb.pro -d crm.5lb.pro
```

3. Раскомментируйте HTTPS блоки в `nginx/docker-app.conf` и `nginx/docker-crm.conf`

4. Перезапустите nginx:

```bash
docker-compose restart nginx
```

## Обновление приложения

### Обновление кода без пересборки

Для изменений, которые не требуют пересборки образов:

```bash
# Обновите код через git
git pull

# Перезапустите сервисы
docker-compose restart backend frontend
```

### Полная пересборка

Для изменений в зависимостях или конфигурации:

```bash
# Остановите сервисы
docker-compose down

# Пересоберите образы
docker-compose build --no-cache

# Запустите заново
docker-compose up -d
```

## Работа с базой данных

### Подключение к PostgreSQL в Docker

```bash
# Через docker exec
docker exec -it 5lb-postgres psql -U postgres -d 5lb_db

# Через psql с хост-машины (если установлен)
psql -h localhost -p 5432 -U postgres -d 5lb_db
```

### Создание бэкапа

```bash
# Полный бэкап
docker exec 5lb-postgres pg_dump -U postgres 5lb_db > backup_$(date +%Y%m%d).sql

# Только схема
docker exec 5lb-postgres pg_dump -U postgres --schema-only 5lb_db > schema.sql

# Только данные
docker exec 5lb-postgres pg_dump -U postgres --data-only 5lb_db > data.sql
```

### Восстановление из бэкапа

```bash
# Восстановление
docker exec -i 5lb-postgres psql -U postgres 5lb_db < backup.sql
```

## Мониторинг и отладка

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f nginx

# Последние 100 строк
docker-compose logs --tail=100 backend
```

### Проверка здоровья сервисов

```bash
# Статус всех контейнеров
docker-compose ps

# Детальная информация о контейнере
docker inspect 5lb-backend

# Проверка healthcheck
docker inspect --format='{{.State.Health.Status}}' 5lb-backend
```

### Подключение к контейнеру

```bash
# Backend
docker exec -it 5lb-backend sh

# PostgreSQL
docker exec -it 5lb-postgres bash

# Nginx
docker exec -it 5lb-nginx sh
```

## Volumes и данные

### Постоянные данные

Docker Compose создает следующие volumes:
- `postgres_data` - база данных PostgreSQL
- `nginx_cache` - кэш Nginx
- `nginx_logs` - логи Nginx
- `./backend/uploads` - загруженные файлы backend

### Резервное копирование volumes

```bash
# Бэкап PostgreSQL volume
docker run --rm -v 5lb_postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres_data_backup.tar.gz /data

# Восстановление
docker run --rm -v 5lb_postgres_data:/data -v $(pwd):/backup ubuntu tar xzf /backup/postgres_data_backup.tar.gz -C /
```

## Масштабирование

### Увеличение ресурсов для сервиса

Отредактируйте `docker-compose.yml`:

```yaml
services:
  backend:
    # ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
```

### Запуск нескольких инстансов

```bash
# Запуск 3 инстансов backend
docker-compose up -d --scale backend=3
```

## Troubleshooting

### Контейнер не запускается

```bash
# Проверьте логи
docker-compose logs backend

# Проверьте конфигурацию
docker-compose config

# Пересоберите без кэша
docker-compose build --no-cache backend
```

### База данных недоступна

```bash
# Проверьте статус postgres
docker-compose ps postgres

# Проверьте логи
docker-compose logs postgres

# Проверьте healthcheck
docker inspect --format='{{.State.Health.Status}}' 5lb-postgres
```

### Проблемы с сетью

```bash
# Проверьте сети Docker
docker network ls

# Инспектируйте сеть 5lb
docker network inspect 5lb_5lb-network

# Пересоздайте сеть
docker-compose down
docker-compose up -d
```

## Очистка

### Очистка неиспользуемых ресурсов

```bash
# Удалить остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes
docker volume prune

# Полная очистка (ОСТОРОЖНО!)
docker system prune -a --volumes
```

## Безопасность

### Рекомендации

1. Используйте strong passwords в `.env`
2. Никогда не коммитьте `.env` в git
3. Ограничьте доступ к портам PostgreSQL (только внутри Docker network)
4. Регулярно обновляйте базовые образы Docker
5. Используйте SSL сертификаты в production

### Обновление секретов

```bash
# Обновите .env файл
nano .env

# Пересоздайте только затронутые сервисы
docker-compose up -d --force-recreate backend
```

## Полезные команды

```bash
# Проверка версий в контейнерах
docker exec 5lb-backend node --version
docker exec 5lb-postgres psql --version

# Экспорт environment variables контейнера
docker exec 5lb-backend env

# Копирование файлов из/в контейнер
docker cp 5lb-backend:/app/logs ./logs
docker cp ./config.json 5lb-backend:/app/config.json

# Мониторинг ресурсов в реальном времени
docker stats

# Проверка дискового пространства Docker
docker system df
```

## Скрипт быстрого деплоя

Создайте файл `docker-deploy.sh`:

```bash
#!/bin/bash

echo "Pulling latest changes..."
git pull

echo "Building Docker images..."
docker-compose build --no-cache

echo "Stopping old containers..."
docker-compose down

echo "Starting new containers..."
docker-compose up -d

echo "Waiting for services to be healthy..."
sleep 10

echo "Checking services status..."
docker-compose ps

echo "Deployment complete!"
```

Сделайте скрипт исполняемым:

```bash
chmod +x docker-deploy.sh
./docker-deploy.sh
```

## Поддержка

Если у вас возникли проблемы:

1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте конфигурацию: `docker-compose config`
4. Пересоберите образы: `docker-compose build --no-cache`
