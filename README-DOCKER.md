# 5LB Docker Setup

Полная Docker-композиция для проекта 5LB с PostgreSQL, Backend, CRM и Frontend.

## 📦 Что включено

- **PostgreSQL 16** - база данных
- **Backend API** - основной API (порт 60000)
- **CRM Backend API** - CRM API (порт 60001)
- **Frontend** - основное веб-приложение
- **CRM Frontend** - CRM веб-интерфейс
- **Nginx** - reverse proxy для всех сервисов

## 🚀 Быстрый старт

### 1. Установите Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
apt install docker-compose-plugin -y
```

### 2. Настройте переменные окружения

```bash
cp .env.example .env
nano .env  # Заполните все переменные
```

### 3. Запустите

```bash
./docker-deploy.sh
```

Или вручную:

```bash
docker-compose up -d --build
```

## 📁 Структура файлов

```
5lb/
├── docker-compose.yml           # Production конфигурация
├── docker-compose.dev.yml       # Development конфигурация
├── .env.example                 # Пример переменных окружения
├── docker-deploy.sh             # Скрипт деплоя
├── docker-backup.sh             # Скрипт бэкапа БД
├── docker-restore.sh            # Скрипт восстановления БД
├── DOCKER.md                    # Полная документация
├── DOCKER-QUICK-START.md        # Краткое руководство
├── backend/
│   ├── Dockerfile              # Production образ
│   ├── Dockerfile.dev          # Development образ
│   └── .dockerignore
├── frontend/
│   ├── Dockerfile
│   └── .dockerignore
├── crm/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── ...
└── nginx/
    ├── docker-nginx.conf        # Основная конфигурация Nginx
    ├── docker-app.conf          # Конфигурация для app.5lb.pro
    └── docker-crm.conf          # Конфигурация для crm.5lb.pro
```

## 🔧 Команды

### Основные команды

```bash
# Запуск всех сервисов
docker-compose up -d

# Остановка
docker-compose down

# Просмотр логов
docker-compose logs -f

# Статус контейнеров
docker-compose ps

# Перезапуск конкретного сервиса
docker-compose restart backend
```

### Скрипты

```bash
# Деплой с опциями
./docker-deploy.sh --rebuild --backup

# Создать бэкап базы данных
./docker-backup.sh

# Восстановить из бэкапа
./docker-restore.sh backups/5lb_backup_20250101.sql
```

### Работа с БД

```bash
# Подключение к PostgreSQL
docker exec -it 5lb-postgres psql -U postgres -d 5lb_db

# Создание бэкапа
docker exec 5lb-postgres pg_dump -U postgres 5lb_db > backup.sql

# Восстановление
docker exec -i 5lb-postgres psql -U postgres 5lb_db < backup.sql
```

## 🔄 Миграция с существующего сервера

### Шаг 1: На старом сервере

```bash
# Создайте бэкап базы данных
pg_dump -U postgres -h localhost 5lb_db > /tmp/5lb_backup.sql

# Скопируйте на новый сервер
scp /tmp/5lb_backup.sql root@новый_сервер:/root/
```

### Шаг 2: На новом сервере

```bash
# Клонируйте/скопируйте проект
cd /root/5lb

# Настройте .env
cp .env.example .env
nano .env

# Запустите PostgreSQL
docker-compose up -d postgres

# Восстановите базу
./docker-restore.sh /root/5lb_backup.sql

# Запустите все сервисы
docker-compose up -d
```

## 🌐 Настройка доменов

### Без SSL (development)

Приложения будут доступны на:
- http://app.5lb.pro
- http://crm.5lb.pro

### С SSL (production)

```bash
# Установите certbot
apt install certbot -y

# Получите сертификаты
certbot certonly --standalone -d app.5lb.pro -d crm.5lb.pro

# Раскомментируйте HTTPS блоки в:
# - nginx/docker-app.conf
# - nginx/docker-crm.conf

# Перезапустите nginx
docker-compose restart nginx
```

## 📊 Мониторинг

```bash
# Статус и использование ресурсов
docker stats

# Логи всех сервисов
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f backend

# Проверка healthcheck
docker inspect --format='{{.State.Health.Status}}' 5lb-backend
```

## 🛠️ Development режим

Для разработки с hot reload:

```bash
docker-compose -f docker-compose.dev.yml up
```

В dev режиме:
- Frontend доступен на http://localhost:5173
- CRM Frontend на http://localhost:5174
- Backend на http://localhost:60000
- CRM Backend на http://localhost:60001
- PostgreSQL на localhost:5432

## 🔐 Безопасность

1. ✅ Используйте сильные пароли в `.env`
2. ✅ Никогда не коммитьте `.env` в git
3. ✅ Используйте SSL в production
4. ✅ Регулярно обновляйте Docker образы
5. ✅ Делайте регулярные бэкапы БД

## 📚 Документация

- [DOCKER.md](./DOCKER.md) - полная документация по Docker
- [DOCKER-QUICK-START.md](./DOCKER-QUICK-START.md) - краткое руководство
- [DEPLOYMENT.md](./DEPLOYMENT.md) - общая документация по деплою

## 🐛 Troubleshooting

### Контейнер не запускается

```bash
docker-compose logs <service_name>
docker-compose build --no-cache <service_name>
docker-compose up -d <service_name>
```

### База данных недоступна

```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Порты уже заняты

```bash
# Проверьте, что использует порты
netstat -tulpn | grep -E '(80|443|5432|60000|60001)'

# Остановите PM2 если он запущен
pm2 stop all
pm2 delete all
```

### Проблемы с сетью

```bash
docker-compose down
docker-compose up -d
```

## 🔄 Обновление

### Обновление кода

```bash
git pull
docker-compose restart backend frontend
```

### Полная пересборка

```bash
./docker-deploy.sh --rebuild
```

## 📦 Volumes

Постоянные данные хранятся в:
- `postgres_data` - база данных PostgreSQL
- `./backend/uploads` - загруженные файлы

### Бэкап volumes

```bash
docker run --rm -v 5lb_postgres_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/postgres_data.tar.gz /data
```

## 🧹 Очистка

```bash
# Удалить неиспользуемые контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune -a

# Удалить неиспользуемые volumes (ОСТОРОЖНО!)
docker volume prune

# Полная очистка
docker system prune -a --volumes
```

## 📞 Поддержка

При проблемах:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте статус: `docker-compose ps`
3. Проверьте healthcheck: `docker inspect <container_name>`
4. Пересоберите: `docker-compose build --no-cache`

## 📝 TODO

- [ ] Добавить мониторинг (Prometheus + Grafana)
- [ ] Добавить CI/CD pipeline
- [ ] Настроить автоматические бэкапы
- [ ] Добавить rate limiting
- [ ] Настроить log rotation
