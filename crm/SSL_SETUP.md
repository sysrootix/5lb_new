# Настройка SSL сертификатов для crm.5lb.pro

Для получения бесплатных SSL сертификатов от Let's Encrypt используйте утилиту `certbot`.

## 1. Установка Certbot (если не установлен)

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

## 2. Получение сертификата

Запустите команду:

```bash
sudo certbot --nginx -d crm.5lb.pro
```

Следуйте инструкциям на экране. Certbot автоматически внесет изменения в конфигурацию Nginx.

## 3. Проверка автообновления

Сертификаты Let's Encrypt действительны 90 дней. Проверьте таймер обновления:

```bash
sudo systemctl status certbot.timer
```

## 4. Применение конфигурации Nginx

Если вы использовали готовый файл `crm/nginx.conf`, скопируйте его в `/etc/nginx/sites-available/` и создайте ссылку:

```bash
sudo cp /root/5lb/crm/nginx.conf /etc/nginx/sites-available/crm.5lb.pro
sudo ln -s /etc/nginx/sites-available/crm.5lb.pro /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Важно:** В файле `crm/nginx.conf` пути к сертификатам закомментированы. При первом запуске `certbot` может сам добавить нужные строки. Если вы настраиваете вручную, раскомментируйте строки `ssl_certificate` и `ssl_certificate_key` после получения сертификатов.

