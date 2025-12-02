# Docker Quick Start - 5LB

Быстрая инструкция для запуска проекта в Docker на новом сервере.

## Шаг 1: Установка Docker

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
apt install docker-compose-plugin -y

# Проверка установки
docker --version
docker compose version
```

## Шаг 2: Подготовка проекта

```bash
# Перейдите в директорию проекта
cd /root/5lb

# Создайте .env файл
cp .env.example .env
nano .env  # Заполните все переменные
```

### Обязательные переменные в .env:

```env
POSTGRES_PASSWORD=ваш_надежный_пароль
JWT_SECRET=ваш_jwt_секрет
TELEGRAM_BOT_TOKEN=токен_бота
```

## Шаг 3: Запуск

```bash
# Быстрый запуск с помощью скрипта
./docker-deploy.sh

# Или вручную
docker-compose up -d --build
```

## Шаг 4: Миграция базы данных (если есть)

### С существующего сервера:

```bash
# На старом сервере - создайте бэкап
pg_dump -U postgres -h localhost 5lb_db > /tmp/5lb_backup.sql

# Скопируйте на новый сервер
scp /tmp/5lb_backup.sql root@новый_сервер:/root/
```

### На новом сервере:

```bash
# Восстановите базу
./docker-restore.sh /root/5lb_backup.sql

# Перезапустите сервисы
docker-compose restart backend crm-backend
```

## Проверка

```bash
# Статус всех контейнеров
docker-compose ps

# Логи
docker-compose logs -f

# Здоровье сервисов
docker inspect --format='{{.State.Health.Status}}' 5lb-backend
docker inspect --format='{{.State.Health.Status}}' 5lb-postgres
```

## Полезные команды

```bash
# Остановить все
docker-compose down

# Перезапустить конкретный сервис
docker-compose restart backend

# Бэкап базы
./docker-backup.sh

# Просмотр логов
docker-compose logs -f backend
docker-compose logs -f postgres

# Мониторинг ресурсов
docker stats
```

## SSL сертификаты (для production)

```bash
# Установите certbot
apt install certbot -y

# Получите сертификаты
certbot certonly --standalone -d app.5lb.pro -d crm.5lb.pro

# Раскомментируйте HTTPS блоки в nginx/docker-app.conf и nginx/docker-crm.conf

# Перезапустите nginx
docker-compose restart nginx
```

## Troubleshooting

### Контейнер не запускается

```bash
docker-compose logs <service_name>
docker-compose build --no-cache <service_name>
```

### База данных недоступна

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Порты заняты

```bash
# Проверьте, какие процессы используют порты
netstat -tulpn | grep -E '(80|443|60003|60000|60001)'

# Остановите PM2 если он запущен
pm2 stop all
pm2 delete all
```

## Подробная документация

Смотрите [DOCKER.md](./DOCKER.md) для полной документации.
